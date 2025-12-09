import { Router } from "express";
import { predictionCache } from "../services/predictionCache.js";

const router = Router();

router.get("/today", async (_req, res) => {
  return res.json({
    success: true,
    goldenBets: predictionCache.getGoldenBets(),
  });
});

export default router;
