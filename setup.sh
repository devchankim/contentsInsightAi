#!/bin/bash

# InsightWorkspace MVP - Quick Start Script

set -e

echo "🚀 InsightWorkspace MVP Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
fi

# Generate Prisma client
echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

cd ..

# Install web dependencies
echo ""
echo "📦 Installing web dependencies..."
cd web
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env and add your LLM API keys"
echo "2. Run 'npm run dev' in server/ directory (Terminal 1)"
echo "3. Run 'npm run dev' in web/ directory (Terminal 2)"
echo "4. Open http://localhost:5173"
echo ""
echo "For production build:"
echo "1. Run 'npm run build:deploy' in web/ directory"
echo "2. Run 'npm run build && npm run start:prod' in server/ directory"
echo "3. Open http://localhost:3000"

