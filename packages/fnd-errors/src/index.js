/**
 * Base application error with HTTP status code and error code.
 */
export class AppError extends Error {
    /**
     * @param {string} message
     * @param {number} statusCode
     * @param {string} code
     * @param {any} [details]
     */
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            ...(this.details && { details: this.details }),
        };
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource', id = '') {
        super(`${resource}${id ? ` (${id})` : ''} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT_ERROR');
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_ERROR');
        this.name = 'RateLimitError';
    }
}

export class ExternalServiceError extends AppError {
    constructor(service, message = 'External service error') {
        super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}
