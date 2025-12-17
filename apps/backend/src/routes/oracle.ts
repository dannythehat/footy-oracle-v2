import { Router } from "express";
import { runMLPredictionsNow } from "../cron/mlPredictionsCron.js";
import { generateDailyOracle } from "../services/oracleDailyService.js";
import { predictionCache } from "../services/predictionCache.js";

const router = Router();

router.get("/run-oracle", async (_req, res) => {
  await runMLPredictionsNow();
  const snapshot = await generateDailyOracle();
  res.json({ success: true, snapshot });
});

router.get("/today", (_req, res) => {
  const snap = predictionCache.getDailyOracle();
  if (!snap) return res.status(404).json({ success: false });
  res.json({ success: true, data: snap });
});

export default router;
