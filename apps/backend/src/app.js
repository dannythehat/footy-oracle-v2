"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var debug_1 = require("./routes/debug");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "https://footy-oracle-v2.vercel.app",
        /https:\/\/footy-oracle-v2-.*\.vercel\.app$/,
        "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: false
}));
app.use(express_1.default.json());
// HEALTH CHECK
app.get("/health", function (req, res) {
    res.json({ status: "ok" });
});
// IMPORT ALL ROUTES
var fixtures_1 = require("./routes/fixtures");
var admin_1 = require("./routes/admin");
var notifications_1 = require("./routes/notifications");
var fixtureDetails_1 = require("./routes/fixtureDetails");
var goldenBets_1 = require("./routes/goldenBets");
var predictions_1 = require("./routes/predictions");
var stats_1 = require("./routes/stats");
var bettingInsights_1 = require("./routes/bettingInsights");
var pnl_1 = require("./routes/pnl");
var liveFixtures_1 = require("./routes/liveFixtures");
var betBuilder_1 = require("./routes/betBuilder");
var valueBets_1 = require("./routes/valueBets");
// IMPORT CRON JOBS
var fixturesCron_1 = require("./cron/fixturesCron");
var liveScoresCron_1 = require("./cron/liveScoresCron");
var mlPredictionsCron_1 = require("./cron/mlPredictionsCron");
// MOUNT ROUTES
app.use("/api", fixtureDetails_1.default); // <-- enables /fixtures/:id/events, /stats, /h2h
app.use("/api/fixtures", fixtures_1.default);
app.use('/api/debug', debug_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/golden-bets", goldenBets_1.default);
app.use("/api/predictions", predictions_1.default);
app.use("/api/stats", stats_1.default);
app.use("/api/betting-insights", bettingInsights_1.default);
app.use("/api/pnl", pnl_1.default);
app.use("/api/live-fixtures", liveFixtures_1.default);
app.use('/api/debug', debug_1.default);
app.use("/api/bet-builder", betBuilder_1.default);
app.use("/api/value-bets", valueBets_1.default);
// 🚨 CRITICAL: START ALL CRON JOBS
console.log("🚀 Initializing cron jobs...");
(0, fixturesCron_1.startFixturesCron)(); // 3 AM: Load fixtures window (7 days back + 7 days ahead)
// 5 AM: Update odds for today's fixtures
(0, liveScoresCron_1.startLiveScoresCron)(); // Every 2 minutes: Update live scores
(0, mlPredictionsCron_1.startMLPredictionsCron)(); // 6 AM: Generate ML predictions (Golden Bets + Value Bets)
// Every 10 min: Keep ML API awake
console.log("✅ All cron jobs started successfully");
console.log("   📅 Fixtures: 3 AM daily (window load) + 5 AM (odds update)");
console.log("   🤖 ML Predictions: 6 AM daily + keep-alive every 10 min");
console.log("   ⚽ Live Scores: Every 2 minutes");
exports.default = app;
