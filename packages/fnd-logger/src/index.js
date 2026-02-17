import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/**
 * Pretty console format for development.
 */
const devFormat = combine(
    colorize({ all: true }),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return stack
            ? `${timestamp} ${level}: ${message}\n${stack}`
            : `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

/**
 * Structured JSON format for production.
 */
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Create a named logger instance.
 * @param {string} name - Logger name (e.g., 'api', 'worker', 'ai')
 * @param {Object} [options]
 * @param {string} [options.level='debug']
 * @returns {winston.Logger}
 */
export function createLogger(name, { level = 'debug' } = {}) {
    const isDev = process.env.NODE_ENV !== 'production';

    return winston.createLogger({
        level,
        defaultMeta: { service: name },
        format: isDev ? devFormat : prodFormat,
        transports: [
            new winston.transports.Console(),
            ...(isDev
                ? []
                : [
                    new winston.transports.File({
                        filename: `logs/${name}-error.log`,
                        level: 'error',
                    }),
                    new winston.transports.File({
                        filename: `logs/${name}-combined.log`,
                    }),
                ]),
        ],
    });
}

/** Default application logger. */
export const logger = createLogger('sym');

export default logger;
