import { config } from '@sym/fnd-config';
import { createLogger } from '@sym/fnd-logger';
import { connectDB } from '@sym/backend-db';
import { aiQueue, mediaQueue } from '@sym/backend-queue';
import { processAIJob } from './processors/ai.processor.js';
import { processMediaJob } from './processors/media.processor.js';

const log = createLogger('worker');

async function start() {
    log.info('Starting SYM Worker Service...');

    // Connect to database
    await connectDB();

    // Register AI job processor
    aiQueue.process('ai-generate', processAIJob);

    // Register media job processor
    mediaQueue.process('media-transcode', processMediaJob);

    // Listen for job events
    aiQueue.on('job:completed', (job) => {
        log.info('AI job completed', { jobId: job.id, type: job.type });
    });

    aiQueue.on('job:failed', (job) => {
        log.error('AI job failed', { jobId: job.id, type: job.type, error: job.error });
    });

    mediaQueue.on('job:completed', (job) => {
        log.info('Media job completed', { jobId: job.id, type: job.type });
    });

    log.info('Worker service ready — listening for jobs');
}

start().catch((err) => {
    log.error('Worker failed to start', { error: err.message });
    process.exit(1);
});
