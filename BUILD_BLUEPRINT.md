# 🏗️ THE FOOTY ORACLE - BUILD BLUEPRINT
## Daily 2-Hour Sprint Plan | Complete Development Roadmap

**Created:** Nov 23, 2025  
**Estimated Completion:** 12-15 Working Days (24-30 hours total)  
**Sprint Duration:** 2 hours/day  
**Methodology:** Incremental builds with daily testing

---

## 📋 PROJECT OVERVIEW

### What We're Building
A production-ready AI-powered sports betting platform with:
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS (Neon black/purple theme)
- **Backend:** Node.js + Express REST API
- **ML Integration:** Language Model predictions (300k+ fixtures trained)
- **Data Source:** API-Football for live odds and fixtures
- **AI Reasoning:** GPT-5.0 for Golden Bet explanations
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

### Core Features
1. **3 Golden Bets** - Top predictions with 80%+ confidence, AI reasoning, P&L tracking
2. **FlashScore-Style Fixtures** - Date navigation, expandable fixtures, 4 markets per game
3. **P&L Tracker** - Daily/Weekly/Monthly/Yearly stats + €10 ACCA calculator
4. **Smart Filtering** - Top 30 leagues only, no junk markets
5. **Daily Refresh** - Morning updates with new predictions and AI explanations

---

## 🎯 PHASE BREAKDOWN

### **PHASE 1: FOUNDATION** (Days 1-3) - 6 hours
Set up project structure, design system, and core infrastructure

### **PHASE 2: FRONTEND CORE** (Days 4-7) - 8 hours
Build all UI components and layouts with mock data

### **PHASE 3: BACKEND & API** (Days 8-10) - 6 hours
API-Football integration, data processing, endpoints

### **PHASE 4: ML & AI INTEGRATION** (Days 11-12) - 4 hours
Connect ML predictions, GPT-5.0 reasoning, calculations

### **PHASE 5: POLISH & DEPLOY** (Days 13-15) - 6 hours
Testing, optimization, deployment, documentation

---

## 📅 DETAILED DAILY SPRINTS

---

## **DAY 1: Project Setup & Design System** ⏱️ 2 hours

### Goals
- Initialize monorepo structure
- Set up design system and Tailwind config
- Create reusable UI components

### Tasks
1. **Project Initialization** (30 min)
   ```bash
   # Create monorepo structure
   footy-oracle-v2/
   ├── apps/
   │   ├── frontend/          # React + Vite
   │   └── backend/           # Express API
   └── shared/
       └── ml_outputs/        # ML data (JSON)
   ```
   - Initialize Vite + React + TypeScript
   - Install dependencies: TailwindCSS, Lucide icons, Axios
   - Set up ESLint + Prettier

2. **Design System Configuration** (45 min)
   - Configure Tailwind with neon purple theme
   - Create color palette (black, purple gradients, gold accents)
   - Set up typography and spacing system
   - Create CSS utilities for glows and animations

3. **Core UI Components** (45 min)
   - `Button.tsx` - Purple gradient buttons with hover states
   - `Card.tsx` - Black cards with purple borders and glow
   - `Badge.tsx` - Golden star badges, status badges
   - `LoadingSpinner.tsx` - Purple pulse animation
   - `ErrorMessage.tsx` - Red error states

### Deliverables
✅ Working React app with hot reload  
✅ Design system configured  
✅ 5 reusable UI components  
✅ Storybook/component preview (optional)

### Testing
- Run `npm run dev` - app loads with styled components
- Verify purple theme and glow effects work

---

## **DAY 2: Layout & Navigation Structure** ⏱️ 2 hours

### Goals
- Build main layout and header
- Create date navigation component (FlashScore style)
- Set up routing and page structure

### Tasks
1. **Main Layout Component** (40 min)
   - `Layout.tsx` - Header, main content area, footer
   - Responsive container (max-width 7xl)
   - Gradient header with logo and tagline
   - Mobile-responsive navigation

