import React from 'react';
import { useSnapshot } from 'valtio';
import { Card, Input, Button, Modal } from '@sym/frontend-ui';
import { authStore } from '@sym/frontend-state';
import { useForm, useApi } from '@sym/frontend-hooks';
import { useState } from 'react';

export function SettingsPage() {
    const { user } = useSnapshot(authStore);
    const api = useApi();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saved, setSaved] = useState(false);

    const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
        name: user?.name || '',
        email: user?.email || '',
    });

    const onSubmit = handleSubmit(async (data) => {
        const res = await api.patch('/users/me', { name: data.name });
        authStore.setAuth(res.data, authStore.accessToken);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    });

    const handleLogout = () => {
        authStore.clearAuth();
        window.location.href = '/login';
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await api.del('/users/me');
            authStore.clearAuth();
            window.location.href = '/login';
        } catch (_) {
            setDeleting(false);
        }
    };

    return (
        <div>
            <h1>Settings</h1>

            {/* Profile Section */}
            <h2 style={{ fontSize: '1.125rem', marginTop: '2rem', marginBottom: '1rem' }}>Profile</h2>
            <Card style={{ maxWidth: '540px' }}>
                <Card.Body>
                    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} />
                        <Input label="Email" name="email" value={values.email} disabled />
                        {errors._form && <p style={{ color: '#ef4444', fontSize: '0.8125rem', margin: 0 }}>{errors._form}</p>}
                        {saved && <p style={{ color: '#22c55e', fontSize: '0.8125rem', margin: 0 }}>✓ Changes saved successfully</p>}
                        <Button type="submit" loading={isSubmitting}>Save Changes</Button>
                    </form>
                </Card.Body>
            </Card>

            {/* Appearance Section */}
            <h2 style={{ fontSize: '1.125rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Appearance</h2>
            <Card style={{ maxWidth: '540px' }}>
                <Card.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 500, margin: '0 0 0.25rem' }}>Theme</p>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                                Currently using dark mode
                            </p>
                        </div>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                        }}>
                            Dark
                        </span>
                    </div>
                </Card.Body>
            </Card>

            {/* Account Section */}
            <h2 style={{ fontSize: '1.125rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Account</h2>
            <Card style={{ maxWidth: '540px' }}>
                <Card.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 500, margin: '0 0 0.25rem' }}>Log Out</p>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                                Sign out of your account on this device
                            </p>
                        </div>
                        <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Danger Zone */}
            <h2 style={{ fontSize: '1.125rem', marginTop: '2.5rem', marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h2>
            <Card style={{
                maxWidth: '540px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
                <Card.Body>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 500, margin: '0 0 0.25rem' }}>Delete Account</p>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Delete Account Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
                <p style={{ marginBottom: '1.5rem' }}>
                    Are you sure you want to <strong>permanently delete</strong> your account? All your projects, media,
                    and data will be lost forever. This action cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>Delete Forever</Button>
                </div>
            </Modal>
        </div>
    );
}
