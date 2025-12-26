import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";
import { startDailyOracleCron } from "./cron/dailyOracleCron.js";
import { getPredictionsToday, getGoldenBetsToday, getValueBetsToday } from "./services/mlService.js";
import { predictionCache } from "./services/predictionCache.js";

const PORT = process.env.PORT || 10000;
const MONGO = process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGO) {
      throw new Error("MONGODB_URI is missing from environment variables.");
    }

    await mongoose.connect(MONGO);
    console.log("MongoDB connected");

    // Auto-load ML predictions on startup
    console.log("🔄 Loading ML predictions from JSON files...");
    try {
      const preds = getPredictionsToday();
      const golden = getGoldenBetsToday();
      const values = getValueBetsToday();

      predictionCache.setPredictions(preds || []);
      predictionCache.setGoldenBets(golden || []);
      predictionCache.setValueBets(values || []);

      console.log("✅ ML cache loaded:");
      console.log(`   - Predictions: ${preds?.length || 0}`);
      console.log(`   - Golden Bets: ${golden?.golden_bets?.length || golden?.length || 0}`);
      console.log(`   - Value Bets: ${values?.length || 0}`);
    } catch (mlErr) {
      console.error("⚠️ Could not load ML files on startup:", mlErr);
    }

    app.listen(PORT, () => {
      console.log("Backend running on port", PORT);
    });

    startDailyOracleCron();

  } catch (err) {
    console.error("Server start error:", err);
  }
}

start();
