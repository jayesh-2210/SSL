import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Spinner } from '@sym/frontend-ui';
import { useApi, useForm } from '@sym/frontend-hooks';
import { useSnapshot } from 'valtio';
import { projectStore } from '@sym/frontend-state';

export function EditorPage() {
    const [selectedId, setSelectedId] = useState('');
    const [project, setProject] = useState(null);
    const [editing, setEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { projects } = useSnapshot(projectStore);
    const api = useApi();

    // Fetch projects on mount
    useEffect(() => {
        api.get('/projects').then((res) => {
            projectStore.setProjects(res.data, res.meta);
        }).catch(() => { });
    }, []);

    // Load selected project details
    useEffect(() => {
        if (!selectedId) { setProject(null); return; }
        api.get(`/projects/${selectedId}`).then((res) => {
            setProject(res.data);
        }).catch(() => setProject(null));
    }, [selectedId]);

    const { values, errors, isSubmitting, handleChange, handleSubmit, reset } = useForm({
        name: '',
        description: '',
    });

    // Sync form when project loads
    useEffect(() => {
        if (project) {
            reset();
            // Set fresh values
            values.name = project.name || '';
            values.description = project.description || '';
        }
    }, [project]);

    const onSave = handleSubmit(async (data) => {
        const res = await api.patch(`/projects/${selectedId}`, {
            name: data.name,
            description: data.description,
        });
        setProject(res.data);
        setEditing(false);
        // Refresh projects list
        const listRes = await api.get('/projects');
        projectStore.setProjects(listRes.data, listRes.meta);
    });

    const onDelete = async () => {
        setDeleting(true);
        try {
            await api.del(`/projects/${selectedId}`);
            setShowDeleteModal(false);
            setProject(null);
            setSelectedId('');
            // Refresh
            const listRes = await api.get('/projects');
            projectStore.setProjects(listRes.data, listRes.meta);
        } catch (_) { }
        setDeleting(false);
    };

    const onArchive = async () => {
        try {
            const res = await api.patch(`/projects/${selectedId}`, {
                status: project.status === 'archived' ? 'active' : 'archived',
            });
            setProject(res.data);
            const listRes = await api.get('/projects');
            projectStore.setProjects(listRes.data, listRes.meta);
        } catch (_) { }
    };

    return (
        <div>
            <h1>Editor</h1>

            {/* Project selector */}
            <div style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Select Project
                </label>
                <select
                    value={selectedId}
                    onChange={(e) => { setSelectedId(e.target.value); setEditing(false); }}
                    style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        fontSize: '0.875rem',
                    }}
                >
                    <option value="">Choose a project…</option>
                    {projects.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {!selectedId && (
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
                    Select a project above to view and edit its details.
                </p>
            )}

            {selectedId && !project && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={28} /></div>
            )}

            {project && (
                <Card style={{ marginTop: '1.5rem' }}>
                    <Card.Body>
                        {!editing ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 0.5rem' }}>{project.name}</h2>
                                        <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: project.status === 'active' ? '#22c55e' : project.status === 'archived' ? '#f59e0b' : '#6b7280',
                                            color: '#fff',
                                        }}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                                    <span>·</span>
                                    <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button onClick={() => setEditing(true)}>Edit</Button>
                                    <Button variant="secondary" onClick={onArchive}>
                                        {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                                    </Button>
                                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Input label="Project Name" name="name" value={values.name} onChange={handleChange} error={errors.name} />
                                <Input label="Description" name="description" value={values.description} onChange={handleChange} error={errors.description} />
                                {errors._form && <p style={{ color: '#ef4444', fontSize: '0.8125rem', margin: 0 }}>{errors._form}</p>}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button type="submit" loading={isSubmitting}>Save Changes</Button>
                                    <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Project">
                <p style={{ marginBottom: '1.5rem' }}>
                    Are you sure you want to delete <strong>{project?.name}</strong>? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" loading={deleting} onClick={onDelete}>Delete Project</Button>
                </div>
            </Modal>
        </div>
    );
}
