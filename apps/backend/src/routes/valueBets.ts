import { Router } from "express";
import { predictionCache } from "../services/predictionCache.js";

const router = Router();

router.get("/today", async (_req, res) => {
  return res.json({
    success: true,
    valueBets: predictionCache.getValueBets(),
  });
});

export default router;
