import express from "express";
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
import { startLiveScoresCron } from "./cron/liveScoresCron";

// MOUNT ROUTES
app.use("/api", fixtureDetailsRoutes);                  // <-- enables /fixtures/:id/events, /stats, /h2h
app.use("/api/fixtures", fixturesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/golden-bets", goldenBetsRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/betting-insights", bettingInsightsRoutes);
app.use("/api/pnl", pnlRoutes);
app.use("/api/live-fixtures", liveFixturesRoutes);
app.use("/api/bet-builder", betBuilderRoutes);
app.use("/api/value-bets", valueBetsRoutes);

// 🚨 CRITICAL: START CRON JOBS
// This was missing - cron jobs were defined but never started!
console.log("🚀 Initializing cron jobs...");
startLiveScoresCron();
console.log("✅ Cron jobs started successfully");

export default app;