2. **Date Navigation Component** (50 min)
   - `DateSelector.tsx` - Horizontal scrollable date picker
   - Generate 15-day range (7 past, today, 7 future)
   - "TODAY" highlight with purple glow
   - Click handlers for date selection
   - Smooth scroll behavior

3. **Page Structure & Routing** (30 min)
   - Set up React Router
   - Create page components:
     - `HomePage.tsx` (main view)
     - `FixturesPage.tsx` (detailed fixtures)
     - `StatsPage.tsx` (P&L analytics)
   - Navigation between pages

### Deliverables
✅ Responsive layout with header  
✅ Working date navigation  
✅ Page routing configured  
✅ Mobile-friendly design

### Testing
- Navigate between dates - state updates correctly
- Resize browser - layout remains responsive
- Check mobile view (375px width)

---

## **DAY 3: Golden Bets Section** ⏱️ 2 hours

### Goals
- Build the hero section with 3 Golden Bets
- Create GoldenBetCard component
- Implement mock data structure

### Tasks
1. **Golden Bet Card Component** (60 min)
   - `GoldenBetCard.tsx` - Premium card design
   - Golden star badge (absolute positioned, top-right)
   - League badge, team names, kickoff time
   - Market + odds display (large, prominent)
   - AI probability bar (green, percentage)
   - AI reasoning section (collapsible or always visible)
   - Win/Loss result badge (conditional rendering)
   - Hover effects with enhanced glow

2. **Golden Bets Section** (40 min)
   - 3-column grid (responsive to 1 column on mobile)
   - Section header with star icon
   - Mock data for 3 golden bets
   - TypeScript interfaces for GoldenBet type

3. **Mock Data Setup** (20 min)
   - Create `mockData.ts` with sample golden bets
   - Realistic fixture data (Man City vs Liverpool, etc.)
   - AI reasoning text examples
   - Odds and probability values

### Deliverables
✅ 3 stunning Golden Bet cards  
✅ Responsive grid layout  
✅ Mock data structure  
✅ TypeScript types defined

### Testing
- Cards display correctly on desktop and mobile
- Hover effects work smoothly
- AI reasoning is readable and well-formatted

---

## **DAY 4: P&L Performance Tracker** ⏱️ 2 hours

### Goals
- Build P&L stats dashboard
- Create ACCA tracker component
- Implement calculation logic

### Tasks
1. **P&L Stats Component** (50 min)
   - `PLStatsCard.tsx` - Individual stat card
   - 4-column grid: Daily, Weekly, Monthly, Yearly
   - Profit display (green/red based on value)
   - Win rate calculation and display
   - Bet count (wins/total)
   - Gradient backgrounds and borders

2. **ACCA Tracker Component** (50 min)
   - `ACCATracker.tsx` - Special golden-themed card
   - Daily €10 ACCA calculation
   - 4-period breakdown (daily/weekly/monthly/yearly)
   - Potential return calculator
   - Profit/loss tracking
   - Golden star icon and yellow accents

3. **Calculation Logic** (20 min)
   - P&L calculation functions
   - Win rate calculator
   - ACCA odds multiplier (bet1_odds × bet2_odds × bet3_odds)
   - Profit calculator (stake × total_odds - stake)
   - Mock historical data for testing

### Deliverables
✅ P&L dashboard with 4 time periods  
✅ ACCA tracker with calculations  
✅ Calculation utilities  
✅ Mock P&L data

### Testing
- Verify calculations are accurate
- Check green/red color coding works
- Test with different profit/loss scenarios

---

## **DAY 5: Fixtures List - League Groups** ⏱️ 2 hours

### Goals
- Build fixtures list grouped by league
- Create league header component
- Implement fixture row component

### Tasks
1. **League Group Component** (40 min)
   - `LeagueGroup.tsx` - Container for league fixtures
   - League header with name and icon
   - Purple gradient background
   - Collapsible functionality (optional)
   - Fixture count badge

2. **Fixture Row Component** (60 min)
   - `FixtureRow.tsx` - Compact fixture display
   - Time display (HH:MM format)
   - Team names (home/away stacked)
   - Golden bet indicator badge
   - Expand/collapse chevron icon
   - Click handler for expansion
   - Hover state with purple background

