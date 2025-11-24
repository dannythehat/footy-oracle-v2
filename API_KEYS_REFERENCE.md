# 🔑 API Keys & Environment Setup - Quick Reference

**Last Updated:** Nov 24, 2025  
**Issue Resolved:** API keys are already configured in .env files - no need to ask for them again!

---

## ✅ Current Status

**All API keys are already added to your .env files:**

1. ✅ **API-Football Key** - For fixture data
2. ✅ **OpenAI API Key** - For GPT-4 AI reasoning

The system reads these from environment variables automatically.

---

## 📁 Where API Keys Are Configured

### Oracle Backend (.env location)

```
footy-oracle-v2/
└── apps/
    └── backend/
        └── .env  ← YOUR API KEYS ARE HERE
```

### Configuration File

**File:** `apps/backend/src/config/apiFootball.ts`

```typescript
export const apiFootballConfig = {
  apiKey: process.env.API_FOOTBALL_KEY || '',  // ← Reads from .env
  baseUrl: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
  // ...
};
```

**File:** `apps/backend/src/services/openaiService.ts` (assumed)

```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // ← Reads from .env
});
```

---

## 🔧 Your .env File Structure

**Location:** `apps/backend/.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# API-Football Configuration (ALREADY ADDED ✅)
API_FOOTBALL_KEY=your_actual_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# OpenAI Configuration (ALREADY ADDED ✅)
OPENAI_API_KEY=your_actual_key_here
OPENAI_MODEL=gpt-4

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/footy-oracle

# ML Model Configuration
ML_MODEL_PATH=../../shared/ml_outputs/predictions.json

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Cron Schedule (Daily at 6 AM)
PREDICTION_CRON_SCHEDULE=0 6 * * *
```

---

## 🚀 How the System Uses API Keys

### 1. **API-Football Connection**

**When:** Backend fetches live fixture data

**Code Flow:**
```typescript
// apps/backend/src/config/apiFootball.ts
export const apiFootballConfig = {
  apiKey: process.env.API_FOOTBALL_KEY,  // ← Reads from .env
  baseUrl: 'https://v3.football.api-sports.io'
};

// apps/backend/src/services/fixturesService.ts
const response = await fetch(`${apiFootballConfig.baseUrl}/fixtures`, {
  headers: {
    'x-rapidapi-key': apiFootballConfig.apiKey,  // ← Uses the key
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
});
```

**What it fetches:**
- Today's fixtures
- Team statistics
- Head-to-head data
- League standings
- Injury reports

### 2. **OpenAI (GPT-4) Connection**

**When:** Generating AI reasoning for Golden Bets

**Code Flow:**
```typescript
// apps/backend/src/services/openaiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // ← Reads from .env
});

// Generate AI reasoning
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a football betting expert...' },
    { role: 'user', content: `Explain why ${bet.market} is a good bet...` }
  ]
});
```

**What it generates:**
- Detailed bet explanations
- Risk assessments
- Historical context
- Educational insights

---

## 🧪 Testing API Connections

### Test API-Football Connection

```bash
# In apps/backend directory
cd apps/backend

# Start the server
npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Test fixtures endpoint (uses API-Football)
curl http://localhost:3001/api/fixtures?date=2025-11-24
```

**Expected Response:**
```json
{
  "fixtures": [
    {
      "fixture_id": "12345",
      "home_team": "Man City",
      "away_team": "Arsenal",
      "league": "Premier League",
      "kickoff": "2025-11-24T15:00:00Z"
    }
  ]
}
```

### Test OpenAI Connection

```bash
# Test Golden Bets endpoint (uses OpenAI for reasoning)
curl http://localhost:3001/api/golden-bets/today
```

**Expected Response:**
```json
{
  "golden_bets": [
    {
      "bet_id": "GB001",
      "home_team": "Man City",
      "away_team": "Arsenal",
      "market": "Over 2.5 Goals",
      "confidence": 85,
      "ai_reasoning": "Both teams have scored 3+ goals in their last 5 matches..."
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "API_FOOTBALL_KEY is not set"

**Solution:**
1. Check `.env` file exists: `ls apps/backend/.env`
2. Verify key is set: `cat apps/backend/.env | grep API_FOOTBALL_KEY`
3. Restart server: `npm run dev`

### Issue: "OpenAI API error"

**Solution:**
1. Check key is valid: `echo $OPENAI_API_KEY`
2. Test key manually:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```
3. Verify GPT-4 access (some keys only have GPT-3.5)

### Issue: "Rate limit exceeded"

**API-Football Limits:**
- Free tier: 100 requests/day
- Pro tier: 3,000 requests/day

**Solution:**
- Upgrade to Pro tier
- Implement caching (already configured in `apiFootball.ts`)
- Reduce request frequency

---

## 📊 API Usage Monitoring

### Check API-Football Usage

**Dashboard:** https://dashboard.api-football.com/

**View:**
- Requests used today
- Remaining requests
- Upgrade options

### Check OpenAI Usage

**Dashboard:** https://platform.openai.com/usage

**View:**
- API calls made
- Tokens used
- Cost breakdown

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use `.env.example` for templates (already exists)
- Rotate keys periodically
- Use different keys for dev/prod

### ❌ DON'T:
- Commit `.env` to Git
- Share keys publicly
- Use production keys in development
- Hardcode keys in source code

---

## 🚀 Deployment Environment Variables

### Railway (Backend Deployment)

**Set environment variables in Railway dashboard:**

```bash
# Navigate to your Railway project
# Settings → Variables → Add Variable

API_FOOTBALL_KEY=your_production_key
OPENAI_API_KEY=your_production_key
MONGODB_URI=your_mongodb_atlas_uri
CORS_ORIGIN=https://footy-oracle.vercel.app
NODE_ENV=production
```

### Vercel (Frontend Deployment)

**Set environment variables in Vercel dashboard:**

```bash
# Navigate to your Vercel project
# Settings → Environment Variables

VITE_API_BASE_URL=https://oracle-backend.railway.app
```

---

## 📝 Summary

**Key Points:**

1. ✅ **API keys are already in your .env file** - no need to ask for them
2. ✅ **System reads from environment variables automatically**
3. ✅ **API-Football key** used for fixture data
4. ✅ **OpenAI key** used for AI reasoning generation
5. ✅ **Configuration files** handle the connection logic
6. ✅ **No hardcoded keys** - all secure in .env

**The system is ready to use! Just run:**

```bash
cd apps/backend
npm run dev
```

**Your API keys will be loaded automatically from the .env file.**

---

## 🔗 Related Documentation

- [ORACLE_LM_INTEGRATION.md](ORACLE_LM_INTEGRATION.md) - Full system integration guide
- [COMPLETE_SPECIFICATION.md](COMPLETE_SPECIFICATION.md) - Complete system specification
- [apps/backend/SETUP.md](apps/backend/SETUP.md) - Backend setup guide
- [apps/backend/.env.example](apps/backend/.env.example) - Environment template

---

**No more asking for API keys - they're already configured! 🎉**
