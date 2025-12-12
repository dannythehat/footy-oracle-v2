import { Router } from "express";
import { getPredictionsToday, getGoldenBetsToday, getValueBetsToday } from "../services/mlService.js";
import { predictionCache } from "../services/predictionCache.js";
import { attachOdds } from "../services/attachOddsToPredictions.js";

const router = Router();

// Manual ML load (reads ML JSON files, enriches with fixture data, and fills cache)
router.get("/run-ml", async (req, res) => {
  try {
    console.log("🔄 Admin triggered: run-ml");

    // Load raw ML predictions
    const preds = getPredictionsToday();
    const golden = getGoldenBetsToday();
    const values = getValueBetsToday();

    console.log("📥 Raw ML files loaded:");
    console.log("  Predictions:", preds?.length || 0);
    console.log("  Golden:", golden?.length || 0);
    console.log("  Value:", values?.length || 0);

    // Enrich predictions with fixture data and odds
    console.log("🔄 Enriching predictions with fixture data...");
    
    const enrichedPredictions = await attachOdds(preds || []);
    const enrichedGolden = await attachOdds(golden || []);
    const enrichedValues = await attachOdds(values || []);

    console.log("✅ Enriched predictions:");
    console.log("  Predictions:", enrichedPredictions.length);
    console.log("  Golden:", enrichedGolden.length);
    console.log("  Value:", enrichedValues.length);

    // Store enriched data in cache
    predictionCache.setPredictions(enrichedPredictions);
    predictionCache.setGoldenBets(enrichedGolden);
    predictionCache.setValueBets(enrichedValues);

    console.log("✅ Enriched ML data loaded into cache");

    return res.json({
      success: true,
      message: "ML predictions enriched and loaded into cache.",
      counts: {
        raw: {
          predictions: preds?.length || 0,
          golden: golden?.length || 0,
          value: values?.length || 0
        },
        enriched: {
          predictions: enrichedPredictions.length,
          golden: enrichedGolden.length,
          value: enrichedValues.length
        }
      }
    });

  } catch (err: any) {
    console.error("❌ run-ml error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