3. **Fixtures Grouping Logic** (20 min)
   - Group fixtures by league
   - Sort leagues by priority (top 30 first)
   - Sort fixtures by kickoff time
   - Filter out non-top-30 leagues
   - Mock fixture data for 5+ leagues

### Deliverables
✅ League-grouped fixture list  
✅ Clickable fixture rows  
✅ Golden bet indicators  
✅ Top 30 league filtering

### Testing
- Fixtures group correctly by league
- Click fixture row - expands/collapses
- Only top 30 leagues appear
- Sorted by time within each league

---

## **DAY 6: Fixture Details - 4 Markets** ⏱️ 2 hours

### Goals
- Build expanded fixture details view
- Create market cards for 4 bet types
- Display odds and AI probabilities

### Tasks
1. **Market Card Component** (50 min)
   - `MarketCard.tsx` - Individual market display
   - Market name (BTTS, Over 2.5, etc.)
   - Odds display (large, prominent)
   - AI probability percentage (green text)
   - Purple border and background
   - Responsive grid layout

2. **Fixture Details Panel** (50 min)
   - `FixtureDetails.tsx` - Expanded view
   - 4-column grid (2x2 on mobile)
   - All 4 markets displayed:
     - BTTS (Yes odds + AI %)
     - Over 2.5 Goals (Over odds + AI %)
     - Over 9.5 Corners (Over odds + AI %)
     - Over 3.5 Cards (Over odds + AI %)
   - Golden bet highlight section
   - Slide-down animation

3. **Golden Bet Highlight** (20 min)
   - Special section below markets
   - Golden border and background
   - Shows which market is the golden bet
   - Confidence percentage
   - Star icon

### Deliverables
✅ 4 market cards per fixture  
✅ Expandable details panel  
✅ Golden bet highlight  
✅ Smooth animations

### Testing
- Click fixture - details expand smoothly
- All 4 markets display correctly
- Golden bet is clearly highlighted
- Responsive on mobile (2x2 grid)

---

## **DAY 7: Frontend Polish & Responsiveness** ⏱️ 2 hours

### Goals
- Ensure mobile responsiveness
- Add loading states and error handling
- Implement smooth animations
- Final UI polish

### Tasks
1. **Responsive Design Audit** (40 min)
   - Test all components at 375px, 768px, 1024px, 1440px
   - Fix any layout breaks
   - Adjust font sizes for mobile
   - Ensure touch targets are 44px minimum
   - Test horizontal scrolling on date picker

2. **Loading & Error States** (40 min)
   - `LoadingState.tsx` - Skeleton screens for each section
   - `ErrorState.tsx` - Error messages with retry button
   - Loading spinners for data fetching
   - Empty states ("No fixtures today")
   - Network error handling

3. **Animations & Transitions** (40 min)
   - Smooth expand/collapse for fixtures
   - Fade-in animations for cards
   - Hover transitions (200ms ease)
   - Glow pulse animations
   - Page transition effects

### Deliverables
✅ Fully responsive design  
✅ Loading states for all sections  
✅ Error handling  
✅ Smooth animations

### Testing
- Test on real mobile device
- Simulate slow network (loading states)
- Trigger errors (error states)
- Check all animations are smooth

---

## **DAY 8: Backend Setup & API Structure** ⏱️ 2 hours

### Goals
- Initialize Express backend
- Set up API-Football integration
- Create endpoint structure
- Environment configuration

### Tasks
1. **Backend Initialization** (30 min)
   ```bash
   apps/backend/
   ├── server.js           # Main entry
   ├── routes/             # API routes
   ├── services/           # Business logic
   ├── utils/              # Helpers
   └── .env                # Config
   ```
   - Initialize Express app
   - Install dependencies: express, axios, dotenv, cors
   - Set up middleware (CORS, JSON parser)
   - Create basic health check endpoint

