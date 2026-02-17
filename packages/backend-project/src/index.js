import { Project } from '@sym/backend-db';
import { NotFoundError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('project-service');

export async function createProject(ownerId, data) {
    const project = await Project.create({ ...data, ownerId });
    log.info('Project created', { projectId: project._id, ownerId });
    return project;
}

export async function getProjectsByUser(ownerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
        Project.find({ ownerId, status: { $ne: 'deleted' } })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        Project.countDocuments({ ownerId, status: { $ne: 'deleted' } }),
    ]);
    return { projects, meta: { page, limit, total } };
}

export async function getProjectById(projectId, ownerId) {
    const project = await Project.findOne({ _id: projectId, ownerId });
    if (!project) throw new NotFoundError('Project', projectId);
    return project;
}

export async function updateProject(projectId, ownerId, updates) {
    const project = await Project.findOneAndUpdate(
        { _id: projectId, ownerId },
        updates,
        { new: true, runValidators: true }
    );
    if (!project) throw new NotFoundError('Project', projectId);
    log.info('Project updated', { projectId });
    return project;
}

export async function deleteProject(projectId, ownerId) {
    const project = await Project.findOneAndUpdate(
        { _id: projectId, ownerId },
        { status: 'deleted' },
        { new: true }
    );
    if (!project) throw new NotFoundError('Project', projectId);
    log.info('Project soft-deleted', { projectId });
    return { deleted: true };
}
