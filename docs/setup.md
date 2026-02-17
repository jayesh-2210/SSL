# SYM — Developer Setup

## Prerequisites

- **Node.js** ≥ 18.x
- **pnpm** ≥ 8.x (`npm install -g pnpm`)
- **MongoDB** (local or Atlas connection string)
- **FFmpeg** (for media processing: `brew install ffmpeg`)

## Quick Start

```bash
# 1. Clone and install
cd /path/to/sym
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI, API keys, etc.

# 3. Start development servers
pnpm dev:backend    # Express API → http://localhost:4000
pnpm dev:frontend   # React SPA → http://localhost:5173

# Or both at once:
pnpm dev
```

## Environment Variables

See `.env.example` for all required and optional variables. Key ones:

| Variable | Required | Default |
|---|---|---|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/sym-dev` |
| `JWT_SECRET` | Yes | `dev-secret-change-me` |
| `REPLICATE_API_TOKEN` | For AI | — |
| `GEMINI_API_KEY` | For AI | — |

## NX Commands

```bash
npx nx graph                          # View dependency graph
npx nx serve sym-frontend             # Start frontend
npx nx serve sym-backend              # Start backend
npx nx serve sym-worker               # Start worker
npx nx run-many --target=build --all  # Build everything
npx nx affected --target=test         # Test changed packages only
```
