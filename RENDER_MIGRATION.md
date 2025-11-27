# 🚀 Render Migration Guide - Backend Deployment

## 🔴 **Problem Identified**

**Vercel Deployment Failures:**
- ❌ All 20 recent deployments failed with ERROR state
- ❌ Backend requires persistent server (MongoDB, cron jobs)
- ❌ Vercel serverless functions unsuitable for:
  - Long-running processes
  - Database connections
  - Scheduled cron jobs (8am daily predictions)
  - WebSocket/real-time features

**Error ID:** `fra1::c7fjp-1764225449133-b836f113ea10`
**Error:** `500: INTERNAL_SERVER_ERROR - FUNCTION_INVOCATION_FAILED`

---

## ✅ **Solution: Migrate Backend to Render**

### **Why Render?**
- ✅ **Persistent servers** - Perfect for Node.js + MongoDB + cron
- ✅ **Free tier** - 750 hours/month
- ✅ **Auto-deploy** - Push to main = instant deploy
- ✅ **Zero config** - `render.yaml` handles everything
- ✅ **Health checks** - Automatic monitoring

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Create Render Account (2 minutes)**

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub
4. Authorize Render to access repositories

### **Step 2: Deploy Backend as Blueprint (3 minutes)**

1. In Render Dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect repository: `dannythehat/footy-oracle-v2`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

### **Step 3: Configure Environment Variables**

Add these in Render Dashboard → Service → Environment:

```bash
# Required
MONGODB_URI=mongodb+srv://your-connection-string
OPENAI_API_KEY=sk-your-openai-key
API_FOOTBALL_KEY=your-api-football-key
FLASHSCORE_API_KEY=your-flashscore-key

# Auto-configured
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://footy-oracle-v2.vercel.app
```

### **Step 4: Wait for Deployment (2-3 minutes)**

Render will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Build backend (`npm run build`)
- ✅ Start server (`npm start`)
- ✅ Run health checks at `/health`

### **Step 5: Get Your Backend URL**

Once deployed, you'll see:
```
https://footy-oracle-backend.onrender.com
```

Copy this URL for frontend configuration.

---

## 🔧 **Update Frontend Configuration**

### **Update API Base URL**

Edit `apps/frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://footy-oracle-backend.onrender.com';
```

### **Add Environment Variable to Vercel**

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://footy-oracle-backend.onrender.com`
   - **Environment:** Production, Preview, Development

---

## 🎯 **Architecture After Migration**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (Vercel)                              │
│  ├── React + TypeScript + Vite                  │
│  ├── Static site generation                     │
│  └── CDN distribution                           │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS API Calls
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  Backend (Render)                               │
│  ├── Node.js + Express                          │
│  ├── MongoDB (Atlas)                            │
│  ├── Cron Jobs (8am daily)                      │
│  ├── OpenAI Integration                         │
│  └── API Football Integration                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📊 **Backend Endpoints**

### **Health Check**
```bash
GET https://footy-oracle-backend.onrender.com/health
```

### **Golden Bets**
```bash
GET https://footy-oracle-backend.onrender.com/api/golden-bets/today
```

### **Value Bets**
```bash
GET https://footy-oracle-backend.onrender.com/api/value-bets/today
```

### **Bet Builder**
```bash
GET https://footy-oracle-backend.onrender.com/api/bet-builders/today
```

### **Fixtures**
```bash
GET https://footy-oracle-backend.onrender.com/api/fixtures/upcoming
```

---

## 🔄 **Auto-Deploy Setup**

### **Already Configured!**

