import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const BetHistory = mongoose.model("BetHistory");
    
    // Get all bets
    const allBets = await BetHistory.find({}).sort({ created_at: -1 });
    
    // Calculate stats
    const totalBets = allBets.length;
    const settledBets = allBets.filter(b => b.result !== "pending");
    const wonBets = allBets.filter(b => b.result === "won");
    const lostBets = allBets.filter(b => b.result === "lost");
    
    const totalStake = settledBets.reduce((sum, b) => sum + (b.stake || 10), 0);
    const totalReturns = wonBets.reduce((sum, b) => sum + (b.stake || 10) * (b.odds || 1.75), 0);
    const netPL = totalReturns - totalStake;
    
    const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0;
    const roi = totalStake > 0 ? (netPL / totalStake) * 100 : 0;
    
    // Get recent bets (last 10)
    const recentBets = allBets.slice(0, 10).map(b => ({
      id: b.bet_id,
      date: b.created_at,
      homeTeam: b.home_team,
      awayTeam: b.away_team,
      market: b.market,
      confidence: b.confidence,
      odds: b.odds,
      stake: b.stake || 10,
      result: b.result,
      profitLoss: b.profit_loss || 0,
      aiExplanation: b.ai_explanation || b.gaffer_says
    }));
    
    // Calculate daily P&L for chart
    const dailyPL = {};
    settledBets.forEach(bet => {
      const date = new Date(bet.created_at).toISOString().split('T')[0];
      if (!dailyPL[date]) {
        dailyPL[date] = 0;
      }
      dailyPL[date] += bet.profit_loss || 0;
    });
    
    const chartData = Object.keys(dailyPL).sort().map(date => ({
      date,
      profitLoss: dailyPL[date]
    }));

    return res.json({
      success: true,
      summary: {
        totalBets,
        settledBets: settledBets.length,
        wonBets: wonBets.length,
        lostBets: lostBets.length,
        pendingBets: totalBets - settledBets.length,
        totalStake: Math.round(totalStake * 100) / 100,
        totalReturns: Math.round(totalReturns * 100) / 100,
        netPL: Math.round(netPL * 100) / 100,
        winRate: Math.round(winRate * 10) / 10,
        roi: Math.round(roi * 10) / 10
      },
      recentBets,
      chartData
    });
  } catch (err) {
    console.error("P&L Hub error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    const BetHistory = mongoose.model("BetHistory");
    
    const { limit = 50, status } = req.query;
    
    const query = status && status !== "all" ? { result: status } : {};
    
    const bets = await BetHistory.find(query)
      .sort({ created_at: -1 })
      .limit(Number(limit));

    return res.json({
      success: true,
      count: bets.length,
      bets: bets.map(b => ({
        id: b.bet_id,
        date: b.created_at,
        homeTeam: b.home_team,
        awayTeam: b.away_team,
        league: b.league,
        market: b.market,
        confidence: b.confidence,
        odds: b.odds,
        stake: b.stake || 10,
        result: b.result,
        profitLoss: b.profit_loss || 0,
        aiExplanation: b.ai_explanation || b.gaffer_says
      }))
    });
  } catch (err) {
    console.error("P&L History error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
