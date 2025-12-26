import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const BetBuilder = mongoose.connection.collection('bet_builder_of_day');
    const data = await BetBuilder.findOne({});
    
    if (!data) {
      return res.json({
        success: true,
        betBuilder: null
      });
    }

    // Transform to frontend format
    const bb = {
      id: data.bet_id || `bb_${data.fixture_id}`,
      fixtureId: data.fixture_id,
      homeTeam: data.fixture?.split(' vs ')[0] || data.home_team || '',
      awayTeam: data.fixture?.split(' vs ')[1] || data.away_team || '',
      league: data.league,
      kickoff: data.kickoff,
      markets: (data.markets || []).map((m: any) => ({
        market: m.market,
        selection: m.prediction || 'Yes',
        confidence: m.confidence || 0
      })),
      combinedOdds: data.combined_odds,
      confidence: data.combined_confidence || 0,
      aiExplanation: data.commentary || data.ai_explanation || "Multi-market bet builder",
      status: data.result || "pending"
    };

    return res.json({
      success: true,
      betBuilder: bb
    });
  } catch (err: any) {
    console.error("Bet Builder error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
