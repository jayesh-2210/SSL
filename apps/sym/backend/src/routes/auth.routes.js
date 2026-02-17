import { Router } from 'express';
import { register, login, rotateRefreshToken, revokeRefreshToken, authMiddleware } from '@sym/backend-auth';
import { registerSchema, loginSchema, refreshTokenSchema } from '@sym/fnd-validation';
import { validate } from '../middleware/validate.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const result = await register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

authRoutes.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const result = await login(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});

authRoutes.post('/refresh', validate(refreshTokenSchema), async (req, res, next) => {
    try {
        const tokens = await rotateRefreshToken(req.body.refreshToken);
        res.json({ success: true, data: tokens });
    } catch (err) {
        next(err);
    }
});

authRoutes.post('/logout', authMiddleware, async (req, res, next) => {
    try {
        await revokeRefreshToken(req.body.refreshToken);
        res.json({ success: true, data: { message: 'Logged out' } });
    } catch (err) {
        next(err);
    }
});
