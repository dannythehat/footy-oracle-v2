import { Router } from "express";
import { getPredictionsToday, getGoldenBetsToday, getValueBetsToday } from "../services/mlService.js";
import { predictionCache } from "../services/predictionCache.js";

const router = Router();

// Manual ML load (reads ML JSON files and fills cache)
router.get("/run-ml", async (req, res) => {
  try {
    console.log("🔄 Admin triggered: run-ml");

    const preds = getPredictionsToday();
    const golden = getGoldenBetsToday();
    const values = getValueBetsToday();

    predictionCache.setPredictions(preds || []);
    predictionCache.setGoldenBets(golden || []);
    predictionCache.setValueBets(values || []);

    console.log("✅ ML files loaded into cache:");
    console.log("Predictions:", preds?.length || 0);
    console.log("Golden:", golden?.length || 0);
    console.log("Value:", values?.length || 0);

    return res.json({
      success: true,
      message: "ML predictions loaded into cache.",
      counts: {
        predictions: preds?.length || 0,
        golden: golden?.length || 0,
        value: values?.length || 0
      }
    });

  } catch (err) {
    console.error("❌ run-ml error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
