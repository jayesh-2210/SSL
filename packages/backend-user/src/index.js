import { User } from '@sym/backend-db';
import { NotFoundError } from '@sym/fnd-errors';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('user-service');

export async function getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User', userId);
    return user.toSafe();
}

export async function updateUser(userId, updates) {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) throw new NotFoundError('User', userId);
    log.info('User updated', { userId });
    return user.toSafe();
}

export async function deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new NotFoundError('User', userId);
    log.info('User deleted', { userId });
    return { deleted: true };
}
