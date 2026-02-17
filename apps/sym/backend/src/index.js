import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { config } from '@sym/fnd-config';
import { createLogger } from '@sym/fnd-logger';
import { connectDB } from '@sym/backend-db';
import { seedDatabase } from './seed.js';
import { initSocketServer } from '@sym/backend-realtime';
import { authRoutes } from './routes/auth.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { projectRoutes } from './routes/project.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { mediaRoutes } from './routes/media.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const log = createLogger('api');
const app = express();
const server = createServer(app);

// ─── Middleware ──────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan('short'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);

// ─── Error Handler ──────────────────────────────────

app.use(errorHandler);

// ─── Start ──────────────────────────────────────────

async function start() {
    // Connect to MongoDB
    await connectDB();

    // Seed test data in development
    if (config.nodeEnv === 'development') {
        await seedDatabase();
    }

    // Initialize Socket.io
    initSocketServer(server, { corsOrigin: config.frontendUrl });

    // Listen
    server.listen(config.port, () => {
        log.info(`🚀 SYM API running on http://localhost:${config.port}`);
        log.info(`   Environment: ${config.nodeEnv}`);
    });
}

start().catch((err) => {
    log.error('Failed to start server', { error: err.message });
    process.exit(1);
});
