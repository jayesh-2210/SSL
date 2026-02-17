<p align="center">
  <h1 align="center">SYM — AI-Powered Creative Platform</h1>
  <p align="center">
    A full-stack monorepo application for AI-assisted content creation, media management, and real-time collaboration.
  </p>
</p>

---

## ✨ Features

| Module | Description |
|---|---|
| **Dashboard** | Overview of all projects with quick-create modal |
| **AI Studio** | Generate text (Gemini) and images (Replicate) with prompt input & job history |
| **Media Library** | Drag-and-drop upload, grid preview, and file management |
| **Editor** | View, edit, archive, and delete project details inline |
| **Collaboration** | Real-time project rooms with Socket.io chat & presence |
| **Settings** | Profile editing, appearance, logout, and account deletion |

## 🏗️ Architecture

SYM is an **NX monorepo** with a composable package architecture. Each feature is a self-contained package that can be developed, tested, and deployed independently.

```
SSL/
├── apps/
│   ├── sym/backend/       # Express REST API (port 4000)
│   ├── sym/frontend/      # React + Vite SPA (port 5173)
│   └── worker/            # Background job processor (BullMQ)
├── packages/
│   ├── fnd-*              # Foundation — config, types, utils, logger, errors, validation
│   ├── backend-*          # Backend services — auth, user, project, ai-gemini, ai-replicate, media, queue, storage, realtime
│   └── frontend-*         # Frontend — ui components, state (valtio), hooks, feature pages
├── docs/                  # Architecture & setup guides
└── scripts/               # Developer helper scripts
```

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Valtio (state), React Router, Socket.io Client |
| **Backend** | Node.js, Express, Mongoose (MongoDB), JWT Auth, Multer |
| **AI** | Google Gemini API, Replicate API |
| **Realtime** | Socket.io (project rooms, chat, presence) |
| **Queue** | BullMQ + Redis (background jobs) |
| **Monorepo** | NX, pnpm workspaces |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **pnpm** ≥ 8.x — `npm install -g pnpm`
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **FFmpeg** *(optional, for media processing)* — `brew install ffmpeg`

### Installation

```bash
# 1. Clone the repository
git clone git@github.com:jayesh-2210/SSL.git
cd SSL

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and API keys
```

### Running the App

```bash
# Start both frontend & backend
pnpm dev

# Or start individually:
pnpm dev:frontend   # → http://localhost:5173
pnpm dev:backend    # → http://localhost:4000
pnpm dev:worker     # Background job processor
```

> **Note:** On first run in development mode, the database will auto-seed a test user:
> - **Email:** `test@example.com`
> - **Password:** `Test1234!`

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `GEMINI_API_KEY` | For AI | Google Gemini API key |
| `REPLICATE_API_TOKEN` | For AI | Replicate API token |
| `REDIS_URL` | For Queue | Redis connection URL |
| `STORAGE_PROVIDER` | No | `local` (default) or `s3` |

See [`.env.example`](.env.example) for the full list.

## 📜 Available Scripts

```bash
pnpm dev                # Start frontend + backend concurrently
pnpm dev:frontend       # Start React dev server (port 5173)
pnpm dev:backend        # Start Express server (port 4000)
pnpm dev:worker         # Start background worker
pnpm build              # Build all packages
pnpm lint               # Lint all packages
pnpm test               # Run all tests
pnpm graph              # Open NX dependency graph
pnpm clean              # Reset NX cache and remove node_modules
```

## 📁 Package Overview

### Foundation (`fnd-*`)
| Package | Purpose |
|---|---|
| `fnd-config` | Centralized environment config |
| `fnd-types` | Shared TypeScript-style type definitions |
| `fnd-utils` | Common utility functions |
| `fnd-logger` | Structured logging (Pino) |
| `fnd-errors` | Custom error classes |
| `fnd-validation` | Zod-based schema validation |

### Backend (`backend-*`)
| Package | Purpose |
|---|---|
| `backend-auth` | JWT authentication & registration |
| `backend-user` | User CRUD operations |
| `backend-project` | Project management |
| `backend-ai-gemini` | Google Gemini integration |
| `backend-ai-replicate` | Replicate (Stable Diffusion) integration |
| `backend-media` | Media processing (FFmpeg) |
| `backend-queue` | BullMQ job queue |
| `backend-realtime` | Socket.io server |
| `backend-storage` | File storage abstraction (local/S3) |

### Frontend (`frontend-*`)
| Package | Purpose |
|---|---|
| `frontend-ui` | Shared UI components (Button, Card, Input, Modal, Spinner, Layout) |
| `frontend-state` | Valtio stores (auth, project, AI, UI) |
| `frontend-hooks` | Custom hooks (useApi, useFetch, useForm, useSocket, useDebounce) |
| `frontend-feature-*` | Feature pages (auth, dashboard, ai-studio, media, editor, collab, settings) |

## 📖 Documentation

- [Architecture Guide](docs/architecture.md)
- [Developer Setup](docs/setup.md)

## 📄 License

This project is private and proprietary.
