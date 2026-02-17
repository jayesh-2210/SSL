import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Spinner } from '@sym/frontend-ui';
import { useApi } from '@sym/frontend-hooks';
import { useSnapshot } from 'valtio';
import { projectStore, aiStore } from '@sym/frontend-state';

export function AIStudioPage() {
    const [prompt, setPrompt] = useState('');
    const [provider, setProvider] = useState('gemini');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedProject, setSelectedProject] = useState('');
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const { projects } = useSnapshot(projectStore);
    const api = useApi();

    // Fetch projects on mount
    useEffect(() => {
        api.get('/projects').then((res) => {
            projectStore.setProjects(res.data, res.meta);
            if (res.data.length > 0 && !selectedProject) {
                setSelectedProject(res.data[0]._id);
            }
        }).catch(() => { });
    }, []);

    // Fetch jobs when mounted
    useEffect(() => {
        setJobsLoading(true);
        api.get('/ai/jobs').then((res) => {
            setJobs(res.data || []);
        }).catch(() => { }).finally(() => setJobsLoading(false));
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || !selectedProject) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/ai/generate', {
                projectId: selectedProject,
                provider,
                model: provider === 'gemini' ? 'FLASH' : 'SDXL',
                input: { prompt },
            });
            setResult(res.data);
            aiStore.addJob(res.data);
            // Refresh jobs
            const jobsRes = await api.get('/ai/jobs');
            setJobs(jobsRes.data || []);
        } catch (err) {
            setResult({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        queued: '#f59e0b',
        processing: '#3b82f6',
        completed: '#22c55e',
        failed: '#ef4444',
        cancelled: '#6b7280',
    };

    return (
        <div>
            <h1>AI Studio</h1>

            <Card style={{ marginTop: '1.5rem' }}>
                <Card.Body>
                    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Project selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Project</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                style={{
                                    padding: '0.625rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.875rem',
                                }}
                            >
                                <option value="">Select a project…</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Provider selector */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                <input type="radio" name="provider" value="gemini" checked={provider === 'gemini'} onChange={(e) => setProvider(e.target.value)} />
                                Gemini (Text)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                <input type="radio" name="provider" value="replicate" checked={provider === 'replicate'} onChange={(e) => setProvider(e.target.value)} />
                                Replicate (Image)
                            </label>
                        </div>

                        <Input
                            label="Prompt"
                            name="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe what you want to create..."
                        />

                        <Button type="submit" loading={loading} disabled={!selectedProject}>
                            Generate
                        </Button>
                    </form>
                </Card.Body>
            </Card>

            {/* Result */}
            {result && (
                <Card style={{ marginTop: '1rem' }}>
                    <Card.Body>
                        <h3 style={{ marginBottom: '0.75rem' }}>Result</h3>
                        {result.error ? (
                            <p style={{ color: '#ef4444' }}>{result.error}</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: statusColors[result.status] || '#6b7280',
                                        color: '#fff',
                                    }}>
                                        {result.status}
                                    </span>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                        Job ID: {result.jobId}
                                    </span>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Job History */}
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Job History</h2>
            {jobsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner size={24} /></div>
            ) : jobs.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No jobs yet. Generate something above!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {jobs.map((job) => (
                        <Card key={job._id}>
                            <Card.Body style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        {job.input?.prompt ? job.input.prompt.substring(0, 80) + (job.input.prompt.length > 80 ? '…' : '') : 'No prompt'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                        {job.provider} · {job.model} · {new Date(job.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <span style={{
                                    padding: '0.125rem 0.625rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: statusColors[job.status] || '#6b7280',
                                    color: '#fff',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {job.status}
                                </span>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
