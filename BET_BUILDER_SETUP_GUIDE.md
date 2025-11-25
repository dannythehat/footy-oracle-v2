# 🧠 Bet Builder Brain - Complete Setup Guide

**Quick Start Guide for LM System Integration**  
**Last Updated:** November 25, 2025

---

## 📋 Overview

This guide walks you through setting up the complete Bet Builder Brain system, including:
- LM System configuration (generates predictions)
- Oracle Backend setup (imports and serves data)
- Oracle Frontend integration (displays to users)

---

## 🔧 Step 1: LM System Setup

### 1.1 Add Bet Builder Detection Script

Copy the detection script to your LM System repo:

```bash
# In football-betting-ai-system repo
cp bet_builder_detector.py ml_training/
```

### 1.2 Update Your Daily Pipeline

**File:** `ml_training/daily_pipeline.py`

```python
from bet_builder_detector import detect_bet_builders, save_bet_builders

def run_daily_pipeline():
    # ... existing code ...
    
    # Generate predictions (existing)
    predictions = generate_predictions(fixtures)
    save_predictions(predictions)
    
    # NEW: Detect bet builders
    bet_builders = detect_bet_builders(predictions)
    save_bet_builders(bet_builders)
```

### 1.3 Configure Environment

**File:** `.env` in LM System

```bash
# Bet Builder Configuration
BET_BUILDER_MIN_CONFIDENCE=75
BET_BUILDER_MIN_MARKETS=3
BET_BUILDER_MAX_DAILY=5
BET_BUILDER_OUTPUT_PATH=../shared/ml_outputs/bet_builders.json
```

### 1.4 Test LM System

```bash
cd ml_training
python bet_builder_detector.py

# Check output
cat ../shared/ml_outputs/bet_builders.json
```

Expected output:
```json
{
  "generated_at": "2025-11-25T06:00:00Z",
  "date": "2025-11-25",
  "total_fixtures_analyzed": 45,
  "bet_builders_found": 5,
  "bet_builders": [...]
}
```

---

## 🔧 Step 2: Oracle Backend Setup

### 2.1 Install Dependencies

```bash
cd apps/backend
npm install openai node-cron nodemailer
```

### 2.2 Configure Environment

**File:** `apps/backend/.env`

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/footy-oracle

# OpenAI for AI Reasoning
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Bet Builder Import
BET_BUILDER_IMPORT_PATH=../../../shared/ml_outputs/bet_builders.json
BET_BUILDER_CRON_SCHEDULE=30 6 * * *

# LM System API (optional)
LM_SYSTEM_API_URL=https://your-lm-system.onrender.com/api/v1
```

### 2.3 Register Routes

**File:** `apps/backend/src/index.ts`

```typescript
import betBuilderRoutes from './routes/betBuilder.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import { scheduleBetBuilderImport } from './cron/betBuilderCron.js';

// Register routes
app.use('/api/bet-builders', betBuilderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Start cron jobs
scheduleBetBuilderImport();
```

### 2.4 Test Backend Import

```bash
# Manual import test
curl -X POST http://localhost:3001/api/admin/import-bet-builders

# Check status
curl http://localhost:3001/api/admin/bet-builder-status

# Get today's bet builders
curl http://localhost:3001/api/bet-builders/today
```

---

## 🔧 Step 3: Oracle Frontend Setup

### 3.1 Add Routes

**File:** `apps/frontend/src/App.tsx`

```tsx
import BetBuilderHistory from './pages/BetBuilderHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bet-builders" element={<BetBuilderHistory />} />
      {/* ... other routes ... */}
    </Routes>
  );
}
```

### 3.2 Update API Service

**File:** `apps/frontend/src/services/api.ts`

```typescript
export const betBuilderApi = {
  getToday: async () => {
    return await fetch(`${API_BASE_URL}/api/bet-builders/today`);
  },
  getHistorical: async (params: any) => {
    const query = new URLSearchParams(params).toString();
    return await fetch(`${API_BASE_URL}/api/bet-builders?${query}`);
  },
  getStats: async (params: any) => {
    const query = new URLSearchParams(params).toString();
    return await fetch(`${API_BASE_URL}/api/bet-builders/stats/summary?${query}`);
  },
};
```

### 3.3 Test Frontend

```bash
cd apps/frontend
npm run dev

