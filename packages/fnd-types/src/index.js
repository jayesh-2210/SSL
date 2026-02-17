/**
 * @typedef {'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'} JobStatus
 * @typedef {'replicate' | 'gemini'} AIProvider
 * @typedef {'image' | 'video' | 'audio' | 'text'} MediaType
 * @typedef {'active' | 'archived' | 'deleted'} ProjectStatus
 */

/**
 * Standard API response wrapper.
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {T} [data]
 * @property {{ page: number, limit: number, total: number }} [meta]
 * @property {{ code: string, message: string, details?: any }} [error]
 */

/**
 * User document shape.
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {string} [auth0Id]
 * @property {string} name
 * @property {string} [avatar]
 * @property {Object} [preferences]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Project document shape.
 * @typedef {Object} Project
 * @property {string} _id
 * @property {string} ownerId
 * @property {string} name
 * @property {string} [description]
 * @property {ProjectStatus} status
 * @property {Object} [settings]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Media document shape.
 * @typedef {Object} Media
 * @property {string} _id
 * @property {string} projectId
 * @property {string} uploadedBy
 * @property {MediaType} type
 * @property {string} filename
 * @property {string} storageKey
 * @property {string} mimeType
 * @property {number} size
 * @property {Object} [metadata]
 * @property {Date} createdAt
 */

/**
 * AI Job document shape.
 * @typedef {Object} AIJob
 * @property {string} _id
 * @property {string} projectId
 * @property {string} createdBy
 * @property {string} type
 * @property {string} model
 * @property {AIProvider} provider
 * @property {JobStatus} status
 * @property {Object} input
 * @property {Object} [output]
 * @property {number} [duration]
 * @property {number} [cost]
 * @property {string} [error]
 * @property {Date} createdAt
 * @property {Date} [completedAt]
 */

/**
 * Generation document shape.
 * @typedef {Object} Generation
 * @property {string} _id
 * @property {string} jobId
 * @property {string} projectId
 * @property {string} prompt
 * @property {Object} params
 * @property {string[]} outputs
 * @property {number} [rating]
 * @property {Date} createdAt
 */

export const JOB_STATUSES = /** @type {const} */ ({
    QUEUED: 'queued',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
});

export const AI_PROVIDERS = /** @type {const} */ ({
    REPLICATE: 'replicate',
    GEMINI: 'gemini',
});

export const MEDIA_TYPES = /** @type {const} */ ({
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    TEXT: 'text',
});

export const PROJECT_STATUSES = /** @type {const} */ ({
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
});
