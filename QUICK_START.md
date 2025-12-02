# ⚡ Quick Start Guide - Footy Oracle v2

Get up and running locally in 5 minutes!

## 🚀 Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- API-Football API key
- OpenAI API key (optional for AI features)

## 📦 Installation

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2

# Install dependencies
npm install
```

### 2. Backend Setup

```bash
cd apps/backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```bash
# Server
PORT=3001
NODE_ENV=development

# API-Football (REQUIRED)
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/footy-oracle
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/footy-oracle

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd apps/frontend

# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

**Frontend Environment:**

```bash
VITE_API_URL=http://localhost:3001
```

## 🗄️ Database Seeding

### Seed Fixtures (REQUIRED)

```bash
cd apps/backend

# Seed fixtures for next 7 days
npm run seed:fixtures
```

This will:
- Fetch fixtures from API-Football
- Populate database with match data
- Take 5-10 minutes (includes odds fetching)

### Quick Daily Fetch (Alternative)

```bash
# Fetch only today's fixtures (faster)
npm run seed:fetch
```

## 🏃 Running the Application

### Option 1: Run Both (Recommended)

```bash
# Terminal 1 - Backend
cd apps/backend
npm start

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

### Option 2: Development Mode

```bash
# From root directory
npm run dev
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

## 📋 Common Commands

### Backend Commands

```bash
cd apps/backend

# Start server
npm start

# Seed fixtures (7 days)
npm run seed:fixtures

# Quick fetch (today only)
npm run seed:fetch

# Run tests
npm test
```

### Frontend Commands

```bash
cd apps/frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✅ Verify Everything Works

### 1. Check Backend

```bash
# Health check
curl http://localhost:3001/health

# Get fixtures
curl "http://localhost:3001/api/fixtures?date=2025-12-02"
```

### 2. Check Frontend

Open http://localhost:3000 and verify:
- ✅ Fixtures load
- ✅ Date picker works
- ✅ Match details open
- ✅ No console errors

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

```bash
# Start MongoDB locally
mongod

# OR use MongoDB Atlas connection string
# Update MONGODB_URI in .env
```

### "API-Football error"

```bash
# Verify API key is correct
# Check API-Football dashboard for rate limits
# Ensure API_FOOTBALL_KEY is set in .env
```

### "No fixtures showing"

```bash
# Run seeding script
cd apps/backend
npm run seed:fixtures

# Check if fixtures exist in database
mongo footy-oracle
db.fixtures.count()
```

### "CORS error"

```bash
# Verify CORS_ORIGIN in backend .env matches frontend URL
# Default: http://localhost:3000
```

### Port already in use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

## 📁 Project Structure

```
footy-oracle-v2/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── models/   # MongoDB schemas
│   │   │   ├── services/ # Business logic
│   │   │   ├── scripts/  # Seeding scripts
│   │   │   └── cron/     # Scheduled jobs
│   │   └── .env          # Backend config
│   │
│   └── frontend/         # React + Vite app
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/ # API calls
│       │   └── hooks/
│       └── .env          # Frontend config
│
├── DEPLOYMENT_GUIDE.md   # Production deployment
└── QUICK_START.md        # This file
```

## 🎯 Next Steps

1. **Explore the API**
   - Check `apps/backend/API_REFERENCE.md`
   - Test endpoints with Postman/curl

2. **Customize Features**
   - Modify components in `apps/frontend/src/components`
   - Add new API routes in `apps/backend/src/routes`

3. **Deploy to Production**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy backend to Render
   - Deploy frontend to Vercel

## 📚 Additional Resources

- [API Reference](apps/backend/API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Backend Setup](apps/backend/SETUP.md)
- [Testing Guide](apps/backend/TESTING.md)

## 🎉 You're Ready!

Your local Footy Oracle v2 is now running! Start building and enjoy! ⚽🎯

**Need help?** Check the troubleshooting section or open an issue on GitHub.
