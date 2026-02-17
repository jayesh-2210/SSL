import { mkdirSync, existsSync, createReadStream, unlinkSync } from 'fs';
import { join, extname } from 'path';
import multer from 'multer';
import { config } from '@sym/fnd-config';
import { createLogger } from '@sym/fnd-logger';
import { generateId } from '@sym/fnd-utils';

const log = createLogger('storage');

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Local Storage Provider ─────────────────────────

const localStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = extname(file.originalname);
        const name = `${Date.now()}-${generateId(8)}${ext}`;
        cb(null, name);
    },
});

/**
 * Multer upload middleware (local storage).
 */
export const upload = multer({
    storage: localStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/webm',
            'audio/mpeg', 'audio/wav', 'audio/ogg',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
    },
});

/**
 * Get file stream for serving.
 * @param {string} storageKey
 * @returns {ReadStream}
 */
export function getFileStream(storageKey) {
    const filePath = join(UPLOAD_DIR, storageKey);
    return createReadStream(filePath);
}

/**
 * Delete a file from local storage.
 * @param {string} storageKey
 */
export function deleteFile(storageKey) {
    const filePath = join(UPLOAD_DIR, storageKey);
    if (existsSync(filePath)) {
        unlinkSync(filePath);
        log.info('File deleted', { storageKey });
    }
}

/**
 * Get the full path for a storage key.
 * @param {string} storageKey
 * @returns {string}
 */
export function getFilePath(storageKey) {
    return join(UPLOAD_DIR, storageKey);
}

// TODO: Add S3/GCS storage provider when STORAGE_PROVIDER !== 'local'
