import { Router } from 'express';
import { authMiddleware } from '@sym/backend-auth';
import { generateSchema } from '@sym/fnd-validation';
import { validate } from '../middleware/validate.js';
import { aiQueue } from '@sym/backend-queue';
import { AIJob } from '@sym/backend-db';
import { listModels as listReplicateModels } from '@sym/backend-ai-replicate';
import { listModels as listGeminiModels } from '@sym/backend-ai-gemini';

export const aiRoutes = Router();

aiRoutes.use(authMiddleware);

// Submit a generation job
aiRoutes.post('/generate', validate(generateSchema), async (req, res, next) => {
    try {
        const { provider, model, input, projectId } = req.body;

        // Create job record
        const job = await AIJob.create({
            projectId,
            createdBy: req.userId,
            type: 'generate',
            model,
            provider,
            status: 'queued',
            input,
        });

        // Enqueue for processing
        await aiQueue.add('ai-generate', {
            jobId: job._id.toString(),
            provider,
            model,
            input,
        });

        res.status(202).json({
            success: true,
            data: { jobId: job._id, status: 'queued' },
        });
    } catch (err) {
        next(err);
    }
});

// Get job status
aiRoutes.get('/jobs/:id', async (req, res, next) => {
    try {
        const job = await AIJob.findOne({ _id: req.params.id, createdBy: req.userId });
        if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
        res.json({ success: true, data: job });
    } catch (err) {
        next(err);
    }
});

// List user's jobs
aiRoutes.get('/jobs', async (req, res, next) => {
    try {
        const jobs = await AIJob.find({ createdBy: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: jobs });
    } catch (err) {
        next(err);
    }
});

// List available models
aiRoutes.get('/models', async (_req, res, next) => {
    try {
        const [replicate, gemini] = await Promise.all([
            listReplicateModels(),
            listGeminiModels(),
        ]);
        res.json({ success: true, data: [...replicate, ...gemini] });
    } catch (err) {
        next(err);
    }
});
