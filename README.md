# 🏆 THE FOOTY ORACLE v2

AI-powered sports betting platform with Golden Bets, Value Bets, and fixture predictions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## ✨ Features

- **3 Golden Bets Daily** - Top AI predictions with 80%+ confidence
- **AI Reasoning** - GPT-4 powered explanations for each bet
- **P&L Tracking** - Daily/Weekly/Monthly/Yearly profit tracking
- **FlashScore-Style Fixtures** - Browse 30+ top leagues
- **Smart Filtering** - Only quality markets, no junk bets
- **Treble Calculator** - €10 ACCA with potential returns
- **Historical Results** - Export and analyze past performance

## 🏗️ Architecture

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS (Neon purple/black theme)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Deployment:** Vercel

### Backend
- **Framework:** Express + TypeScript
- **Database:** MongoDB with Mongoose
- **APIs:** API-Football, OpenAI GPT-4
- **Cron:** Daily prediction updates
- **Deployment:** Railway

### ML Pipeline
- **Training Data:** 300k+ historical fixtures
- **Confidence Scoring:** 0-100% prediction confidence
- **Golden Bet Selection:** Top 3 daily picks (80%+ confidence)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API-Football API key
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2

# Install all dependencies
npm run install:all

# Configure environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your API keys
```

### Development

```bash
# Run frontend (http://localhost:3000)
npm run dev:frontend

# Run backend (http://localhost:3001)
npm run dev:backend
```

### Production Build

```bash
# Build both frontend and backend
npm run build
```

## 📁 Project Structure

```
footy-oracle-v2/
├── apps/
│   ├── frontend/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/     # HomePage, HistoricalResults
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   └── backend/           # Express API
│       ├── src/
│       │   ├── models/    # Mongoose models
│       │   ├── routes/    # API endpoints
│       │   ├── services/  # Business logic
│       │   └── server.ts
│       └── package.json
├── shared/
│   └── ml_outputs/        # ML predictions data
├── BUILD_BLUEPRINT.md     # Development roadmap
├── COMPLETE_SPECIFICATION.md
├── TODO.md
└── VISION.md
```

## 🔌 API Endpoints

### Golden Bets
- `GET /api/golden-bets/today` - Today's top 3 predictions
- `GET /api/golden-bets` - Historical Golden Bets

### Fixtures
- `GET /api/fixtures?date=YYYY-MM-DD` - Get fixtures by date
- `GET /api/fixtures/meta/leagues` - Available leagues

### Statistics
- `GET /api/stats/pnl?period=daily|weekly|monthly|yearly` - P&L stats
- `GET /api/stats/treble` - Today's treble calculator
- `GET /api/stats/overview` - Platform overview

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push to main
```

### Backend (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Environment Variables

**Backend (.env):**
```env
PORT=3001
API_FOOTBALL_KEY=your_key
OPENAI_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## 📊 Development Roadmap

See [BUILD_BLUEPRINT.md](BUILD_BLUEPRINT.md) for detailed 15-day development plan.

**Current Status:** ✅ Backend Complete | ✅ Frontend Complete | 🚧 Deployment

## 🧪 Testing

```bash
# Frontend tests
cd apps/frontend
npm test

# Backend tests
cd apps/backend
npm test
```

## 📝 Documentation

- [Build Blueprint](BUILD_BLUEPRINT.md) - Daily sprint plan
- [Complete Specification](COMPLETE_SPECIFICATION.md) - Full requirements
- [Vision Document](VISION.md) - Product vision
- [TODO List](TODO.md) - Task tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👤 Author

**Danny Allan**
- GitHub: [@dannythehat](https://github.com/dannythehat)
- Email: allandanny429@gmail.com

## 🙏 Acknowledgments

- API-Football for fixture and odds data
- OpenAI for GPT-4 reasoning
- Vercel for frontend hosting
- Railway for backend hosting

---

**Built with ❤️ for sports betting enthusiasts**
