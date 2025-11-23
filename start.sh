#!/bin/bash

# 🚀 Footy Oracle v2 - Quick Start Script
# This script sets up and runs both frontend and backend locally

echo "🏆 THE FOOTY ORACLE v2 - Quick Start"
echo "===================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running (optional for development)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB not running. Backend will use mock data."
    fi
else
    echo "⚠️  MongoDB not installed. Backend will use mock data."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd apps/frontend
npm install
cd ../..

# Install backend dependencies
echo "Installing backend dependencies..."
cd apps/backend
npm install
cd ../..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check for environment files
if [ ! -f "apps/backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from template..."
    cp apps/backend/.env.example apps/backend/.env
    echo "📝 Please edit apps/backend/.env with your API keys"
fi

if [ ! -f "apps/frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from template..."
    cp apps/frontend/.env.example apps/frontend/.env
fi

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers in parallel
trap 'kill 0' EXIT

# Start backend
cd apps/backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
