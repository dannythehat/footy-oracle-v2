import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const Fixture = mongoose.model("Fixture");
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Match fixtures where kickoff string starts with today's date
    const fixtures = await Fixture.find({
      kickoff: { $regex: `^${dateStr}` }
    }).sort({ kickoff: 1 }).limit(100);

    return res.json({
      success: true,
      count: fixtures.length,
      fixtures: fixtures.map(f => ({
        id: f.fixture_id || f._id,
        fixtureId: f.fixture_id,
        homeTeam: f.home_team,
        awayTeam: f.away_team,
        league: f.league,
        kickoff: f.kickoff,
        status: f.status || "scheduled",
        predictions: {
          goals: f.predictions?.goals?.confidence || null,
          btts: f.predictions?.btts?.confidence || null,
          corners: f.predictions?.corners?.confidence || null,
          cards: f.predictions?.cards?.confidence || null
        }
      }))
    });
  } catch (err) {
    console.error("Fixtures error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const Fixture = mongoose.model("Fixture");
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const count = await Fixture.countDocuments({
      kickoff: { $regex: `^${dateStr}` }
    });

    // Get predictions count
    const fixtures = await Fixture.find({
      kickoff: { $regex: `^${dateStr}` }
    });

    const predictionsCount = fixtures.filter(f => 
      f.predictions?.goals || f.predictions?.btts || f.predictions?.corners || f.predictions?.cards
    ).length;

    // Calculate average confidence
    let totalConf = 0;
    let confCount = 0;
    fixtures.forEach(f => {
      if (f.predictions?.goals?.confidence) { totalConf += f.predictions.goals.confidence; confCount++; }
      if (f.predictions?.btts?.confidence) { totalConf += f.predictions.btts.confidence; confCount++; }
      if (f.predictions?.corners?.confidence) { totalConf += f.predictions.corners.confidence; confCount++; }
      if (f.predictions?.cards?.confidence) { totalConf += f.predictions.cards.confidence; confCount++; }
    });

    const avgConfidence = confCount > 0 ? (totalConf / confCount) : 0;

    return res.json({
      success: true,
      stats: {
        todaysFixtures: count,
        totalPredictions: predictionsCount,
        avgConfidence: Math.round(avgConfidence * 10) / 10
      }
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
