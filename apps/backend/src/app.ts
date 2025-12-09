import express from 'express';
import debugRouter from './routes/debug';
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://footy-oracle-v2.vercel.app",
    /https:\/\/footy-oracle-v2-.*\.vercel\.app$/,
    "http://localhost:5173"
  ],
  methods: ["GET","POST"],
  credentials: false
}));

app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// IMPORT ALL ROUTES
import fixturesRoutes from "./routes/fixtures";
import adminRoutes from "./routes/admin";
import notificationsRoutes from "./routes/notifications";
import fixtureDetailsRoutes from "./routes/fixtureDetails";
import goldenBetsRoutes from "./routes/goldenBets";
import predictionsRoutes from "./routes/predictions";
import statsRoutes from "./routes/stats";
import bettingInsightsRoutes from "./routes/bettingInsights";
import pnlRoutes from "./routes/pnl";
import liveFixturesRoutes from "./routes/liveFixtures";
import betBuilderRoutes from "./routes/betBuilder";
import valueBetsRoutes from "./routes/valueBets";

// IMPORT CRON JOBS
import { startFixturesCron } from "./cron/fixturesCron";
import { startLiveScoresCron } from "./cron/liveScoresCron";
import { startMLPredictionsCron } from "./cron/mlPredictionsCron";

// MOUNT ROUTES
app.use("/api", fixtureDetailsRoutes);                  // <-- enables /fixtures/:id/events, /stats, /h2h
app.use("/api/fixtures", fixturesRoutes);
app.use('/api/debug', debugRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/golden-bets", goldenBetsRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/betting-insights", bettingInsightsRoutes);
app.use("/api/pnl", pnlRoutes);
app.use("/api/live-fixtures", liveFixturesRoutes);
app.use('/api/debug', debugRouter);
app.use("/api/bet-builder", betBuilderRoutes);
app.use("/api/value-bets", valueBetsRoutes);

// 🚨 CRITICAL: START ALL CRON JOBS
console.log("🚀 Initializing cron jobs...");
startFixturesCron();      // 3 AM: Load fixtures window (7 days back + 7 days ahead)
                          // 5 AM: Update odds for today's fixtures
startLiveScoresCron();    // Every 2 minutes: Update live scores
startMLPredictionsCron(); // 6 AM: Generate ML predictions (Golden Bets + Value Bets)
                          // Every 10 min: Keep ML API awake
console.log("✅ All cron jobs started successfully");
console.log("   📅 Fixtures: 3 AM daily (window load) + 5 AM (odds update)");
console.log("   🤖 ML Predictions: 6 AM daily + keep-alive every 10 min");
console.log("   ⚽ Live Scores: Every 2 minutes");

export default app;
