import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner } from '@sym/frontend-ui';
import { useApi } from '@sym/frontend-hooks';
import { authStore } from '@sym/frontend-state';

export function MediaLibraryPage() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);
    const api = useApi();

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await api.get('/media');
            setMedia(res.data || []);
        } catch (_) { }
        setLoading(false);
    };

    useEffect(() => { fetchMedia(); }, []);

    const uploadFile = async (file) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/media/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setMedia((prev) => [data.data, ...prev]);
            }
        } catch (_) { }
        setUploading(false);
    };

    const getToken = () => authStore.accessToken;

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) uploadFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) uploadFile(file);
    };

    const handleDelete = async (id) => {
        try {
            await api.del(`/media/${id}`);
            setMedia((prev) => prev.filter((m) => m._id !== id));
        } catch (_) { }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const typeBadgeColors = {
        image: '#3b82f6',
        video: '#8b5cf6',
        audio: '#f59e0b',
        text: '#6b7280',
    };

    return (
        <div>
            <h1>Media Library</h1>

            {/* Upload zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                    marginTop: '1.5rem',
                    border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '12px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    background: dragOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                }}
            >
                <input ref={fileRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Spinner size={20} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <p style={{ fontSize: '1.125rem', fontWeight: 500, margin: '0 0 0.25rem' }}>
                            Drop a file here or click to upload
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
                            Images, videos, audio — up to 50MB
                        </p>
                    </>
                )}
            </div>

            {/* Media grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={28} /></div>
            ) : media.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '2rem', textAlign: 'center' }}>
                    No media files yet. Upload something above!
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                    {media.map((item) => (
                        <Card key={item._id}>
                            <Card.Body>
                                {/* Preview */}
                                {item.type === 'image' && (
                                    <div style={{
                                        width: '100%',
                                        height: '120px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '0.75rem',
                                        background: 'var(--color-surface)',
                                    }}>
                                        <img
                                            src={`/api/media/file/${item.storageKey}`}
                                            alt={item.filename}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                {item.type !== 'image' && (
                                    <div style={{
                                        width: '100%',
                                        height: '60px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '0.75rem',
                                        background: 'var(--color-surface)',
                                        fontSize: '1.5rem',
                                    }}>
                                        {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📄'}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{
                                            fontWeight: 500,
                                            fontSize: '0.875rem',
                                            margin: '0 0 0.25rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {item.filename}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{
                                                padding: '0.0625rem 0.375rem',
                                                borderRadius: '999px',
                                                fontSize: '0.6875rem',
                                                fontWeight: 600,
                                                background: typeBadgeColors[item.type] || '#6b7280',
                                                color: '#fff',
                                            }}>
                                                {item.type}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                {formatSize(item.size)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(item._id)}>
                                        ✕
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
