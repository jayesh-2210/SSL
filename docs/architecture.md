# SYM Architecture Guide

## Overview

SYM is built as an **NX monorepo** with a composable package architecture. Each feature is a self-contained package that can be developed, tested, and deployed independently.

## Directory Structure

```
sym/
├── apps/              # Deployable applications
│   ├── sym/backend/   # Express API (port 4000)
│   ├── sym/frontend/  # React+Vite SPA (port 5173)
│   └── worker/        # Background job processor
├── packages/          # Reusable packages
│   ├── fnd-*/         # Foundation (config, types, utils, logger, errors, validation)
│   ├── backend-*/     # Backend services (auth, user, project, ai-*, media, etc.)
│   └── frontend-*/    # Frontend (ui, state, hooks, feature-*)
├── docs/              # Documentation
└── scripts/           # Developer scripts
```

## Package Dependency Rules

1. **Foundation** packages have no workspace dependencies
2. **Backend** packages depend on Foundation and other Backend packages
3. **Frontend** packages depend on Foundation and Frontend Shared packages
4. **Apps** import from packages — never from other apps

## Key Commands

```bash
pnpm dev:frontend     # Start React dev server (5173)
pnpm dev:backend      # Start Express server (4000)
pnpm dev              # Start both frontend + backend
npx nx graph          # Visualize dependency graph
npx nx affected --target=build  # Build only changed packages
```
