import express from "express";
import { predictionCache } from "../services/predictionCache.js";

const router = express.Router();

router.get("/cache-status", (req, res) => {
  res.json(predictionCache.getStatus());
});

export default router;