2. **API-Football Integration** (50 min)
   - Sign up for API-Football account
   - Get API key and configure .env
   - Create `apiFootballService.js`
   - Implement functions:
     - `getFixturesByDate(date)` - Fetch fixtures
     - `getOdds(fixtureId)` - Fetch odds for 4 markets
     - `getLeagues()` - Get top 30 leagues
   - Error handling and rate limiting

3. **API Endpoints Structure** (40 min)
   - `GET /api/fixtures?date=YYYY-MM-DD` - Get fixtures by date
   - `GET /api/golden-bets` - Get top 3 golden bets
   - `GET /api/pl-stats` - Get P&L statistics
   - `GET /api/fixture/:id` - Get single fixture details
   - Response formatting and error handling

### Deliverables
✅ Express server running  
✅ API-Football integration  
✅ 4 API endpoints defined  
✅ Environment configuration

### Testing
- `curl http://localhost:3000/health` - returns 200
- Test API-Football connection
- Verify endpoints return mock data

---

## **DAY 9: Data Processing & ML Integration** ⏱️ 2 hours

### Goals
- Process API-Football data
- Integrate ML predictions
- Map odds to 4 markets
- Calculate golden bets

### Tasks
1. **Data Processing Service** (50 min)
   - `dataProcessor.js` - Transform API data
   - Map API-Football odds to our 4 markets:
     - BTTS → Bet ID 8
     - Over 2.5 Goals → Bet ID 5
     - Over 9.5 Corners → Bet ID 12
     - Over 3.5 Cards → Bet ID 11
   - Filter top 30 leagues
   - Format fixture data for frontend

2. **ML Predictions Integration** (50 min)
   - `mlService.js` - Load ML predictions
   - Read from `shared/ml_outputs/predictions.json`
   - Match ML predictions with API fixtures
   - Calculate confidence scores
   - Identify golden bet per fixture (highest probability)

3. **Golden Bet Calculator** (20 min)
   - `goldenBetCalculator.js`
   - Select top 3 golden bets across all fixtures
   - Filter by confidence > 80%
   - Sort by probability × expected_value
   - Format for frontend consumption

### Deliverables
✅ Data processing pipeline  
✅ ML predictions integrated  
✅ Golden bet selection logic  
✅ Top 30 league filtering

### Testing
- Verify odds map correctly to 4 markets
- Check ML predictions match fixtures
- Confirm top 3 golden bets are selected
- Test with sample ML data

---

## **DAY 10: P&L Calculations & Storage** ⏱️ 2 hours

### Goals
- Implement P&L tracking system
- Create ACCA calculator
- Set up data persistence
- Historical results storage

### Tasks
1. **P&L Calculation Service** (50 min)
   - `plCalculator.js` - P&L logic
   - Track bet results (win/loss)
   - Calculate profit/loss per bet (€10 stake)
   - Aggregate by time period:
     - Daily: Today's bets
     - Weekly: Last 7 days
     - Monthly: Last 30 days
     - Yearly: Last 365 days
   - Win rate calculation

2. **ACCA Calculator** (40 min)
   - `accaCalculator.js` - Accumulator logic
   - Daily €10 ACCA on 3 golden bets
   - Multiply odds: bet1 × bet2 × bet3
   - Calculate potential return
   - Track ACCA results (all 3 must win)
   - Aggregate ACCA P&L by period

3. **Data Persistence** (30 min)
   - Set up JSON file storage (or SQLite for production)
   - `storage/results.json` - Historical results
   - `storage/pl_stats.json` - P&L aggregates
   - Save bet results after matches complete
   - Update P&L stats daily

### Deliverables
✅ P&L calculation engine  
✅ ACCA calculator  
✅ Data persistence layer  
✅ Historical tracking

### Testing
- Calculate P&L with sample results
- Verify ACCA odds multiplication
- Test win rate calculations
- Check data saves correctly

---

## **DAY 11: GPT-5.0 AI Reasoning Integration** ⏱️ 2 hours

### Goals
- Integrate OpenAI GPT-5.0 API
- Generate AI reasoning for golden bets
- Cache and store explanations
- Handle API rate limits

### Tasks
1. **OpenAI Integration** (40 min)
   - Sign up for OpenAI API (GPT-5.0 access)
   - Install `openai` package
   - Configure API key in .env
   - Create `aiReasoningService.js`
   - Set up error handling and retries

