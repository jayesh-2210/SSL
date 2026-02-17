import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Card, Button, Modal, Input } from '@sym/frontend-ui';
import { projectStore, authStore } from '@sym/frontend-state';
import { useApi, useForm } from '@sym/frontend-hooks';
import { createProjectSchema } from '@sym/fnd-validation';

export function DashboardPage() {
    const { user } = useSnapshot(authStore);
    const { projects } = useSnapshot(projectStore);
    const [showModal, setShowModal] = useState(false);
    const api = useApi();

    // Fetch projects on mount
    useEffect(() => {
        api.get('/projects')
            .then((res) => {
                projectStore.setProjects(res.data, res.meta);
            })
            .catch(() => { });
    }, []);

    const { values, errors, isSubmitting, handleChange, handleSubmit, reset } = useForm({
        name: '',
        description: '',
    });

    const onSubmit = handleSubmit(
        async (data) => {
            const res = await api.post('/projects', data);
            projectStore.addProject(res.data);
            setShowModal(false);
            reset();
        },
        (v) => createProjectSchema.safeParse(v)
    );

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    return (
        <div>
            <h1>Welcome back, {user?.name || 'Creator'}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {projects.map((project) => (
                    <Card key={project._id} hover>
                        <Card.Body>
                            <h3>{project.name}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                {project.description || 'No description'}
                            </p>
                        </Card.Body>
                    </Card>
                ))}
                <Card
                    hover
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px' }}
                    onClick={openModal}
                >
                    <Card.Body>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>+ New Project</p>
                    </Card.Body>
                </Card>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title="Create New Project">
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Project Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="My awesome project"
                    />
                    <Input
                        label="Description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        error={errors.description}
                        placeholder="What's this project about? (optional)"
                    />
                    {errors._form && <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', margin: 0 }}>{errors._form}</p>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>Create Project</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
