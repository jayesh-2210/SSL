import { createLogger } from '@sym/fnd-logger';
import { EventEmitter } from 'events';

const log = createLogger('queue');

/**
 * In-memory job queue for development.
 * Replace with BullMQ + Redis for production.
 */
class JobQueue extends EventEmitter {
    constructor(name) {
        super();
        this.name = name;
        this.jobs = new Map();
        this.processors = new Map();
        this.jobCounter = 0;
    }

    /**
     * Register a processor for a job type.
     * @param {string} type
     * @param {Function} handler - async (job) => result
     */
    process(type, handler) {
        this.processors.set(type, handler);
        log.info(`Processor registered for "${type}" on queue "${this.name}"`);
    }

    /**
     * Add a job to the queue.
     * @param {string} type
     * @param {Object} data
     * @param {Object} [options]
     * @returns {{ id: string, type: string }}
     */
    async add(type, data, options = {}) {
        const id = `job_${++this.jobCounter}_${Date.now()}`;
        const job = { id, type, data, status: 'queued', createdAt: new Date(), options };
        this.jobs.set(id, job);

        log.info('Job added', { queue: this.name, jobId: id, type });
        this.emit('job:added', job);

        // Process async (simulate queue consumer)
        setImmediate(() => this._processJob(id));

        return { id, type };
    }

    async _processJob(id) {
        const job = this.jobs.get(id);
        if (!job) return;

        const processor = this.processors.get(job.type);
        if (!processor) {
            log.warn(`No processor for job type: ${job.type}`);
            job.status = 'failed';
            job.error = `No processor registered for type: ${job.type}`;
            this.emit('job:failed', job);
            return;
        }

        try {
            job.status = 'processing';
            this.emit('job:processing', job);
            log.info('Processing job', { jobId: id, type: job.type });

            const result = await processor(job);

            job.status = 'completed';
            job.result = result;
            job.completedAt = new Date();
            this.emit('job:completed', job);
            log.info('Job completed', { jobId: id, type: job.type });
        } catch (err) {
            job.status = 'failed';
            job.error = err.message;
            this.emit('job:failed', job);
            log.error('Job failed', { jobId: id, type: job.type, error: err.message });
        }
    }

    /**
     * Get a job by ID.
     * @param {string} id
     * @returns {Object|undefined}
     */
    getJob(id) {
        return this.jobs.get(id);
    }
}

// ─── Default queues ─────────────────────────────────

export const aiQueue = new JobQueue('ai-jobs');
export const mediaQueue = new JobQueue('media-jobs');

/**
 * Create a custom queue.
 * @param {string} name
 * @returns {JobQueue}
 */
export function createQueue(name) {
    return new JobQueue(name);
}

export { JobQueue };
