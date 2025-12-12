import cron from "node-cron";
import { getPredictionsToday, getGoldenBetsToday, getValueBetsToday } from "../services/mlService.js";
import { predictionCache } from "../services/predictionCache.js";
import { attachOdds } from "../services/attachOddsToPredictions.js";

/**
 * Loads ML predictions, enriches with fixture data, and caches
 * Called by cron at 06:00 UTC daily or manually via admin endpoint
 */
export async function runMLPredictionsNow() {
  try {
    console.log("🔄 Loading ML predictions...");

    // Load raw ML predictions
    const rawPreds = getPredictionsToday() || [];
    const rawGolden = getGoldenBetsToday() || [];
    const rawValue = getValueBetsToday() || [];

    console.log("📥 Raw ML files loaded:");
    console.log("  Predictions:", rawPreds.length);
    console.log("  Golden:", rawGolden.length);
    console.log("  Value:", rawValue.length);

    // Enrich with fixture data and odds
    console.log("🔄 Enriching predictions with fixture data...");
    
    const preds = await attachOdds(rawPreds);
    const golden = await attachOdds(rawGolden);
    const value = await attachOdds(rawValue);

    console.log("✅ Enriched predictions:");
    console.log("  Predictions:", preds.length);
    console.log("  Golden:", golden.length);
    console.log("  Value:", value.length);

    // Cache enriched data
    predictionCache.setPredictions(preds);
    predictionCache.setGoldenBets(golden);
    predictionCache.setValueBets(value);

    console.log("✅ ML predictions cached successfully");

    return {
      raw: {
        predictions: rawPreds.length,
        golden: rawGolden.length,
        value: rawValue.length
      },
      enriched: {
        predictions: preds.length,
        golden: golden.length,
        value: value.length
      }
    };
  } catch (err) {
    console.error("❌ ML predictions cron error:", err);
    throw err;
  }
}

export function startMlCron() {
  // Run at 06:00 UTC daily
  cron.schedule("0 6 * * *", async () => {
    console.log("⏰ ML Cron triggered at 06:00 UTC");
    try {
      await runMLPredictionsNow();
    } catch (err) {
      console.error("❌ ML Cron failed:", err);
    }
  });

  console.log("⏰ ML Cron scheduled for 06:00 UTC daily");
}
