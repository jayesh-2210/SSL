import mongoose from 'mongoose';
import { config } from '@sym/fnd-config';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('db');

// ─── Connection ─────────────────────────────────────

export async function connectDB() {
    try {
        await mongoose.connect(config.db.uri, { serverSelectionTimeoutMS: 3000 });
        log.info('MongoDB connected', { uri: config.db.uri.replace(/\/\/.*@/, '//<credentials>@') });
    } catch (_err) {
        log.warn('Could not connect to MongoDB — starting in-memory server for development');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const memUri = mongod.getUri();
            await mongoose.connect(memUri);
            log.info('In-memory MongoDB started', { uri: memUri });
        } catch (memErr) {
            log.error('MongoDB connection failed', { error: memErr.message });
            process.exit(1);
        }
    }
}

export async function disconnectDB() {
    await mongoose.disconnect();
    log.info('MongoDB disconnected');
}

// ─── User Model ─────────────────────────────────────

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        auth0Id: { type: String, unique: true, sparse: true },
        name: { type: String, required: true, trim: true },
        avatar: { type: String },
        preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

userSchema.methods.toSafe = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

export const User = mongoose.model('User', userSchema);

// ─── Project Model ──────────────────────────────────

const projectSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        status: { type: String, enum: ['active', 'archived', 'deleted'], default: 'active' },
        settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);

// ─── Media Model ────────────────────────────────────

const mediaSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['image', 'video', 'audio', 'text'], required: true },
        filename: { type: String, required: true },
        storageKey: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

export const Media = mongoose.model('Media', mediaSchema);

// ─── AI Job Model ───────────────────────────────────

const aiJobSchema = new mongoose.Schema(
    {
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, required: true },
        model: { type: String, required: true },
        provider: { type: String, enum: ['replicate', 'gemini'], required: true },
        status: {
            type: String,
            enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'queued',
            index: true,
        },
        input: { type: mongoose.Schema.Types.Mixed, required: true },
        output: { type: mongoose.Schema.Types.Mixed },
        duration: { type: Number },
        cost: { type: Number },
        error: { type: String },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

export const AIJob = mongoose.model('AIJob', aiJobSchema);

// ─── Generation Model ───────────────────────────────

const generationSchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIJob', required: true, index: true },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
        prompt: { type: String, required: true },
        params: { type: mongoose.Schema.Types.Mixed, default: {} },
        outputs: [{ type: String }],
        rating: { type: Number, min: 1, max: 5 },
    },
    { timestamps: true }
);

export const Generation = mongoose.model('Generation', generationSchema);

// ─── Refresh Token Model ────────────────────────────

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
        revoked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

// ─── Export all models ──────────────────────────────

export const models = { User, Project, Media, AIJob, Generation, RefreshToken };
export default models;
