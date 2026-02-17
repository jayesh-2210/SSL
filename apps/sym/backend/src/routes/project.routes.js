import { Router } from 'express';
import { authMiddleware } from '@sym/backend-auth';
import { createProject, getProjectsByUser, getProjectById, updateProject, deleteProject } from '@sym/backend-project';
import { createProjectSchema, updateProjectSchema, paginationSchema } from '@sym/fnd-validation';
import { validate } from '../middleware/validate.js';

export const projectRoutes = Router();

projectRoutes.use(authMiddleware);

projectRoutes.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
    try {
        const result = await getProjectsByUser(req.userId, req.query);
        res.json({ success: true, data: result.projects, meta: result.meta });
    } catch (err) {
        next(err);
    }
});

projectRoutes.post('/', validate(createProjectSchema), async (req, res, next) => {
    try {
        const project = await createProject(req.userId, req.body);
        res.status(201).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
});

projectRoutes.get('/:id', async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.id, req.userId);
        res.json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
});

projectRoutes.patch('/:id', validate(updateProjectSchema), async (req, res, next) => {
    try {
        const project = await updateProject(req.params.id, req.userId, req.body);
        res.json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
});

projectRoutes.delete('/:id', async (req, res, next) => {
    try {
        const result = await deleteProject(req.params.id, req.userId);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
});
