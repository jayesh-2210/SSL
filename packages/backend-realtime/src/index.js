import { Server } from 'socket.io';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('realtime');

let io = null;

/**
 * Initialize Socket.io server and attach to an HTTP server.
 * @param {import('http').Server} httpServer
 * @param {Object} [options]
 * @returns {Server}
 */
export function initSocketServer(httpServer, options = {}) {
    io = new Server(httpServer, {
        cors: {
            origin: options.corsOrigin || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    // ─── Project Namespace ──────────────────────────
    const projectNs = io.of('/project');
    projectNs.on('connection', (socket) => {
        log.info('Client connected to /project', { id: socket.id });

        socket.on('user:join', ({ projectId, userId }) => {
            socket.join(`room:project-${projectId}`);
            socket.to(`room:project-${projectId}`).emit('user:presence', {
                userId,
                status: 'online',
                joinedAt: new Date().toISOString(),
            });
            log.info('User joined project room', { userId, projectId });
        });

        socket.on('user:leave', ({ projectId, userId }) => {
            socket.leave(`room:project-${projectId}`);
            socket.to(`room:project-${projectId}`).emit('user:presence', {
                userId,
                status: 'offline',
            });
        });

        socket.on('disconnect', () => {
            log.info('Client disconnected from /project', { id: socket.id });
        });
    });

    // ─── AI Jobs Namespace ──────────────────────────
    const aiNs = io.of('/ai-jobs');
    aiNs.on('connection', (socket) => {
        log.info('Client connected to /ai-jobs', { id: socket.id });

        socket.on('job:subscribe', ({ jobId }) => {
            socket.join(`room:job-${jobId}`);
            log.info('Client subscribed to job', { jobId });
        });

        socket.on('job:unsubscribe', ({ jobId }) => {
            socket.leave(`room:job-${jobId}`);
        });

        socket.on('disconnect', () => {
            log.info('Client disconnected from /ai-jobs', { id: socket.id });
        });
    });

    // ─── Notifications Namespace ────────────────────
    const notifyNs = io.of('/notifications');
    notifyNs.on('connection', (socket) => {
        log.info('Client connected to /notifications', { id: socket.id });

        socket.on('subscribe', ({ userId }) => {
            socket.join(`room:user-${userId}`);
        });

        socket.on('disconnect', () => {
            log.info('Client disconnected from /notifications', { id: socket.id });
        });
    });

    log.info('Socket.io server initialized with 3 namespaces');
    return io;
}

/** Get the Socket.io server instance. */
export function getIO() {
    if (!io) throw new Error('Socket.io not initialized. Call initSocketServer first.');
    return io;
}

/** Emit an event to a specific job room. */
export function emitToJob(jobId, event, data) {
    getIO().of('/ai-jobs').to(`room:job-${jobId}`).emit(event, data);
}

/** Emit an event to a specific project room. */
export function emitToProject(projectId, event, data) {
    getIO().of('/project').to(`room:project-${projectId}`).emit(event, data);
}

/** Emit a notification to a specific user. */
export function emitToUser(userId, event, data) {
    getIO().of('/notifications').to(`room:user-${userId}`).emit(event, data);
}
