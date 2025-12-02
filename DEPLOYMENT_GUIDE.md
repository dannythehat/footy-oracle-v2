# 🚀 Footy Oracle v2 - Deployment Guide

Complete guide for deploying Footy Oracle v2 to production.

## 📋 Prerequisites

- MongoDB Atlas account (or MongoDB instance)
- API-Football API key ([get one here](https://www.api-football.com/))
- OpenAI API key
- Render/Railway/Vercel account for hosting

## 🔧 Backend Deployment (Render)

### 1. Environment Variables

Set these in your Render dashboard:

```bash
# Server
PORT=3001
NODE_ENV=production

# API-Football
API_FOOTBALL_KEY=your_api_football_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/footy-oracle

# ML Model
ML_MODEL_PATH=../../shared/ml_outputs/predictions.json

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Cron
PREDICTION_CRON_SCHEDULE=0 6 * * *
```

### 2. Build Settings

```yaml
Build Command: cd apps/backend && npm install
Start Command: cd apps/backend && npm start
```

### 3. Initial Database Seeding

After deployment, seed the database with fixtures:

```bash
# SSH into your Render instance or use Render Shell
cd apps/backend
npm run seed:fixtures
```

This will:
- Fetch fixtures for the next 7 days
- Populate all required fields
- Fetch odds data for major leagues
- Take ~5-10 minutes depending on API rate limits

## 🎨 Frontend Deployment (Vercel)

### 1. Environment Variables

Set in Vercel dashboard:

```bash
VITE_API_URL=https://your-backend.onrender.com
```

### 2. Build Settings

```yaml
Framework Preset: Vite
Build Command: cd apps/frontend && npm install && npm run build
Output Directory: apps/frontend/dist
Install Command: npm install
Root Directory: /
```

### 3. Vercel Configuration

The `vercel.json` is already configured:

```json
{
  "buildCommand": "cd apps/frontend && npm install && npm run build",
  "outputDirectory": "apps/frontend/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🗄️ Database Setup

### MongoDB Atlas Setup

1. Create a new cluster
2. Create a database user
3. Whitelist IP addresses (or allow from anywhere: `0.0.0.0/0`)
4. Get connection string
5. Replace `<password>` and `<dbname>` in connection string

### Initial Collections

The following collections will be auto-created:
- `fixtures` - Match fixtures and live data
- `predictions` - ML predictions
- `featuredselections` - Golden Bets and Value Bets
- `betbuilders` - Bet Builder combinations

## 🔄 Automated Tasks

### Cron Jobs (Configured in Backend)

1. **Fixtures Update** - Every 5 minutes
   - Updates live scores
   - Fetches new fixtures
   - Updates match statistics

2. **AI Betting Insights** - Daily at 5 AM
   - Generates betting predictions
   - Updates Golden Bets
   - Calculates Value Bets

3. **ML Predictions** - Daily at 6 AM
   - Runs ML model predictions
   - Updates prediction data

## ✅ Testing Deployment

### 1. Backend Health Check

```bash
curl https://your-backend.onrender.com/health
# Expected: { "status": "ok" }
```

### 2. Test Fixtures API

```bash
curl "https://your-backend.onrender.com/api/fixtures?date=2025-12-02"
# Expected: JSON with fixtures array
```

### 3. Frontend Check

Visit your frontend URL and verify:
- ✅ Fixtures load correctly
- ✅ Live scores update
- ✅ Match details open
- ✅ Betting insights work
- ✅ No console errors

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Cannot connect to MongoDB"**
```bash
# Check MongoDB URI format
# Ensure IP whitelist includes Render IPs
# Verify database user credentials
```

**Problem: "API-Football rate limit exceeded"**
```bash
# Check your API-Football plan limits
# Reduce seeding frequency
# Use cached data when possible
```

**Problem: "No fixtures showing"**
```bash
# Run seeding script manually
cd apps/backend
npm run seed:fixtures
```

### Frontend Issues

**Problem: "Network Error" or CORS issues**
```bash
# Verify VITE_API_URL is correct
# Check CORS_ORIGIN in backend matches frontend domain
# Ensure backend is running
```

**Problem: "Fixtures not loading"**
```bash
# Check browser console for errors
# Verify API endpoint in Network tab
# Check backend logs for errors
```

## 📊 Monitoring

### Backend Logs (Render)

```bash
# View in Render dashboard under "Logs"
# Look for:
✅ "Connected to MongoDB"
✅ "Server running on port 3001"
✅ "Fixtures updated: X"
```

### Frontend Logs (Vercel)

```bash
# View in Vercel dashboard under "Deployments" > "Functions"
# Check for build errors or runtime issues
```

## 🔐 Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] MongoDB has authentication enabled
- [ ] API keys are kept secret
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented
- [ ] HTTPS is enabled (automatic on Render/Vercel)

## 📈 Performance Optimization

### Backend
- Use MongoDB indexes (already configured)
- Enable caching for frequently accessed data
- Implement rate limiting for API endpoints
- Use connection pooling for MongoDB

### Frontend
- Enable Vercel Edge caching
- Optimize images and assets
- Use lazy loading for components
- Implement service workers for offline support

## 🔄 Continuous Deployment

### Automatic Deployments

Both Render and Vercel support automatic deployments:

1. **Backend (Render)**
   - Auto-deploys on push to `main` branch
   - Configure in Render dashboard

2. **Frontend (Vercel)**
   - Auto-deploys on push to `main` branch
   - Preview deployments for PRs

### Manual Deployment

```bash
# Backend
git push origin main
# Render will auto-deploy

# Frontend
git push origin main
# Vercel will auto-deploy
```

## 📞 Support

If you encounter issues:

1. Check the logs (Render/Vercel dashboards)
2. Review this guide
3. Check GitHub issues
4. Verify all environment variables are set correctly

## 🎉 Success!

Your Footy Oracle v2 should now be live! 

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

Enjoy your AI-powered sports betting platform! ⚽🎯
