import express from "express";
import cors from "cors";

import goldenBetsRoutes from "./routes/goldenBets.js";
import valueBetsRoutes from "./routes/valueBets.js";
import betBuilderRoutes from "./routes/betBuilder.js";
import cacheDebugRoutes from "./routes/cacheDebug.js";
import adminRoutes from "./routes/admin.js";
import liveFixturesRoutes from "./routes/liveFixtures.js";
import oracleRoutes from "./routes/oracle.js";
import leagueTablesRoutes from "./routes/leagueTables.js";
import betHistoryRoutes from "./routes/betHistory.js";
import fixturesRoutes from "./routes/fixtures.js";
import pnlRoutes from "./routes/pnl.js";

const app = express();
app.use(cors());
app.use(express.json());

// Core routes
app.use("/api/golden-bets", goldenBetsRoutes);
app.use("/api/value-bets", valueBetsRoutes);
app.use("/api/bet-builder", betBuilderRoutes);
app.use("/api/fixtures", fixturesRoutes);
app.use("/api/pnl", pnlRoutes);
app.use("/api/oracle", oracleRoutes);
app.use("/api/league-tables", leagueTablesRoutes);
app.use("/api/bet-history", betHistoryRoutes);
app.use("/api/debug", cacheDebugRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/live-fixtures", liveFixturesRoutes);

export default app;
