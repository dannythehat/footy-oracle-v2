# 🚀 Deployment Checklist - Footy Oracle v2

**Last Updated:** November 24, 2025  
**Status:** Ready for Deployment

---

## ✅ Pre-Deployment Checklist

### Frontend
- [x] Vercel configuration created (`vercel.json`)
- [x] API service layer implemented with error handling
- [x] HomePage connected to backend with graceful fallback
- [x] Mock data fallback for demo mode
- [x] Loading states implemented
- [x] Error handling implemented
- [x] Environment variables documented
- [x] Responsive design tested

### Backend
- [x] Express server configured
- [x] MongoDB models created
- [x] API routes implemented
- [x] CORS configured
- [x] Error handling middleware
- [x] Health check endpoint
- [x] Environment variables documented
- [x] Cron jobs configured

### Configuration Files
- [x] Root `vercel.json` for frontend deployment
- [x] Backend `vercel.json` for API deployment
- [x] Frontend `.env.example`
- [x] Backend `.env.example`
- [x] Docker configuration (optional)
- [x] Railway configuration (optional)

---

## 🎯 Deployment Steps

### Option 1: Vercel (Recommended - Easiest)

#### Frontend Deployment
1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from root directory
   vercel
   ```

2. **Configure Project Settings**
   - Framework: Vite
   - Root Directory: Leave as default (vercel.json handles it)
   - Build Command: Auto-detected
   - Output Directory: Auto-detected

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Backend Deployment
1. **Create New Vercel Project**
   ```bash
   cd apps/backend
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_atlas_uri
   API_FOOTBALL_KEY=your_api_football_key
   OPENAI_API_KEY=your_openai_key
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

4. **Update Frontend Environment**
   - Copy backend URL from Vercel
   - Update `VITE_API_URL` in frontend Vercel project settings
   - Redeploy frontend

---

### Option 2: Fly.io (Backend) + Vercel (Frontend)

#### Backend on Fly.io
1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Launch**
   ```bash
   cd apps/backend
   fly auth login
   fly launch
   ```

3. **Set Secrets**
   ```bash
   fly secrets set MONGODB_URI="your_mongodb_uri"
   fly secrets set API_FOOTBALL_KEY="your_key"
   fly secrets set OPENAI_API_KEY="your_key"
   fly secrets set CORS_ORIGIN="https://your-frontend.vercel.app"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

#### Frontend on Vercel
Follow "Frontend Deployment" steps from Option 1, using Fly.io URL for `VITE_API_URL`.

---

### Option 3: Railway (Backend) + Vercel (Frontend)

#### Backend on Railway
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `footy-oracle-v2`
   - Set root directory: `apps/backend`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_atlas_uri
   API_FOOTBALL_KEY=your_api_football_key
   OPENAI_API_KEY=your_openai_key
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Railway auto-deploys on push to main
   - Get Railway URL from dashboard

#### Frontend on Vercel
Follow "Frontend Deployment" steps from Option 1, using Railway URL for `VITE_API_URL`.

---

## 🗄️ Database Setup (MongoDB Atlas)

### Required for All Deployment Options

1. **Create Free Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up and create M0 (free) cluster
   - Choose region closest to your backend deployment

2. **Configure Network Access**
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs from Vercel/Fly.io/Railway

3. **Create Database User**
   - Go to Database Access
   - Create new user with read/write permissions
   - Save username and password

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `footy-oracle`

   Example:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/footy-oracle?retryWrites=true&w=majority
   ```

---

## 🔑 API Keys Required

