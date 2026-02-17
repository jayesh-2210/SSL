import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from workspace root
dotenv.config({ path: resolve(process.cwd(), '.env') });

/**
 * Get an environment variable, throw if required and missing.
 * @param {string} key
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function env(key, defaultValue) {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Application configuration — single source of truth.
 */
export const config = {
  nodeEnv: env('NODE_ENV', 'development'),
  port: parseInt(env('PORT', '4000'), 10),
  frontendUrl: env('FRONTEND_URL', 'http://localhost:5173'),

  db: {
    uri: env('MONGODB_URI', 'mongodb://localhost:27017/sym-dev'),
  },

  redis: {
    url: env('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: env('JWT_SECRET', 'dev-secret-change-me'),
    expiry: env('JWT_EXPIRY', '15m'),
    refreshExpiry: env('REFRESH_TOKEN_EXPIRY', '7d'),
  },

  auth0: {
    domain: env('AUTH0_DOMAIN', ''),
    clientId: env('AUTH0_CLIENT_ID', ''),
    clientSecret: env('AUTH0_CLIENT_SECRET', ''),
    audience: env('AUTH0_AUDIENCE', ''),
  },

  ai: {
    replicateToken: env('REPLICATE_API_TOKEN', ''),
    geminiApiKey: env('GEMINI_API_KEY', ''),
  },

  storage: {
    provider: env('STORAGE_PROVIDER', 'local'),
    s3: {
      bucket: env('S3_BUCKET', ''),
      region: env('S3_REGION', 'us-east-1'),
      accessKey: env('S3_ACCESS_KEY', ''),
      secretKey: env('S3_SECRET_KEY', ''),
    },
  },

  log: {
    level: env('LOG_LEVEL', 'debug'),
  },
};

export default config;
