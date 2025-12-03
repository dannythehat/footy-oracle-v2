import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://footy-oracle-v2.vercel.app",
    "https://footy-oracle-v2-*.vercel.app",
    "https://footy-oracle-v2-dannys-projects-83c67aed.vercel.app"
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
import fixtureDetailsRoutes from "./routes/fixtureDetails";
import betBuilderRoutes from "./routes/betBuilder";
import valueBetsRoutes from "./routes/valueBets";

// MOUNT ALL ROUTES
// NOTE: fixtureDetailsRoutes must be mounted at /api because routes inside already include /fixtures prefix
app.use("/api", fixtureDetailsRoutes);
app.use("/api/fixtures", fixturesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api", fixtureDetailsRoutes);
app.use("/api/golden-bets", goldenBetsRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/betting-insights", bettingInsightsRoutes);
app.use("/api/pnl", pnlRoutes);
app.use("/api/live-fixtures", liveFixturesRoutes);
app.use("/api/bet-builder", betBuilderRoutes);
app.use("/api/value-bets", valueBetsRoutes);

export default app;
