# 🏆 Footy Oracle Backend

Backend API for Footy Oracle - AI-powered sports betting platform with **ChatGPT 5.0** reasoning.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev

# Run production build
npm run build
npm start
```

## 📊 Historical Data Seeding

Seed the database with realistic historical predictions from **Nov 1-24, 2025**:

```bash
# Run seeding script
./seed-historical.sh

# Or directly
npx tsx src/scripts/seedHistoricalPredictions.ts
```

**Features:**
- ✅ Fetches actual match results from API-Football
- ✅ Generates predictions with 70% accuracy
- ✅ Ensures 2 days where all 3 Golden Bets won (ACCA profit)
- ✅ Calculates realistic P&L and value bets
- ✅ Full AI reasoning for each prediction

**See:** [HISTORICAL_SEEDING.md](HISTORICAL_SEEDING.md) for complete documentation.

## 🔌 API Endpoints

### Golden Bets
- `GET /api/golden-bets/today` - Today's top 3 predictions
- `GET /api/golden-bets` - Historical Golden Bets with filters

### Bet Builder
- `GET /api/bet-builders/today` - Today's multi-market opportunities
- `GET /api/bet-builders/history` - Historical Bet Builders

### Fixtures
- `GET /api/fixtures?date=YYYY-MM-DD` - Get fixtures by date
- `GET /api/fixtures/meta/leagues` - Available leagues

### Statistics
- `GET /api/stats/pnl?period=daily|weekly|monthly|yearly` - P&L stats
- `GET /api/stats/overview` - Platform overview

## 🛠️ Tech Stack

- **Framework:** Express + TypeScript
- **Database:** MongoDB with Mongoose
- **APIs:** API-Football, OpenAI ChatGPT 5.0
- **Deployment:** Vercel (serverless)

## 📚 Documentation

- [Historical Seeding Guide](HISTORICAL_SEEDING.md)
- [API Integration Guide](API_INTEGRATION_GUIDE.md)
- [Deployment Guide](../../DEPLOYMENT.md)

## 🔧 Environment Variables

```env
PORT=3001
API_FOOTBALL_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
MONGODB_URI=mongodb://localhost:27017/footy-oracle
CORS_ORIGIN=http://localhost:3000
```

## 📄 License

MIT License - see [LICENSE](../../LICENSE)

---

**Built with ❤️ for sports betting enthusiasts**
