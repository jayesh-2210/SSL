import { Router } from 'express';
import { authMiddleware } from '@sym/backend-auth';
import { getUserById, updateUser } from '@sym/backend-user';
import { updateUserSchema } from '@sym/fnd-validation';
import { validate } from '../middleware/validate.js';

export const userRoutes = Router();

userRoutes.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await getUserById(req.userId);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

userRoutes.patch('/me', authMiddleware, validate(updateUserSchema), async (req, res, next) => {
    try {
        const user = await updateUser(req.userId, req.body);
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});
