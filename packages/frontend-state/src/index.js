import { proxy } from 'valtio';

// ─── Auth Store ─────────────────────────────────────

// Restore persisted auth on load
const _persistedUser = (() => { try { return JSON.parse(localStorage.getItem('sym_user')); } catch { return null; } })();
const _persistedToken = localStorage.getItem('sym_token');

export const authStore = proxy({
    user: _persistedUser,
    accessToken: _persistedToken,
    isAuthenticated: !!_persistedToken,
    isLoading: false,

    setAuth(user, accessToken) {
        authStore.user = user;
        authStore.accessToken = accessToken;
        authStore.isAuthenticated = true;
        try { localStorage.setItem('sym_user', JSON.stringify(user)); } catch { }
        try { localStorage.setItem('sym_token', accessToken); } catch { }
    },

    clearAuth() {
        authStore.user = null;
        authStore.accessToken = null;
        authStore.isAuthenticated = false;
        localStorage.removeItem('sym_user');
        localStorage.removeItem('sym_token');
    },
});

// ─── Project Store ──────────────────────────────────

export const projectStore = proxy({
    projects: [],
    currentProject: null,
    isLoading: false,
    meta: { page: 1, limit: 20, total: 0 },

    setProjects(projects, meta) {
        projectStore.projects = projects;
        if (meta) projectStore.meta = meta;
    },

    addProject(project) {
        projectStore.projects.unshift(project);
        projectStore.meta.total += 1;
    },

    setCurrentProject(project) {
        projectStore.currentProject = project;
    },
});

// ─── AI Store ───────────────────────────────────────

export const aiStore = proxy({
    activeJobs: [],
    generations: [],
    isGenerating: false,

    addJob(job) {
        aiStore.activeJobs.push(job);
    },

    updateJob(jobId, updates) {
        const idx = aiStore.activeJobs.findIndex((j) => j.id === jobId);
        if (idx !== -1) {
            Object.assign(aiStore.activeJobs[idx], updates);
        }
    },

    removeJob(jobId) {
        aiStore.activeJobs = aiStore.activeJobs.filter((j) => j.id !== jobId);
    },
});

// ─── UI Store ───────────────────────────────────────

export const uiStore = proxy({
    sidebarOpen: true,
    activeModal: null,
    notifications: [],

    toggleSidebar() {
        uiStore.sidebarOpen = !uiStore.sidebarOpen;
    },

    showModal(modalId, data = null) {
        uiStore.activeModal = { id: modalId, data };
    },

    closeModal() {
        uiStore.activeModal = null;
    },

    addNotification(notification) {
        const id = Date.now().toString();
        uiStore.notifications.push({ id, ...notification });
        setTimeout(() => {
            uiStore.notifications = uiStore.notifications.filter((n) => n.id !== id);
        }, 5000);
    },
});