# Visit in browser
http://localhost:5173
http://localhost:5173/bet-builders
```

---

## 📅 Daily Workflow

### 6:00 AM UTC - LM System
1. Fetch fixtures from API-Football
2. Generate predictions for 4 markets
3. Run bet builder detection
4. Save `bet_builders.json`

### 6:30 AM UTC - Oracle Backend
1. Cron job triggers import
2. Read `bet_builders.json`
3. Generate AI reasoning (GPT-4)
4. Save to MongoDB
5. Send email notifications (if configured)

### All Day - Oracle Frontend
1. Users visit homepage
2. See today's bet builders
3. View historical results
4. Subscribe to notifications
5. Share on social media

---

## 🧪 Testing Checklist

### LM System
- [ ] `bet_builder_detector.py` runs without errors
- [ ] `bet_builders.json` is generated
- [ ] File contains valid JSON with bet builders
- [ ] Combined confidence calculated correctly
- [ ] Only top-tier leagues included

### Oracle Backend
- [ ] MongoDB connection working
- [ ] Manual import succeeds
- [ ] Bet builders saved to database
- [ ] AI reasoning generated
- [ ] API endpoints return data
- [ ] Cron job scheduled
- [ ] Email notifications work (if configured)

### Oracle Frontend
- [ ] Homepage displays bet builders
- [ ] BetBuilderCard renders correctly
- [ ] Historical page loads
- [ ] Filters work
- [ ] CSV export works
- [ ] Social sharing works
- [ ] Subscription form works

---

## 🚀 Deployment

### LM System (Render/Railway)
```bash
# Ensure daily pipeline runs at 6:00 AM UTC
# Add bet_builder_detector.py to deployment
# Verify shared folder is accessible
```

### Oracle Backend (Railway)
```bash
# Set environment variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set MONGODB_URI=mongodb://...
railway variables set SMTP_USER=your-email@gmail.com

# Deploy
railway up
```

### Oracle Frontend (Vercel)
```bash
# Set environment variables
vercel env add VITE_API_BASE_URL

# Deploy
vercel --prod
```

---

## 🔍 Troubleshooting

### Issue: No bet builders found

**Check:**
1. LM System generated `bet_builders.json`
2. File path is correct in Oracle backend
3. Confidence thresholds not too high
4. Supported leagues configured

**Solution:**
```bash
# Check LM output
cat shared/ml_outputs/bet_builders.json

# Check Oracle import status
curl http://localhost:3001/api/admin/bet-builder-status
```

### Issue: AI reasoning not generating

**Check:**
1. OpenAI API key is valid
2. API key has credits
3. Model name is correct (gpt-4)

**Solution:**
```bash
# Test OpenAI connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Issue: Email notifications not sending

**Check:**
1. SMTP credentials are correct
2. Gmail "App Password" (not regular password)
3. Port and security settings match

**Solution:**
```bash
# Test email with curl
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### Issue: Cron job not running

**Check:**
1. Cron schedule format is correct
2. Server timezone is UTC
3. Cron service is running

**Solution:**
```bash
# Manually trigger cron
curl -X POST http://localhost:3001/api/admin/run-bet-builder-cron
```

---

## 📊 Monitoring

### LM System Logs
```
✅ Analyzed 45 fixtures
✅ Found 5 bet builders with 3+ markets @ 75%+ confidence
✅ Saved to shared/ml_outputs/bet_builders.json
```

### Oracle Backend Logs
```
📥 Importing 5 bet builders from LM System...
✅ Imported bet builder: Arsenal vs Chelsea (79% confidence)
✅ Bet builder import complete: 5 imported, 0 skipped, 0 errors
```

### Oracle Frontend
- Check browser console for errors
- Verify API calls return 200 status
- Test all user interactions

---

## 📚 Documentation

- **[BET_BUILDER_IMPLEMENTATION.md](./BET_BUILDER_IMPLEMENTATION.md)** - Full Phase 1-3 implementation
- **[BET_BUILDER_LM_INTEGRATION.md](./BET_BUILDER_LM_INTEGRATION.md)** - Detailed LM integration guide
- **[ORACLE_LM_INTEGRATION.md](./ORACLE_LM_INTEGRATION.md)** - General LM System integration

---

## 🎯 Quick Commands

### LM System
```bash
# Run bet builder detection
python ml_training/bet_builder_detector.py

# Check output
cat shared/ml_outputs/bet_builders.json
```

### Oracle Backend
```bash
# Manual import
curl -X POST http://localhost:3001/api/admin/import-bet-builders

# Check status
curl http://localhost:3001/api/admin/bet-builder-status

# Get today's bet builders
curl http://localhost:3001/api/bet-builders/today

# Send test email
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Oracle Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ Success Criteria

Your Bet Builder Brain is working correctly when:

1. ✅ LM System generates `bet_builders.json` daily at 6:00 AM
2. ✅ Oracle Backend imports bet builders at 6:30 AM
3. ✅ Homepage displays today's bet builders
4. ✅ Historical page shows past results with stats
5. ✅ Users can filter, sort, and export data
6. ✅ Social sharing works on all platforms
7. ✅ Email notifications are delivered
8. ✅ AI reasoning is generated for each bet builder

---

**Status:** ✅ Ready for production deployment!

For support, see the detailed documentation files or check the GitHub issues.
