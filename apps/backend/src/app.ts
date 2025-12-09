import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

import fixturesRouter from "./routes/fixtures.js";
import goldenBetsRouter from "./routes/goldenBets.js";
import valueBetsRouter from "./routes/valueBets.js";

import { startFixturesCron } from "./cron/fixturesCron.js";
import { startMLPredictionsCron } from "./cron/mlPredictionsCron.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/fixtures", fixturesRouter);
app.use("/api/golden-bets", goldenBetsRouter);
app.use("/api/value-bets", valueBetsRouter);

startFixturesCron();
startMLPredictionsCron();

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(\Backend running on port \\));
