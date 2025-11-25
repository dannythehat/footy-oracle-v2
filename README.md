# 🏆 THE FOOTY ORACLE v2

AI-powered sports betting platform with Golden Bets, Bet Builder Brain, and transparent performance tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-success.svg)

## 🌐 Live Deployments

- **Frontend**: [https://footy-oracle-v2-kr92se707-dannys-projects-83c67aed.vercel.app](https://footy-oracle-v2-kr92se707-dannys-projects-83c67aed.vercel.app)
- **Backend**: Deployed on Vercel (serverless)

## ✨ Features

### **Core Features**
- **3 Golden Bets Daily** - Top AI predictions with 80%+ confidence
- **Bet Builder Brain** - Multi-market convergence detection (3+ markets @ 75%+ confidence)
- **AI Reasoning** - GPT-4 powered explanations for every bet
- **P&L Tracking** - Daily/Weekly/Monthly/Yearly profit tracking with full transparency
- **FlashScore-Style Fixtures** - Browse 30+ top leagues with real-time odds
- **Historical Results** - Advanced filtering, search, and CSV export
- **Smart Filtering** - Only quality markets, no junk bets

### **What Makes Us Different**
- 🧠 **Multi-Market AI Convergence** - Identifies rare opportunities where 3+ markets align
- 📊 **Full Transparency** - Every bet tracked, every result published
- 🎯 **Value-Focused** - Markup value analysis on every prediction
- 🤖 **GPT-4 Reasoning** - Understand the "why" behind each bet

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
- **Deployment:** Vercel (serverless functions)

### ML Pipeline
- **Training Data:** 300k+ historical fixtures
- **Confidence Scoring:** 0-100% prediction confidence
- **Golden Bet Selection:** Top 3 daily picks (80%+ confidence)
- **Bet Builder Detection:** Multi-market convergence analysis

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
│   │   │   ├── pages/     # HomePage, HistoricalResults, BetBuilderHistory
│   │   │   ├── components/ # BetBuilderCard, FixturesModal, BetFilters
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   └── backend/           # Express API
│       ├── src/
│       │   ├── models/    # Mongoose models (GoldenBet, BetBuilder)
│       │   ├── routes/    # API endpoints
│       │   ├── services/  # Business logic (betBuilderService)
│       │   └── server.ts
│       └── package.json
├── shared/
│   └── ml_outputs/        # ML predictions data
├── BUILD_BLUEPRINT.md     # Development roadmap
├── COMPLETE_SPECIFICATION.md
├── BET_BUILDER_LM_INTEGRATION.md  # LM system integration guide
├── IMPLEMENTATION_STATUS.md       # Current status summary
├── TODO.md
└── VISION.md
```

## 🔌 API Endpoints

### Golden Bets
- `GET /api/golden-bets/today` - Today's top 3 predictions
- `GET /api/golden-bets` - Historical Golden Bets

### Bet Builder
- `GET /api/bet-builders/today` - Today's multi-market opportunities
- `GET /api/bet-builders/history` - Historical Bet Builders

### Fixtures
- `GET /api/fixtures?date=YYYY-MM-DD` - Get fixtures by date
- `GET /api/fixtures/meta/leagues` - Available leagues

### Statistics
- `GET /api/stats/pnl?period=daily|weekly|monthly|yearly` - P&L stats
- `GET /api/stats/overview` - Platform overview

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/send` - Send notification (admin)

## 🚢 Deployment

### Both Frontend & Backend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push to main
# Configure separate projects for frontend and backend
```

### Environment Variables

**Backend (.env):**
```env
PORT=3001
API_FOOTBALL_KEY=your_key
OPENAI_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=https://your-frontend-url.vercel.app
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 📊 Implementation Status

**Current Status:** ✅ **Production Ready**

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed completion status.

| Component | Status |
|-----------|--------|
| Backend API | ✅ 100% Complete |
| Frontend UI | ✅ 100% Complete |
| Bet Builder Brain | ✅ 100% Complete |
| Deployment | ✅ Live on Vercel |
| Documentation | ✅ Complete |

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

- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current completion status
- [Build Blueprint](BUILD_BLUEPRINT.md) - Daily sprint plan
- [Complete Specification](COMPLETE_SPECIFICATION.md) - Full requirements
- [Vision Document](VISION.md) - Product vision
- [Bet Builder LM Integration](BET_BUILDER_LM_INTEGRATION.md) - ML system integration
- [TODO List](TODO.md) - Task tracking

## 🎯 Key Differentiators

### 1. **Bet Builder Brain**
Unlike generic bet builders, our AI identifies **rare multi-market convergence opportunities** where 3+ markets show 75%+ confidence simultaneously. This is statistically rare and represents genuine value.

### 2. **Full Transparency**
Every bet is tracked. Every result is published. CSV exports available. No hiding losses.

### 3. **AI Reasoning**
GPT-4 explains the "why" behind each prediction, covering form, head-to-head, tactics, and more.

### 4. **Value-Focused**
Markup value analysis on every bet. We don't just predict outcomes—we find value.

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
- Vercel for hosting (frontend & backend)

---

**Built with ❤️ for sports betting enthusiasts**
