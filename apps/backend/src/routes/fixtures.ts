import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const Fixture = mongoose.model("Fixture");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const fixtures = await Fixture.find({
      kickoff: { $gte: today, $lt: tomorrow }
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
          goals: f.goals_pred,
          btts: f.btts_pred,
          corners: f.corners_pred,
          cards: f.cards_pred
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const count = await Fixture.countDocuments({
      kickoff: { $gte: today, $lt: tomorrow }
    });

    // Get predictions count
    const fixtures = await Fixture.find({
      kickoff: { $gte: today, $lt: tomorrow }
    });

    const predictionsCount = fixtures.filter(f => 
      f.goals_pred || f.btts_pred || f.corners_pred || f.cards_pred
    ).length;

    // Calculate average confidence
    let totalConf = 0;
    let confCount = 0;
    fixtures.forEach(f => {
      if (f.goals_pred) { totalConf += f.goals_pred; confCount++; }
      if (f.btts_pred) { totalConf += f.btts_pred; confCount++; }
      if (f.corners_pred) { totalConf += f.corners_pred; confCount++; }
      if (f.cards_pred) { totalConf += f.cards_pred; confCount++; }
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
