# ⚡ Quick Reference - Fixtures Service

## 🚀 Quick Start
```bash
cd apps/backend
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
npm run test:fixtures
npm run dev
```

## 🔑 Environment Setup
```env
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4
```

## 📡 API Endpoints

### Health Check
```bash
GET /api/fixtures/health
```

### Analyze Single Fixture
```bash
POST /api/fixtures/analyze
{
  "id": "1",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "league": "League",
  "date": "2025-11-24T15:00:00Z"
}
```

### Analyze Multiple Fixtures
```bash
POST /api/fixtures/analyze-bulk
{
  "fixtures": [...]
}
```

### Find Golden Bets
```bash
POST /api/fixtures/golden-bets
{
  "fixtures": [...]
}
```

### Find Value Bets
```bash
POST /api/fixtures/value-bets
{
  "fixtures": [...]
}
```

## 🧪 Testing
```bash
npm run test:fixtures    # Run test suite
npm run dev             # Start dev server
npm run build           # Build for production
```

## 📊 Response Format
```json
{
  "success": true,
  "data": {
    "fixtureId": "1",
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "prediction": {
      "winner": "home|away|draw",
      "confidence": 75,
      "scorePrediction": "2-1"
    },
    "markets": [...],
    "reasoning": "...",
    "goldenBet": {...}
  }
}
```

## 💰 Costs
- **Per Fixture**: ~$0.03
- **100/day**: ~$3.00
- **Monthly**: ~$90

## 🎯 Golden Bet Criteria
- Confidence: ≥75%
- Odds: ≥1.5
- AI-generated reasoning

## 💎 Value Bet Criteria
- Edge: ≥10%
- Sorted by edge %
- Multiple markets

## 📚 Documentation
- **Full API Docs**: `FIXTURES_SERVICE.md`
- **Setup Guide**: `SETUP.md`
- **Build Summary**: `BUILD_COMPLETE.md`

## 🔧 Troubleshooting

### API Key Error
```bash
# Check .env file exists
ls -la .env

# Verify key is set
grep OPENAI_API_KEY .env
```

### Rate Limits
- Reduce batch size (default: 5)
- Increase delay (default: 1s)
- Upgrade OpenAI plan

### Server Not Starting
```bash
# Check port availability
lsof -i :3001

# Check dependencies
npm install
```

## 🎨 Example cURL
```bash
curl -X POST http://localhost:3001/api/fixtures/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "homeTeam": "Manchester City",
    "awayTeam": "Arsenal",
    "league": "Premier League",
    "date": "2025-11-24T15:00:00Z",
    "homeForm": ["W","W","D","L","W"],
    "awayForm": ["W","D","W","W","L"]
  }'
```

## 🔐 Security Checklist
- ✅ .env in .gitignore
- ✅ API key not in code
- ✅ Environment variables only
- ✅ No keys in commits

## 📞 Support
- Check logs: `console.log` output
- Test endpoint: `/api/fixtures/health`
- Verify OpenAI: https://platform.openai.com
- Review docs: `FIXTURES_SERVICE.md`

---
**Status**: ✅ Ready to Use
**Version**: 1.0.0
**Last Updated**: Nov 23, 2025
