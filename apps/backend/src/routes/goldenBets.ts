import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    // Read directly from MongoDB
    const GoldenBet = mongoose.connection.collection('golden_bets');
    const bets = await GoldenBet.find({}).sort({ confidence: -1 }).limit(3).toArray();
    
    if (!bets || bets.length === 0) {
      return res.json({
        success: true,
        total: 0,
        top3: [],
        all: []
      });
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
      selection: bet.prediction || 'Yes',
      confidence: bet.confidence || 0,
      odds: bet.odds || 1.75,
      aiExplanation: bet.commentary || bet.gaffer_says || "No commentary available",
      status: bet.result || "pending"
    }));

    return res.json({
      success: true,
      total: transformed.length,
      top3: transformed,
      all: transformed
    });
  } catch (err: any) {
    console.error("Golden Bets error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
