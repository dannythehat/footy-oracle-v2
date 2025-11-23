# 🚀 THE FOOTY ORACLE - Quick Start Guide

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2
```

2. **Navigate to frontend**
```bash
cd apps/frontend
```

3. **Install dependencies**
```bash
npm install
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
The app will automatically open at `http://localhost:3000`

### Available Pages
- **Home** (`/`) - Golden Bets, P&L Stats, Fixtures Modal
- **History** (`/history`) - Historical Results with Filters & Export

### Features to Test
✅ 3 Golden Bets cards with AI reasoning  
✅ P&L tracker (Golden Bets + Treble)  
✅ Fixtures modal with search/filter  
✅ Historical results with advanced filters  
✅ CSV export functionality  
✅ Responsive mobile design  

### Mock Data
Currently using mock data for demonstration. Real API integration coming in Phase 2.

---

## Project Structure
```
apps/frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx          # Main page with golden bets
│   │   └── HistoricalResults.tsx # Historical data & filters
│   ├── App.tsx                    # Router & navigation
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Next Steps
- [ ] API-Football integration
- [ ] Database setup
- [ ] ML prediction pipeline
- [ ] Real-time odds updates
- [ ] User authentication

See `TODO.md` for complete roadmap.
