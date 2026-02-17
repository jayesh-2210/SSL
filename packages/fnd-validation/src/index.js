import { z } from 'zod';

// ─── Primitives ─────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters');

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Auth Schemas ───────────────────────────────────

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(1, 'Name is required').max(100).trim(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Project Schemas ────────────────────────────────

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(200).trim(),
    description: z.string().max(2000).optional(),
    settings: z.record(z.unknown()).optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'archived']).optional(),
    settings: z.record(z.unknown()).optional(),
});

// ─── AI Job Schemas ─────────────────────────────────

export const generateSchema = z.object({
    projectId: objectIdSchema,
    provider: z.enum(['replicate', 'gemini']),
    model: z.string().min(1, 'Model is required'),
    input: z.object({
        prompt: z.string().min(1, 'Prompt is required').max(10000),
    }).passthrough(),
    params: z.record(z.unknown()).optional(),
});

// ─── User Schemas ───────────────────────────────────

export const updateUserSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    avatar: z.string().url().optional(),
    preferences: z.record(z.unknown()).optional(),
});

// ─── Re-export Zod for consumers ────────────────────

export { z };
