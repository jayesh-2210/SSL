#!/bin/bash
# SYM — One-command setup script
set -e

echo "🔧 Setting up SYM development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "📦 Installing pnpm..."; npm install -g pnpm; }

# Copy environment file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example — please update with your credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete! Run the following to start development:"
echo ""
echo "   pnpm dev:backend    # Express API → http://localhost:4000"
echo "   pnpm dev:frontend   # React SPA → http://localhost:5173"
echo ""
