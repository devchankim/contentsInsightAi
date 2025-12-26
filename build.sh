#!/bin/bash
set -e

echo "🚀 Starting build process..."

# Server build
echo "📦 Building server..."
cd server
npm ci --include=dev
npx prisma generate
rm -rf dist
npm run build
cd ..

# Web build  
echo "🎨 Building web..."
cd web
npm ci --include=dev
npm run build
cd ..

# Deploy web to server/public
echo "📤 Deploying web to server/public..."
mkdir -p server/public
cp -r web/dist/* server/public/

echo "✅ Build complete!"

