import { User } from '@sym/backend-db';
import { hashPassword } from '@sym/backend-auth';
import { createLogger } from '@sym/fnd-logger';

const log = createLogger('seed');

const TEST_USER = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test1234!',
};

export async function seedDatabase() {
    try {
        const existing = await User.findOne({ email: TEST_USER.email });
        if (existing) {
            log.info('Test user already exists, skipping seed', { email: TEST_USER.email });
            return;
        }

        const passwordHash = await hashPassword(TEST_USER.password);
        await User.create({
            email: TEST_USER.email,
            passwordHash,
            name: TEST_USER.name,
        });

        log.info('🌱 Test user created', {
            email: TEST_USER.email,
            password: TEST_USER.password,
        });
    } catch (err) {
        log.warn('Seed failed (non-fatal)', { error: err.message });
    }
}
