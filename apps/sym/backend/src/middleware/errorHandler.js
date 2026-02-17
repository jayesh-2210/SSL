import { AppError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('error-handler');

/**
 * Global Express error handler.
 */
export function errorHandler(err, req, res, _next) {
    // Operational errors (expected)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            data: null,
            error: err.toJSON(),
        });
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: err.issues,
            },
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
    }

    // Unknown errors
    log.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });

    res.status(500).json({
        success: false,
        data: null,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        },
    });
}
