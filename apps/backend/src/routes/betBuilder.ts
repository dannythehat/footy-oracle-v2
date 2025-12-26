import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const ML_OUTPUT_DIR = process.env.ML_OUTPUTS_PATH || 
  path.resolve(process.cwd(), "../../shared/ml_outputs");

router.get("/today", async (req, res) => {
  try {
    const filePath = path.join(ML_OUTPUT_DIR, "bet_builder.json");
    
    if (!fs.existsSync(filePath)) {
      return res.json({
        success: true,
        betBuilder: null
      });
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    
    // Transform to frontend format
    const bb = data.bet_builder ? {
      id: data.bet_builder.bet_id || `bb_${data.bet_builder.fixture_id}`,
      fixtureId: data.bet_builder.fixture_id,
      homeTeam: data.bet_builder.home_team,
      awayTeam: data.bet_builder.away_team,
      league: data.bet_builder.league,
      kickoff: data.bet_builder.kickoff,
      legs: (data.bet_builder.markets || data.bet_builder.legs || []).map(m => ({
        market: m.market,
        selection: m.prediction || m.selection,
        confidence: Math.round((m.confidence || 0) * 100) / 100
      })),
      combinedOdds: data.bet_builder.combined_odds,
      confidence: Math.round((data.bet_builder.combined_confidence || 0) * 100) / 100,
      aiExplanation: data.bet_builder.commentary || data.bet_builder.ai_explanation || "Multi-market bet builder",
      status: data.bet_builder.result || "pending"
    } : null;

    return res.json({
      success: true,
      betBuilder: bb
    });
  } catch (err) {
    console.error("Bet Builder error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;