2. **Reasoning Generation** (60 min)
   - Create prompt template for golden bets:
     ```
     Generate a concise betting analysis for:
     - Fixture: {home_team} vs {away_team}
     - League: {league}
     - Market: {market}
     - AI Probability: {probability}%
     - Recent form, head-to-head, tactical analysis
     - Max 2-3 sentences
     ```
   - Generate reasoning for top 3 golden bets
   - Format and validate responses
   - Handle API failures gracefully

3. **Caching & Storage** (20 min)
   - Cache AI reasoning in `shared/ml_outputs/ai_reasoning.json`
   - Avoid regenerating for same fixtures
   - Daily refresh at 7:00 AM UTC
   - Fallback to generic reasoning if API fails

### Deliverables
✅ GPT-5.0 integration  
✅ AI reasoning generation  
✅ Caching system  
✅ Error handling

### Testing
- Generate reasoning for 3 golden bets
- Verify output quality and length
- Test caching (no duplicate API calls)
- Handle API errors gracefully

---

## **DAY 12: Frontend-Backend Connection** ⏱️ 2 hours

### Goals
- Connect frontend to backend APIs
- Replace mock data with real data
- Implement data fetching hooks
- Handle loading and error states

### Tasks
1. **API Client Setup** (30 min)
   - Create `api/client.ts` - Axios instance
   - Configure base URL and headers
   - Add request/response interceptors
   - Error handling middleware

2. **Data Fetching Hooks** (60 min)
   - `useGoldenBets()` - Fetch top 3 golden bets
   - `useFixtures(date)` - Fetch fixtures by date
   - `usePLStats()` - Fetch P&L statistics
   - `useFixtureDetails(id)` - Fetch single fixture
   - Loading and error states
   - React Query or SWR for caching (optional)

3. **Replace Mock Data** (30 min)
   - Update all components to use real data
   - Remove mock data files
   - Test data flow from backend to UI
   - Verify all fields map correctly

### Deliverables
✅ API client configured  
✅ Data fetching hooks  
✅ Real data in UI  
✅ Loading/error states working

### Testing
- Start backend server
- Frontend fetches real data
- Loading spinners appear during fetch
- Error messages show on failure
- Data displays correctly in UI

---

## **DAY 13: Daily Refresh Automation** ⏱️ 2 hours

### Goals
- Implement daily refresh workflow
- Schedule morning updates (7:30 AM UTC)
- Automate data pipeline
- Result tracking system

### Tasks
1. **Daily Refresh Script** (50 min)
   - `scripts/dailyRefresh.js` - Main automation
   - Workflow:
     1. Fetch today's fixtures from API-Football (6:00 AM)
     2. Load ML predictions for fixtures (6:30 AM)
     3. Fetch odds for 4 markets (7:00 AM)
     4. Calculate golden bets (7:15 AM)
     5. Generate AI reasoning via GPT-5.0 (7:20 AM)
     6. Update frontend data (7:30 AM)
   - Error handling and logging

2. **Scheduler Setup** (40 min)
   - Use `node-cron` for scheduling
   - Schedule daily refresh at 7:30 AM UTC
   - Schedule result updates (after matches complete)
   - Health check notifications
   - Logging system

3. **Result Tracking** (30 min)
   - `scripts/updateResults.js` - Fetch match results
   - Update bet outcomes (win/loss)
   - Recalculate P&L stats
   - Update ACCA results
   - Run every hour to catch completed matches

### Deliverables
✅ Daily refresh automation  
✅ Scheduled tasks  
✅ Result tracking  
✅ Logging system

### Testing
- Manually trigger daily refresh
- Verify all steps complete successfully
- Check data updates in frontend
- Test result tracking with completed matches

---

## **DAY 14: Deployment & Production Setup** ⏱️ 2 hours

### Goals
- Deploy frontend to Vercel
- Deploy backend to Railway/Render
- Configure environment variables
- Set up monitoring

