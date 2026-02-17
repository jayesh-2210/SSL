import { createLogger } from '@sym/fnd-logger';
import { AIJob } from '@sym/backend-db';
import { runPrediction } from '@sym/backend-ai-replicate';
import { generateContent } from '@sym/backend-ai-gemini';

const log = createLogger('ai-processor');

/**
 * Process an AI generation job.
 * @param {Object} job
 * @param {Object} job.data - { jobId, provider, model, input }
 */
export async function processAIJob(job) {
    const { jobId, provider, model, input } = job.data;
    const startTime = Date.now();

    log.info('Processing AI job', { jobId, provider, model });

    try {
        // Update status to processing
        await AIJob.findByIdAndUpdate(jobId, { status: 'processing' });

        let output;

        switch (provider) {
            case 'replicate': {
                const result = await runPrediction(model, input);
                output = result.output;
                break;
            }

            case 'gemini': {
                const result = await generateContent(input.prompt, { model });
                output = { text: result.text, usage: result.usage };
                break;
            }

            default:
                throw new Error(`Unknown AI provider: ${provider}`);
        }

        const duration = Date.now() - startTime;

        // Update job record with results
        await AIJob.findByIdAndUpdate(jobId, {
            status: 'completed',
            output,
            duration,
            completedAt: new Date(),
        });

        log.info('AI job completed', { jobId, provider, duration: `${duration}ms` });
        return { jobId, output, duration };
    } catch (err) {
        const duration = Date.now() - startTime;

        await AIJob.findByIdAndUpdate(jobId, {
            status: 'failed',
            error: err.message,
            duration,
            completedAt: new Date(),
        });

        log.error('AI job failed', { jobId, provider, error: err.message, duration: `${duration}ms` });
        throw err;
    }
}
