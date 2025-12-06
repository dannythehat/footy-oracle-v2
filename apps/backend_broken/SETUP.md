# 🚀 Fixtures Service Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd apps/backend
npm install
```

### 2. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env
```

Add your OpenAI API key:
```env
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4
```

### 3. Test the Service
```bash
npm run test:fixtures
```

Expected output:
```
🚀 Starting Fixtures Service Tests...
=====================================
✅ OpenAI API Key found
📝 Model: gpt-4

🔍 Testing Single Fixture Analysis...
✅ Single Analysis Success!

🔍 Testing Bulk Fixture Analysis...
✅ Bulk Analysis Success! Analyzed 3 fixtures

🏆 Testing Golden Bets Detection...
✅ Found X Golden Bets!

💎 Testing Value Bets Detection...
✅ Found X Value Bets!

=====================================
✅ All tests completed!
```

### 4. Start the Server
```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API Usage

### Test with cURL

#### 1. Health Check
```bash
curl http://localhost:3001/api/fixtures/health
```

#### 2. Analyze Single Fixture
```bash
curl -X POST http://localhost:3001/api/fixtures/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "12345",
    "homeTeam": "Manchester City",
    "awayTeam": "Arsenal",
    "league": "Premier League",
    "date": "2025-11-24T15:00:00Z",
    "homeForm": ["W", "W", "W", "D", "W"],
    "awayForm": ["W", "D", "W", "W", "L"]
  }'
```

#### 3. Find Golden Bets
```bash
curl -X POST http://localhost:3001/api/fixtures/golden-bets \
  -H "Content-Type: application/json" \
  -d '{
    "fixtures": [
      {
        "id": "1",
        "homeTeam": "Liverpool",
        "awayTeam": "Chelsea",
        "league": "Premier League",
        "date": "2025-11-24T15:00:00Z"
      },
      {
        "id": "2",
        "homeTeam": "Real Madrid",
        "awayTeam": "Barcelona",
        "league": "La Liga",
        "date": "2025-11-24T20:00:00Z"
      }
    ]
  }'
```

### Test with Postman

1. Import the collection from `postman_collection.json` (if available)
2. Set base URL: `http://localhost:3001`
3. Test each endpoint

## Features Implemented

✅ **AI-Powered Analysis**
- Single fixture analysis
- Bulk fixture processing
- GPT-4 integration

✅ **Golden Bets Detection**
- 75%+ confidence threshold
- 1.5+ odds requirement
- Detailed reasoning

✅ **Value Bets Calculation**
- 10%+ edge detection
- Implied probability comparison
- Sorted by edge percentage

✅ **Multiple Markets**
- Match winner
- Score prediction
- Over/Under goals
- Both teams to score (BTTS)
- Custom markets

## File Structure

```
apps/backend/
├── src/
│   ├── services/
│   │   ├── fixturesService.ts    # Core AI analysis logic
│   │   └── aiService.ts          # OpenAI integration
│   ├── routes/
│   │   └── fixtures.ts           # API endpoints
│   └── server.ts                 # Express server
├── test-fixtures.ts              # Test script
├── .env.example                  # Environment template
├── .env                          # Your config (not in git)
└── FIXTURES_SERVICE.md           # Full documentation
```

## Troubleshooting

### OpenAI API Key Not Found
```
❌ OPENAI_API_KEY not found in environment variables!
```
**Solution**: Create `.env` file with your API key

### Rate Limit Errors
```
Error: Rate limit exceeded
```
**Solution**: 
- Reduce batch size in `fixturesService.ts`
- Increase delay between batches
- Upgrade OpenAI plan

### Invalid JSON Response
```
Error: Failed to parse AI response
```
**Solution**: 
- Check OpenAI model supports JSON mode
- Verify prompt formatting
- Try different temperature setting

## Next Steps

1. ✅ Test the service with real fixtures
2. ✅ Integrate with API-Football for live data
3. ✅ Add caching to reduce API costs
4. ✅ Deploy to production (Railway/Vercel)
5. ✅ Monitor accuracy and calibrate confidence

## Cost Estimation

**GPT-4 Pricing** (as of Nov 2025):
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens

**Per Fixture Analysis**:
- ~500 input tokens
- ~300 output tokens
- Cost: ~$0.03 per fixture

**Daily Usage** (100 fixtures):
- Cost: ~$3.00/day
- Monthly: ~$90/month

**Optimization Tips**:
- Use GPT-3.5-turbo for non-critical analysis ($0.001/1K tokens)
- Cache predictions for 24 hours
- Batch process during off-peak hours

## Support

For issues or questions:
1. Check `FIXTURES_SERVICE.md` for detailed docs
2. Review test output for errors
3. Check OpenAI dashboard for API status
4. Verify environment variables

## Security Notes

⚠️ **NEVER commit `.env` file to git**
⚠️ **Rotate API keys regularly**
⚠️ **Use environment variables in production**
⚠️ **Monitor API usage and costs**

---

Built with ❤️ for Footy Oracle v2
