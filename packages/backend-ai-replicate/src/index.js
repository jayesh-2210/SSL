import Replicate from 'replicate';
import { config } from '@sym/fnd-config';
import { ExternalServiceError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('ai-replicate');

let client = null;

function getClient() {
    if (!client) {
        client = new Replicate({ auth: config.ai.replicateToken });
    }
    return client;
}

/**
 * Available Replicate models — add more as needed.
 */
export const REPLICATE_MODELS = {
    SDXL: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    REAL_ESRGAN: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
};

/**
 * Run a Replicate prediction (async — polls until completion).
 * @param {string} model - Model version string (owner/model:version)
 * @param {Object} input - Model input parameters
 * @param {Function} [onProgress] - Progress callback
 * @returns {Promise<Object>} Prediction result
 */
export async function runPrediction(model, input, onProgress) {
    try {
        log.info('Starting Replicate prediction', { model });
        const replicate = getClient();

        const prediction = await replicate.predictions.create({
            version: model.split(':')[1],
            input,
        });

        log.info('Prediction created', { id: prediction.id, status: prediction.status });

        // Poll for completion
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed' && result.status !== 'canceled') {
            await new Promise((r) => setTimeout(r, 2000));
            result = await replicate.predictions.get(prediction.id);

            if (onProgress) {
                onProgress({ id: result.id, status: result.status, logs: result.logs });
            }
        }

        if (result.status === 'failed') {
            throw new ExternalServiceError('Replicate', result.error || 'Prediction failed');
        }

        log.info('Prediction completed', { id: result.id, status: result.status });
        return {
            id: result.id,
            status: result.status,
            output: result.output,
            metrics: result.metrics,
        };
    } catch (err) {
        if (err instanceof ExternalServiceError) throw err;
        log.error('Replicate error', { error: err.message });
        throw new ExternalServiceError('Replicate', err.message);
    }
}

/**
 * List available models from Replicate.
 */
export async function listModels() {
    return Object.entries(REPLICATE_MODELS).map(([key, value]) => ({
        id: key,
        version: value,
        provider: 'replicate',
    }));
}
