import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { authStore } from '@sym/frontend-state';
import { Layout, Spinner } from '@sym/frontend-ui';
import { LoginPage, RegisterPage } from '@sym/frontend-feature-auth';

// Lazy-load feature pages
const DashboardPage = lazy(() => import('@sym/frontend-feature-dashboard').then((m) => ({ default: m.DashboardPage })));
const AIStudioPage = lazy(() => import('@sym/frontend-feature-ai-studio').then((m) => ({ default: m.AIStudioPage })));
const EditorPage = lazy(() => import('@sym/frontend-feature-editor').then((m) => ({ default: m.EditorPage })));
const MediaLibraryPage = lazy(() => import('@sym/frontend-feature-media').then((m) => ({ default: m.MediaLibraryPage })));
const CollabPage = lazy(() => import('@sym/frontend-feature-collab').then((m) => ({ default: m.CollabPage })));
const SettingsPage = lazy(() => import('@sym/frontend-feature-settings').then((m) => ({ default: m.SettingsPage })));

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useSnapshot(authStore);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

function AppLayout({ children }) {
    return (
        <Layout>
            <Layout.Sidebar>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <Link to="/dashboard" style={navStyle}>Dashboard</Link>
                    <Link to="/ai-studio" style={navStyle}>AI Studio</Link>
                    <Link to="/media" style={navStyle}>Media</Link>
                    <Link to="/editor" style={navStyle}>Editor</Link>
                    <Link to="/collab" style={navStyle}>Collaboration</Link>
                    <Link to="/settings" style={navStyle}>Settings</Link>
                </nav>
            </Layout.Sidebar>
            <Layout.Header>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>SYM</h2>
            </Layout.Header>
            <Layout.Main>
                <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size={32} /></div>}>
                    {children}
                </Suspense>
            </Layout.Main>
        </Layout>
    );
}

const navStyle = {
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'background 0.15s',
};

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Routes>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/ai-studio" element={<AIStudioPage />} />
                                <Route path="/editor" element={<EditorPage />} />
                                <Route path="/media" element={<MediaLibraryPage />} />
                                <Route path="/collab" element={<CollabPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
