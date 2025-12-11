import express from "express";
import { predictionCache } from "../services/predictionCache.js";
import { isPremiumLeague } from "../services/leagueFilter.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const all = predictionCache.getGoldenBets() || [];

    const filtered = all.filter(g =>
      g &&
      g.fixture &&
      isPremiumLeague(g.fixture.leagueId) &&
      g.odds !== null &&
      g.odds >= 1.60
    );

    const top3 = filtered
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    return res.json({
      success: true,
      total: filtered.length,
      top3,
      all: filtered
    });
  } catch {
    return res.status(500).json({ success: false });
  }
});

export default router;
