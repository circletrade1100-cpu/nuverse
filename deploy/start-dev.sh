#!/bin/bash

# Script untuk menjalankan development server dengan Node.js 20
echo "🔧 Loading Node.js 20..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "🚀 Starting development server..."
cd frontend
npm run dev