### Tasks
1. **Frontend Deployment** (40 min)
   - Create Vercel account
   - Connect GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Output directory: `dist`
   - Set environment variables (API URL)
   - Deploy and test

2. **Backend Deployment** (50 min)
   - Create Railway/Render account
   - Deploy Express app
   - Configure environment variables:
     - API_FOOTBALL_KEY
     - OPENAI_API_KEY
     - PORT
   - Set up persistent storage (for JSON files)
   - Configure CORS for frontend domain

3. **Production Configuration** (30 min)
   - Update frontend API URL to production backend
   - Test end-to-end flow in production
   - Set up error monitoring (Sentry optional)
   - Configure logging (Winston or similar)
   - Set up uptime monitoring (UptimeRobot)

### Deliverables
✅ Frontend live on Vercel  
✅ Backend live on Railway/Render  
✅ Production environment configured  
✅ Monitoring set up

### Testing
- Visit production URL
- Test all features work
- Check API calls succeed
- Verify daily refresh runs
- Monitor logs for errors

---

## **DAY 15: Final Polish & Documentation** ⏱️ 2 hours

### Goals
- Final UI polish and bug fixes
- Write comprehensive documentation
- Create user guide
- Performance optimization

### Tasks
1. **UI Polish & Bug Fixes** (40 min)
   - Fix any visual inconsistencies
   - Optimize images and assets
   - Improve loading performance
   - Add meta tags for SEO
   - Favicon and app icons
   - Final responsive testing

2. **Documentation** (50 min)
   - Update `README.md` with:
     - Project overview
     - Setup instructions
     - API documentation
     - Deployment guide
     - Environment variables
   - Create `ARCHITECTURE.md` - System design
   - Create `API.md` - API endpoint docs
   - Add inline code comments

3. **Performance Optimization** (30 min)
   - Lazy load components
   - Optimize bundle size
   - Enable gzip compression
   - Add caching headers
   - Lighthouse audit and fixes
   - Test on slow 3G network

### Deliverables
✅ Polished production app  
✅ Comprehensive documentation  
✅ Performance optimized  
✅ Ready for users

### Testing
- Full end-to-end testing
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile device testing
- Performance benchmarks
- User acceptance testing

---

## 📊 PROJECT TIMELINE SUMMARY

| Phase | Days | Hours | Deliverables |
|-------|------|-------|--------------|
| **Phase 1: Foundation** | 1-3 | 6h | Project setup, design system, Golden Bets UI |
| **Phase 2: Frontend Core** | 4-7 | 8h | P&L tracker, fixtures list, details, polish |
| **Phase 3: Backend & API** | 8-10 | 6h | Express server, API-Football, data processing |
| **Phase 4: ML & AI** | 11-12 | 4h | GPT-5.0 integration, frontend connection |
| **Phase 5: Deploy & Polish** | 13-15 | 6h | Automation, deployment, documentation |
| **TOTAL** | **15 days** | **30h** | **Production-ready app** |

---

## 🎯 ESTIMATED COMPLETION TIME

### **Best Case:** 12 days (24 hours)
- No major blockers
- APIs work smoothly
- Minimal debugging needed

### **Realistic:** 15 days (30 hours)
- Some API integration challenges
- Minor bug fixes
- Design iterations

### **Buffer:** 18 days (36 hours)
- API-Football rate limits
- GPT-5.0 API issues
- Unexpected bugs
- Design changes

**Recommended Timeline:** **15 working days** with 2-hour daily sprints

---

## 🚀 DAILY WORKFLOW

### Each Day's Structure (2 hours)
1. **Review (5 min)** - Check previous day's work
2. **Build (90 min)** - Execute day's tasks
3. **Test (15 min)** - Verify deliverables
4. **Commit (10 min)** - Git commit with clear message

### Communication Protocol
- **Start of Day:** "Ready for Day X - [Task Name]"
- **During Build:** Share progress updates
- **End of Day:** "Day X Complete ✅" + screenshot/demo
- **Blockers:** Immediately flag any issues

---

## 📦 DEPENDENCIES & PREREQUISITES

