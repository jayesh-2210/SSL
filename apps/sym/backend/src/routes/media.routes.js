import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '@sym/backend-auth';
import { Media } from '@sym/backend-db';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('media-routes');

// Ensure uploads dir exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        const allowed = /image|video|audio|text|application/;
        cb(null, allowed.test(file.mimetype));
    },
});

export const mediaRoutes = Router();
mediaRoutes.use(authMiddleware);

// Upload a file
mediaRoutes.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        }

        const typeMap = (mime) => {
            if (mime.startsWith('image/')) return 'image';
            if (mime.startsWith('video/')) return 'video';
            if (mime.startsWith('audio/')) return 'audio';
            return 'text';
        };

        const media = await Media.create({
            projectId: req.body.projectId || '000000000000000000000000',
            uploadedBy: req.userId,
            type: typeMap(req.file.mimetype),
            filename: req.file.originalname,
            storageKey: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
        });

        log.info('File uploaded', { mediaId: media._id, filename: media.filename });
        res.status(201).json({ success: true, data: media });
    } catch (err) {
        next(err);
    }
});

// List user's media
mediaRoutes.get('/', async (req, res, next) => {
    try {
        const media = await Media.find({ uploadedBy: req.userId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: media });
    } catch (err) {
        next(err);
    }
});

// Delete media
mediaRoutes.delete('/:id', async (req, res, next) => {
    try {
        const media = await Media.findOneAndDelete({ _id: req.params.id, uploadedBy: req.userId });
        if (!media) {
            return res.status(404).json({ success: false, error: { message: 'Media not found' } });
        }

        // Try to delete file from disk
        const filePath = path.join(uploadDir, media.storageKey);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        log.info('Media deleted', { mediaId: media._id });
        res.json({ success: true, data: { deleted: true } });
    } catch (err) {
        next(err);
    }
});

// Serve uploaded files
mediaRoutes.get('/file/:key', (req, res) => {
    const filePath = path.join(uploadDir, req.params.key);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: { message: 'File not found' } });
    }
    res.sendFile(filePath);
});
