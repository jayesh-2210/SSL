import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Spinner } from '@sym/frontend-ui';
import { useApi } from '@sym/frontend-hooks';
import { useSnapshot } from 'valtio';
import { projectStore, authStore } from '@sym/frontend-state';
import { io } from 'socket.io-client';

export function CollabPage() {
    const [selectedProject, setSelectedProject] = useState('');
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState('');
    const { projects } = useSnapshot(projectStore);
    const { user } = useSnapshot(authStore);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const api = useApi();

    // Fetch projects on mount
    useEffect(() => {
        api.get('/projects').then((res) => {
            projectStore.setProjects(res.data, res.meta);
        }).catch(() => { });
    }, []);

    // Socket.io connection lifecycle
    useEffect(() => {
        if (!selectedProject) return;

        const socket = io('/project', {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('user:join', {
                projectId: selectedProject,
                userId: user?._id,
                userName: user?.name,
            });
            setMessages((prev) => [...prev, {
                type: 'system',
                text: 'Connected to project room',
                time: new Date(),
            }]);
        });

        socket.on('user:presence', (data) => {
            if (data.status === 'online') {
                setOnlineUsers((prev) => {
                    if (prev.find((u) => u.userId === data.userId)) return prev;
                    return [...prev, data];
                });
                setMessages((prev) => [...prev, {
                    type: 'system',
                    text: `${data.userName || data.userId} joined`,
                    time: new Date(),
                }]);
            } else {
                setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
                setMessages((prev) => [...prev, {
                    type: 'system',
                    text: `${data.userName || data.userId} left`,
                    time: new Date(),
                }]);
            }
        });

        socket.on('chat:message', (data) => {
            setMessages((prev) => [...prev, {
                type: 'chat',
                text: data.text,
                user: data.userName,
                time: new Date(data.time),
            }]);
        });

        socket.on('disconnect', () => {
            setConnected(false);
            setMessages((prev) => [...prev, {
                type: 'system',
                text: 'Disconnected from project room',
                time: new Date(),
            }]);
        });

        return () => {
            socket.emit('user:leave', { projectId: selectedProject, userId: user?._id });
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
            setOnlineUsers([]);
        };
    }, [selectedProject]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !socketRef.current) return;

        const msg = {
            text: msgInput,
            userName: user?.name || 'Anonymous',
            time: new Date().toISOString(),
        };
        socketRef.current.emit('chat:message', msg);
        setMessages((prev) => [...prev, {
            type: 'chat',
            text: msg.text,
            user: msg.userName,
            time: new Date(),
            own: true,
        }]);
        setMsgInput('');
    };

    const projectName = projects.find((p) => p._id === selectedProject)?.name || '';

    return (
        <div>
            <h1>Collaboration</h1>

            {/* Project selector */}
            <div style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Select Project to Join
                </label>
                <select
                    value={selectedProject}
                    onChange={(e) => {
                        setSelectedProject(e.target.value);
                        setMessages([]);
                    }}
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

            {!selectedProject && (
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '2rem' }}>
                    Select a project above to join its collaboration room.
                </p>
            )}

            {selectedProject && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem', marginTop: '1.5rem' }}>
                    {/* Chat area */}
                    <Card style={{ display: 'flex', flexDirection: 'column', height: '450px' }}>
                        <Card.Body style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{projectName}</h3>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.75rem',
                                    color: connected ? '#22c55e' : '#ef4444',
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: connected ? '#22c55e' : '#ef4444',
                                    }} />
                                    {connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>

                            {/* Messages */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.375rem',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                background: 'var(--color-surface)',
                            }}>
                                {messages.map((m, i) => (
                                    <div key={i} style={{
                                        fontSize: '0.8125rem',
                                        padding: '0.25rem 0',
                                        color: m.type === 'system' ? 'var(--color-text-secondary)' : 'var(--color-text)',
                                        fontStyle: m.type === 'system' ? 'italic' : 'normal',
                                    }}>
                                        {m.type === 'chat' && (
                                            <strong style={{ color: m.own ? '#3b82f6' : '#a78bfa', marginRight: '0.375rem' }}>
                                                {m.own ? 'You' : m.user}:
                                            </strong>
                                        )}
                                        {m.text}
                                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                                            {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                                <Input
                                    name="message"
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1 }}
                                    disabled={!connected}
                                />
                                <Button type="submit" disabled={!connected || !msgInput.trim()}>Send</Button>
                            </form>
                        </Card.Body>
                    </Card>

                    {/* Online users sidebar */}
                    <Card style={{ height: '450px' }}>
                        <Card.Body>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem' }}>Online Users</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {/* Current user always shown */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'var(--color-primary, #6366f1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}>
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500 }}>{user?.name || 'You'}</p>
                                        <p style={{ margin: 0, fontSize: '0.6875rem', color: '#22c55e' }}>Online (you)</p>
                                    </div>
                                </div>
                                {onlineUsers.map((u) => (
                                    <div key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#a78bfa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}>
                                            {(u.userName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500 }}>{u.userName || u.userId}</p>
                                            <p style={{ margin: 0, fontSize: '0.6875rem', color: '#22c55e' }}>Online</p>
                                        </div>
                                    </div>
                                ))}
                                {onlineUsers.length === 0 && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>No other users online</p>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
}