### Required Accounts
- [ ] GitHub account (for repo)
- [ ] API-Football account + API key
- [ ] OpenAI account + GPT-5.0 API key
- [ ] Vercel account (frontend hosting)
- [ ] Railway/Render account (backend hosting)

### Required Tools
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Postman/Insomnia (API testing)

### Required Knowledge
- React + TypeScript basics
- REST API concepts
- Git workflow
- Basic terminal commands

---

## 🎨 DESIGN ASSETS NEEDED

### From You
- [ ] Logo/branding (if any)
- [ ] Preferred purple hex codes (or use defaults)
- [ ] Any specific UI preferences
- [ ] Sample ML prediction data format

### We'll Create
- ✅ Complete UI design system
- ✅ Component library
- ✅ Responsive layouts
- ✅ Animations and interactions

---

## 🔧 TECHNICAL DECISIONS

### Frontend Stack
- **Framework:** React 18 (hooks, functional components)
- **Language:** TypeScript (type safety)
- **Styling:** TailwindCSS (utility-first)
- **Build Tool:** Vite (fast HMR)
- **Icons:** Lucide React (consistent icons)
- **HTTP Client:** Axios (API calls)

### Backend Stack
- **Runtime:** Node.js 18+
- **Framework:** Express (lightweight)
- **Language:** JavaScript (ES6+)
- **Storage:** JSON files (simple, no DB needed initially)
- **Scheduler:** node-cron (daily tasks)

### APIs & Services
- **Fixtures/Odds:** API-Football
- **AI Reasoning:** OpenAI GPT-5.0
- **Hosting:** Vercel (frontend) + Railway (backend)

---

## 🎯 SUCCESS CRITERIA

### Must Have (MVP)
- ✅ 3 Golden Bets displayed with AI reasoning
- ✅ FlashScore-style fixture navigation
- ✅ 4 markets per fixture (BTTS, O2.5, O9.5 Corners, O3.5 Cards)
- ✅ P&L tracking (daily/weekly/monthly/yearly)
- ✅ €10 ACCA calculator
- ✅ Top 30 leagues only
- ✅ Daily refresh automation
- ✅ Mobile responsive
- ✅ Production deployed

### Nice to Have (Post-MVP)
- 🔄 User authentication
- 🔄 Personalized bet tracking
- 🔄 Push notifications
- 🔄 Historical data charts
- 🔄 League-specific golden bets
- 🔄 Value bets section

---

## 📝 NOTES & CONSIDERATIONS

### API-Football Rate Limits
- Free tier: 100 requests/day
- Paid tier: 1000+ requests/day
- **Strategy:** Cache fixtures daily, minimize API calls

### GPT-5.0 Costs
- ~$0.01-0.03 per reasoning generation
- 3 golden bets/day = ~$0.09/day = ~$2.70/month
- **Strategy:** Cache reasoning, regenerate only when needed

### ML Predictions
- Assuming you have pre-trained models
- Predictions stored in JSON format
- Daily updates via your ML pipeline

### Scalability
- Current design handles 100-500 fixtures/day
- JSON storage works for MVP
- Migrate to PostgreSQL if scaling beyond 1000 users

---

## 🚨 RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| API-Football rate limits | High | Cache aggressively, upgrade plan if needed |
| GPT-5.0 API failures | Medium | Fallback to generic reasoning, retry logic |
| ML predictions unavailable | High | Use historical predictions, manual fallback |
| Deployment issues | Medium | Test locally first, use staging environment |
| Design changes mid-build | Low | Lock design after Day 3, iterate post-MVP |

---

## 🎉 LET'S BUILD!

**Ready to start?** Just say:
- "Let's start Day 1" - I'll begin project setup
- "Show me Day X tasks" - I'll detail that day's work
- "I have a question about [topic]" - I'll clarify

**This blueprint is your roadmap.** We'll build incrementally, test daily, and ship a production-ready app in 15 days. Let's make The Footy Oracle a reality! ⚡

---

**Blueprint Version:** 1.0  
**Last Updated:** Nov 23, 2025  
**Status:** Ready to Execute 🚀