### 1. API-Football (Required)
- **Website:** [api-football.com](https://www.api-football.com/)
- **Plan:** Free tier (100 requests/day) or paid
- **Setup:**
  1. Sign up for account
  2. Go to dashboard
  3. Copy API key
  4. Add to backend environment as `API_FOOTBALL_KEY`

### 2. OpenAI (Required)
- **Website:** [platform.openai.com](https://platform.openai.com/)
- **Plan:** Pay-as-you-go (GPT-4 for reasoning)
- **Setup:**
  1. Create account
  2. Add payment method
  3. Go to API keys section
  4. Create new secret key
  5. Add to backend environment as `OPENAI_API_KEY`

### 3. MongoDB Atlas (Required)
- **Website:** [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Plan:** M0 (free tier)
- **Setup:** See "Database Setup" section above

---

## 🧪 Testing Deployment

### 1. Test Backend Health
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T...",
  "environment": "production"
}
```

### 2. Test Frontend
- Visit your frontend URL
- Check for "Demo Mode" banner (should disappear when backend is connected)
- Verify Golden Bets load
- Test fixtures modal
- Check browser console for errors

### 3. Test API Endpoints
```bash
# Get today's golden bets
curl https://your-backend-url.vercel.app/api/golden-bets/today

# Get fixtures
curl https://your-backend-url.vercel.app/api/fixtures?date=2025-11-24

# Get P&L stats
curl https://your-backend-url.vercel.app/api/stats/pnl
```

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Origin
After frontend is deployed, update backend `CORS_ORIGIN` environment variable with actual frontend URL.

### 2. Verify Cron Jobs
- Check backend logs to ensure cron jobs are running
- Default schedule: 6am daily for predictions
- Verify in logs: "✅ Cron jobs started"

### 3. Monitor First Run
- Wait for first cron job execution (6am next day)
- Check logs for successful API calls
- Verify predictions are stored in database
- Check frontend displays real data

### 4. Set Up Monitoring (Optional)
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Monitor API usage (API-Football dashboard)
- Monitor OpenAI usage (OpenAI dashboard)

---

## 📊 Expected Costs

### Free Tier (Development/Testing)
- **Vercel:** Free (Hobby plan)
- **MongoDB Atlas:** Free (M0 cluster)
- **API-Football:** Free (100 requests/day)
- **OpenAI:** ~$5-10/month (GPT-4 usage)
- **Total:** ~$5-10/month

### Production (Recommended)
- **Vercel:** $20/month (Pro plan)
- **MongoDB Atlas:** Free or $9/month (M10)
- **API-Football:** $15-50/month (depending on plan)
- **OpenAI:** $20-50/month (GPT-4 usage)
- **Total:** ~$55-130/month

---

## 🚨 Troubleshooting

### Frontend shows "Demo Mode"
- **Cause:** Backend not accessible or CORS issue
- **Fix:** 
  1. Check `VITE_API_URL` is correct
  2. Verify backend is deployed and healthy
  3. Check CORS_ORIGIN in backend matches frontend URL

### Backend health check fails
- **Cause:** Database connection issue
- **Fix:**
  1. Verify `MONGODB_URI` is correct
  2. Check MongoDB Atlas network access allows your backend IP
  3. Verify database user credentials

### No predictions generated
- **Cause:** Cron job not running or API keys invalid
- **Fix:**
  1. Check backend logs for cron job execution
  2. Verify `API_FOOTBALL_KEY` is valid
  3. Verify `OPENAI_API_KEY` is valid
  4. Check API quotas not exceeded

### Build fails on Vercel
- **Cause:** Missing dependencies or configuration
- **Fix:**
  1. Check `package.json` has all dependencies
  2. Verify build command is correct
  3. Check Node.js version compatibility
  4. Review build logs for specific errors

---

## 📝 Quick Reference

### Frontend URL Structure
```
Production: https://footy-oracle-v2.vercel.app
Preview: https://footy-oracle-v2-git-branch.vercel.app
```

### Backend URL Structure
```
Vercel: https://footy-oracle-backend.vercel.app
Fly.io: https://footy-oracle-backend.fly.dev
Railway: https://footy-oracle-backend.up.railway.app
```

### Important Endpoints
```
Health: GET /health
Golden Bets: GET /api/golden-bets/today
Fixtures: GET /api/fixtures?date=YYYY-MM-DD
Stats: GET /api/stats/pnl
```

---

## ✅ Deployment Complete Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] API-Football API key obtained
- [ ] OpenAI API key obtained
- [ ] Backend deployed and health check passing
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured correctly
- [ ] CORS configured with correct origins
- [ ] First cron job executed successfully
- [ ] Real data displaying on frontend
- [ ] All API endpoints tested and working
- [ ] Error monitoring set up (optional)
- [ ] Custom domain configured (optional)

---

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Frontend loads without "Demo Mode" banner
2. ✅ Golden Bets display with real data
3. ✅ Fixtures modal shows today's matches
4. ✅ P&L statistics are accurate
5. ✅ No console errors in browser
6. ✅ Backend health check returns 200 OK
7. ✅ Cron jobs execute daily at 6am
8. ✅ Predictions are generated and stored

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section above
2. Review deployment logs in Vercel/Fly.io/Railway dashboard
3. Check browser console for frontend errors
4. Review backend logs for API errors
5. Verify all environment variables are set correctly

---

**Ready to deploy? Start with Option 1 (Vercel) for the easiest setup!**