Every push to `main` branch automatically deploys to Render.

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Pulls latest code
# 3. Installs dependencies
# 4. Builds backend
# 5. Restarts service
# 6. Your changes are live!
```

---

## 🚨 **Free Tier Limitations**

### **What You Get (Free)**
- ✅ 750 hours/month web service
- ✅ Auto-deploy from GitHub
- ✅ SSL certificates
- ✅ Custom domains
- ✅ Health checks

### **Limitations**
- ⚠️ **Sleeps after 15 minutes** of inactivity
- ⚠️ **Cold start:** 30-60 seconds after sleep
- ⚠️ **Limited resources:** 512MB RAM

### **Solutions for Cold Starts**

1. **Use a ping service** (free):
   - UptimeRobot: https://uptimerobot.com
   - Ping every 14 minutes to keep alive

2. **Upgrade to paid plan** ($7/month):
   - Always-on service (no sleep)
   - Faster performance
   - More resources

---

## 📈 **Monitoring**

### **View Logs**
1. Render Dashboard → Service → **Logs** tab
2. Real-time logs with filtering
3. Download logs for analysis

### **View Metrics**
1. Render Dashboard → Service → **Metrics** tab
2. CPU, memory, requests
3. Response times

### **Check Deployments**
1. Render Dashboard → Service → **Events** tab
2. Deployment history
3. Build logs

---

## 🐛 **Troubleshooting**

### **Service Not Starting?**

**Check logs:**
```bash
# Common issues:
1. Missing environment variables
2. MongoDB connection failed
3. Port already in use
4. Build errors
```

**Solutions:**
1. Verify all env vars are set
2. Check MongoDB Atlas whitelist (allow 0.0.0.0/0)
3. Ensure PORT=3001 in env vars
4. Review build logs for errors

### **Database Connection Failed?**

**Check:**
1. MongoDB URI format: `mongodb+srv://...`
2. Network access in MongoDB Atlas
3. Database user permissions
4. Connection string includes database name

### **API Returns 404?**

**Check:**
1. Service is running (not sleeping)
2. Correct URL format
3. CORS configuration
4. Route exists in backend

### **Frontend Not Updating?**

**Check:**
1. Vercel deployment succeeded
2. Environment variables set
3. API URL correct
4. Browser cache cleared

---

## ✅ **Verification Checklist**

- [ ] Render account created
- [ ] Backend deployed successfully
- [ ] Environment variables configured
- [ ] Health check returns 200 OK
- [ ] MongoDB connected
- [ ] Cron jobs running
- [ ] Frontend updated with backend URL
- [ ] Vercel environment variables set
- [ ] Frontend deployment succeeded
- [ ] API calls working from frontend
- [ ] Daily predictions generating at 8am

---

## 🎉 **Success Indicators**

### **Backend (Render)**
```bash
✅ Service status: Running
✅ Health check: 200 OK
✅ Last deploy: Success
✅ Logs: No errors
✅ Cron jobs: Active
```

### **Frontend (Vercel)**
```bash
✅ Build status: Success
✅ Deployment: Production
✅ API calls: Working
✅ Data loading: Success
```

---

## 📞 **Support**

### **Render Issues**
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### **Vercel Issues**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com

---

## 🚀 **Next Steps**

1. **Deploy backend to Render** (follow steps above)
2. **Update frontend API URL** (in Vercel env vars)
3. **Test all endpoints** (health, golden bets, etc.)
4. **Monitor for 24 hours** (check cron jobs run)
5. **Set up UptimeRobot** (prevent cold starts)

---

## 💡 **Pro Tips**

1. **Use environment-specific URLs:**
   ```typescript
   const API_URL = process.env.NODE_ENV === 'production'
     ? 'https://footy-oracle-backend.onrender.com'
     : 'http://localhost:3001';
   ```

2. **Add retry logic for cold starts:**
   ```typescript
   const fetchWithRetry = async (url, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fetch(url);
       } catch (err) {
         if (i === retries - 1) throw err;
         await new Promise(r => setTimeout(r, 2000));
       }
     }
   };
   ```

3. **Monitor MongoDB Atlas:**
   - Set up alerts for connection issues
   - Monitor query performance
   - Check storage usage

---

**Migration Status:** ✅ Ready to Deploy
**Estimated Time:** 10-15 minutes
**Difficulty:** Easy
