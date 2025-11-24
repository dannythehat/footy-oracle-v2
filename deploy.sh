#!/bin/bash

# Footy Oracle v2 - Complete Deployment Script
# This script helps you deploy both frontend and backend

echo "🚀 Footy Oracle v2 Deployment Helper"
echo "======================================"
echo ""

# Check if Fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    echo "✅ Fly CLI installed. Please restart your terminal and run this script again."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ All CLIs installed"
echo ""

# Backend deployment
echo "📦 STEP 1: Deploy Backend to Fly.io"
echo "-----------------------------------"
read -p "Deploy backend now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/backend
    
    echo "Logging into Fly.io..."
    fly auth login
    
    echo "Deploying backend..."
    fly deploy
    
    echo ""
    echo "✅ Backend deployed!"
    echo "Your backend URL: https://footy-oracle-backend.fly.dev"
    echo ""
    echo "⚠️  Don't forget to set secrets:"
    echo "fly secrets set API_FOOTBALL_KEY='your_key'"
    echo "fly secrets set OPENAI_API_KEY='your_key'"
    echo "fly secrets set MONGODB_URI='your_uri'"
    echo ""
    
    cd ../..
fi

# Frontend deployment
echo "🎨 STEP 2: Deploy Frontend to Vercel"
echo "------------------------------------"
read -p "Deploy frontend now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/frontend
    
    echo "Logging into Vercel..."
    vercel login
    
    echo "Deploying frontend..."
    vercel --prod
    
    echo ""
    echo "✅ Frontend deployed!"
    echo ""
    
    cd ../..
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update CORS_ORIGIN in Fly.io with your Vercel URL"
echo "2. Test your application"
echo "3. Monitor logs: fly logs (backend) | vercel logs (frontend)"
