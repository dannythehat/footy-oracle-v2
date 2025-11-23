# 🚀 Footy Oracle Backend API

Production-ready Express API for AI-powered sports betting predictions.

## 🏗️ Architecture

- **Framework:** Express + TypeScript
- **Database:** MongoDB with Mongoose
- **External APIs:** API-Football, OpenAI GPT-4
- **Cron Jobs:** Daily prediction updates
- **Deployment:** Railway/Render ready

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `API_FOOTBALL_KEY` - Get from api-football.com
- `OPENAI_API_KEY` - Get from platform.openai.com
- `MONGODB_URI` - MongoDB connection string

## 🚀 Running

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Golden Bets
- `GET /api/golden-bets/today` - Today's top 3 Golden Bets
- `GET /api/golden-bets/:id` - Get specific Golden Bet
- `GET /api/golden-bets` - Historical Golden Bets with filters

### Fixtures
- `GET /api/fixtures` - Get fixtures (filter by date, league, status)
- `GET /api/fixtures/:id` - Get specific fixture
- `GET /api/fixtures/meta/leagues` - Get available leagues

### Predictions
- `GET /api/predictions` - All predictions with filters
- `GET /api/predictions/fixture/:fixtureId` - Predictions for specific fixture

### Statistics
- `GET /api/stats/pnl` - P&L statistics (daily/weekly/monthly/yearly)
- `GET /api/stats/treble` - Today's treble calculator
- `GET /api/stats/overview` - Overall platform statistics

## 🔄 Cron Jobs

Daily prediction update runs at 6 AM (configurable via `PREDICTION_CRON_SCHEDULE`):
1. Fetches today's fixtures from API-Football
2. Loads ML predictions
3. Selects top 3 Golden Bets
4. Generates AI reasoning via GPT-4
5. Updates database

## 🗄️ Database Models

### Prediction
- Fixture details (teams, league, date)
- Market and prediction
- Odds and confidence score
- AI reasoning
- Result tracking (win/loss/pending)
- P&L calculation

### Fixture
- Match information
- Odds for multiple markets
- Live status updates
- Score tracking

## 🧪 Testing

```bash
npm test
```

## 📝 Development Notes

- Uses ES modules (`type: "module"`)
- TypeScript strict mode enabled
- Auto-reload with `tsx watch`
- CORS configured for frontend

## 🚢 Deployment

### Railway
```bash
railway up
```

### Render
Connect GitHub repo and deploy automatically.

### Docker
```bash
docker build -t footy-oracle-backend .
docker run -p 3001:3001 footy-oracle-backend
```

## 📊 Monitoring

Health check endpoint: `GET /health`

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T15:00:00.000Z",
  "environment": "production"
}
```
