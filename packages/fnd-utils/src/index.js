import { randomBytes, createHash } from 'crypto';
import { nanoid } from 'nanoid';

// ─── ID Generation ──────────────────────────────────

/** Generate a short unique ID (default 12 chars). */
export const generateId = (size = 12) => nanoid(size);

/** Generate a cryptographically secure random hex string. */
export const randomHex = (bytes = 32) => randomBytes(bytes).toString('hex');

// ─── String Utilities ───────────────────────────────

/** Slugify a string (lowercase, hyphens, no special chars). */
export function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** Truncate a string with ellipsis. */
export function truncate(str, maxLength = 100) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

/** Capitalize first letter. */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Date Utilities ─────────────────────────────────

/** Convert ms duration to human-readable string. */
export function humanDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

/** Get relative time string (e.g., "2 hours ago"). */
export function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];
    for (const { label, seconds: s } of intervals) {
        const count = Math.floor(seconds / s);
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}

// ─── Hashing ────────────────────────────────────────

/** SHA-256 hash of a string. */
export function sha256(str) {
    return createHash('sha256').update(str).digest('hex');
}

// ─── Object Utilities ───────────────────────────────

/** Remove undefined/null values from an object. */
export function compact(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );
}

/** Sleep for ms. */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry an async function with exponential backoff. */
export async function retry(fn, { maxRetries = 3, baseDelay = 1000 } = {}) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn(attempt);
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                await sleep(baseDelay * Math.pow(2, attempt));
            }
        }
    }
    throw lastError;
}
