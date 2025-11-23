# 🚀 Deployment Guide - Footy Oracle v2

Complete guide for deploying frontend and backend to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway account (for backend)
- MongoDB Atlas account (free tier)
- API-Football API key
- OpenAI API key

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Import your repository

### Step 2: Configure Project

1. **Framework Preset:** Vite
2. **Root Directory:** `apps/frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Step 3: Environment Variables

Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 4: Deploy

```bash
# Option 1: Auto-deploy via GitHub
# Push to main branch triggers deployment

# Option 2: Manual deploy via CLI
npm i -g vercel
vercel login
cd apps/frontend
vercel --prod
```

### Vercel Configuration

Already configured in `vercel.json`:
- SPA routing enabled
- Build command optimized
- Output directory set

---

## ⚙️ Backend Deployment (Railway)

### Step 1: Prepare Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Create new project

### Step 2: Deploy from GitHub

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `footy-oracle-v2` repository
4. Set root directory: `apps/backend`

### Step 3: Environment Variables

Add in Railway dashboard:

```env
# Server
PORT=3001
NODE_ENV=production

# API Keys
API_FOOTBALL_KEY=your_api_football_key
OPENAI_API_KEY=your_openai_key

# Database
MONGODB_URI=your_mongodb_atlas_uri

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app

# Cron Schedule
PREDICTION_CRON_SCHEDULE=0 6 * * *
```

### Step 4: Configure Build

Railway auto-detects Node.js. Configuration in `railway.json`:
- Build command: `npm run build`
- Start command: `npm start`
- Auto-restart on failure

### Step 5: Get Railway URL

After deployment, Railway provides a URL like:
```
https://footy-oracle-backend-production.up.railway.app
```

Update this in Vercel frontend environment variables.

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Choose region closest to Railway deployment

### Step 2: Configure Access

1. **Network Access:** Add `0.0.0.0/0` (allow all)
2. **Database User:** Create user with read/write permissions
3. **Connection String:** Copy MongoDB URI

### Step 3: Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/footy-oracle?retryWrites=true&w=majority
```

Add this to Railway environment variables as `MONGODB_URI`.

---

## 🔑 API Keys Setup

### API-Football

1. Go to [api-football.com](https://www.api-football.com/)
2. Sign up for free tier (100 requests/day)
3. Get API key from dashboard
4. Add to Railway as `API_FOOTBALL_KEY`

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Create account and add payment method
3. Generate API key
4. Add to Railway as `OPENAI_API_KEY`

---

## ✅ Verification Checklist

### Frontend (Vercel)
- [ ] Build succeeds
- [ ] Site loads at Vercel URL
- [ ] API calls work (check browser console)
- [ ] Routing works (refresh on any page)
- [ ] Mobile responsive

### Backend (Railway)
- [ ] Build succeeds
- [ ] Health check works: `GET /health`
- [ ] Database connected (check logs)
- [ ] API endpoints respond
- [ ] Cron job scheduled (check logs)

### Integration
- [ ] Frontend can fetch Golden Bets
- [ ] Fixtures load correctly
- [ ] P&L stats display
- [ ] Historical results work
- [ ] No CORS errors

---

## 🔄 CI/CD Pipeline

GitHub Actions workflows configured:

### Frontend Workflow
- Triggers on push to `apps/frontend/**`
- Runs build and tests
- Auto-deploys to Vercel

### Backend Workflow
- Triggers on push to `apps/backend/**`
- Runs build and tests
- Railway auto-deploys via GitHub integration

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Track page views, performance
- Monitor build times

### Railway Logs
```bash
# Install Railway CLI
npm i -g @railway/cli

# View logs
railway logs
```

### Health Checks

**Backend Health:**
```bash
curl https://your-backend.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T15:00:00.000Z",
  "environment": "production"
}
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Build Fails:**
- Check Node version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

**API Calls Fail:**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Inspect browser console

### Backend Issues

**Database Connection Fails:**
- Verify MongoDB URI format
- Check network access in Atlas
- Ensure user has correct permissions

**API-Football Errors:**
- Check API key is valid
- Verify request limits not exceeded
- Check API-Football status

**Cron Job Not Running:**
- Check Railway logs
- Verify cron expression format
- Ensure timezone is correct

---

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Enable CORS only for your frontend domain**
4. **Rotate API keys regularly**
5. **Monitor API usage and costs**
6. **Set up error alerting**

---

## 💰 Cost Estimates

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- Free SSL

**Railway:**
- $5 free credit/month
- ~500 hours runtime
- Auto-sleep after inactivity

**MongoDB Atlas:**
- 512 MB storage
- Shared cluster
- Free forever

**API-Football:**
- 100 requests/day
- Upgrade to 1000/day for $10/month

**OpenAI:**
- Pay per use
- ~$0.01 per Golden Bet reasoning
- ~$0.90/day for 3 Golden Bets

**Total Monthly Cost:** ~$5-15 (after free credits)

---

## 🚀 Going Live

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Configure environment variables
4. ✅ Test all endpoints
5. ✅ Run first cron job manually
6. ✅ Monitor logs for 24 hours
7. ✅ Set up custom domain (optional)
8. ✅ Enable analytics
9. ✅ Share with users!

---

## 📞 Support

Issues? Check:
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

**🎉 Congratulations! Your Footy Oracle is now live!**
