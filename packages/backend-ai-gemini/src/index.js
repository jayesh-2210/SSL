import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@sym/fnd-config';
import { ExternalServiceError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('ai-gemini');

let genAI = null;

function getClient() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
    }
    return genAI;
}

/**
 * Available Gemini models.
 */
export const GEMINI_MODELS = {
    FLASH: 'gemini-2.0-flash',
    PRO: 'gemini-2.0-pro',
};

/**
 * Generate content (non-streaming).
 * @param {string} prompt
 * @param {Object} [options]
 * @param {string} [options.model='gemini-2.0-flash']
 * @returns {Promise<{ text: string, usage: Object }>}
 */
export async function generateContent(prompt, { model = GEMINI_MODELS.FLASH } = {}) {
    try {
        log.info('Generating content', { model, promptLength: prompt.length });
        const genModel = getClient().getGenerativeModel({ model });
        const result = await genModel.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        log.info('Content generated', { model, responseLength: text.length });
        return {
            text,
            usage: response.usageMetadata || {},
        };
    } catch (err) {
        log.error('Gemini error', { error: err.message });
        throw new ExternalServiceError('Gemini', err.message);
    }
}

/**
 * Generate content with streaming (returns async iterator of text chunks).
 * @param {string} prompt
 * @param {Object} [options]
 * @param {string} [options.model='gemini-2.0-flash']
 * @returns {AsyncGenerator<string>}
 */
export async function* streamContent(prompt, { model = GEMINI_MODELS.FLASH } = {}) {
    try {
        log.info('Streaming content', { model, promptLength: prompt.length });
        const genModel = getClient().getGenerativeModel({ model });
        const result = await genModel.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) yield text;
        }

        log.info('Stream complete', { model });
    } catch (err) {
        log.error('Gemini stream error', { error: err.message });
        throw new ExternalServiceError('Gemini', err.message);
    }
}

/**
 * List available Gemini models.
 */
export async function listModels() {
    return Object.entries(GEMINI_MODELS).map(([key, value]) => ({
        id: key,
        model: value,
        provider: 'gemini',
    }));
}
