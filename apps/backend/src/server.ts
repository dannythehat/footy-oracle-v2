import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import adminRouter from "./routes/admin.js";
import fixturesRouter from "./routes/fixtures.js";
import fixturesAdminRouter from "./routes/fixturesAdmin.js";
import goldenBetsRouter from "./routes/goldenBets.js";
import valueBetsRouter from "./routes/valueBets.js";
import predictionsRouter from "./routes/predictions.js";
import statsRouter from "./routes/stats.js";
import bettingInsightsRouter from "./routes/bettingInsights.js";
import notificationsRouter from "./routes/notifications.js";
import pnlRouter from "./routes/pnl.js";
import betBuilderRouter from "./routes/betBuilder.js";
import fixtureDetailsRouter from "./routes/fixtureDetails.js";

import "./config/database.js";
import "./services/cronService.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/admin", adminRouter);
app.use("/api/fixtures", fixturesRouter);
app.use("/api/fixtures-admin", fixturesAdminRouter);
app.use("/api/golden-bets", goldenBetsRouter);
app.use("/api/value-bets", valueBetsRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/betting-insights", bettingInsightsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/pnl", pnlRouter);
app.use("/api/bet-builder", betBuilderRouter);
app.use("/api", fixtureDetailsRouter);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Footy Oracle API running on port ${PORT}`));
