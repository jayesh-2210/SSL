import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@sym/fnd-config';
import { AuthenticationError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';
import { User, RefreshToken } from '@sym/backend-db';
import { randomHex } from '@sym/fnd-utils';

const log = createLogger('auth');

// ─── Password Hashing ──────────────────────────────

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// ─── JWT ────────────────────────────────────────────

export function signAccessToken(userId) {
    return jwt.sign({ sub: userId }, config.jwt.secret, { expiresIn: config.jwt.expiry });
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (err) {
        throw new AuthenticationError('Invalid or expired token');
    }
}

// ─── Refresh Tokens ─────────────────────────────────

export async function createRefreshToken(userId) {
    const token = randomHex(64);
    const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiry));

    await RefreshToken.create({ userId, token, expiresAt });
    return token;
}

export async function rotateRefreshToken(oldToken) {
    const record = await RefreshToken.findOne({ token: oldToken, revoked: false });

    if (!record || record.expiresAt < new Date()) {
        throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Revoke old token
    record.revoked = true;
    await record.save();

    // Issue new pair
    const accessToken = signAccessToken(record.userId.toString());
    const refreshToken = await createRefreshToken(record.userId);

    return { accessToken, refreshToken };
}

export async function revokeRefreshToken(token) {
    await RefreshToken.updateOne({ token }, { revoked: true });
}

// ─── Auth Service ───────────────────────────────────

export async function register({ email, password, name }) {
    const existing = await User.findOne({ email });
    if (existing) {
        throw new AuthenticationError('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, name });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await createRefreshToken(user._id);

    log.info('User registered', { userId: user._id, email });
    return { user: user.toSafe(), accessToken, refreshToken };
}

export async function login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AuthenticationError('Invalid credentials');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        throw new AuthenticationError('Invalid credentials');
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = await createRefreshToken(user._id);

    log.info('User logged in', { userId: user._id, email });
    return { user: user.toSafe(), accessToken, refreshToken };
}

// ─── Auth Middleware ────────────────────────────────

export function authMiddleware(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next(new AuthenticationError('Missing authorization header'));
    }

    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
}

// ─── Helpers ────────────────────────────────────────

function parseDuration(str) {
    const match = str.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
    const [, num, unit] = match;
    const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return parseInt(num) * multipliers[unit];
}
