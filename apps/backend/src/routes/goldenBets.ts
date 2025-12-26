import express from "express";
import { predictionCache } from "../services/predictionCache.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const rawData: any = predictionCache.getGoldenBets() || [];
    
    // Handle both old and new data structures
    let bets: any[] = [];
    if (rawData && typeof rawData === 'object' && rawData.golden_bets) {
      // New structure from COMPLETE_PRODUCTION_PIPELINE.py
      bets = rawData.golden_bets;
    } else if (Array.isArray(rawData)) {
      bets = rawData;
    }

    // Transform to frontend format
    const transformed = bets.map(bet => ({
      id: bet.bet_id || `${bet.fixture_id}_${bet.market}`,
      fixtureId: bet.fixture_id,
      homeTeam: bet.home_team,
      awayTeam: bet.away_team,
      league: bet.league,
      kickoff: bet.kickoff,
      market: bet.market,
      selection: bet.selection,
      confidence: Math.round(bet.confidence * 100) / 100, // Round to 2 decimals
      odds: bet.odds || 1.75, // Default odds if missing
      aiExplanation: bet.ai_explanation || bet.gaffer_says || "No commentary available",
      status: bet.result || "pending"
    }));

    // Sort by confidence and take top 3
    const top3 = transformed
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return res.json({
      success: true,
      total: transformed.length,
      top3,
      all: transformed
    });
  } catch (err) {
    console.error("Golden Bets error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
