import express from "express";
import { BetHistory } from "../models/BetHistory.js";

const router = express.Router();

// Get all bet history with filters
router.get("/", async (req, res) => {
  try {
    const { betType, result, limit = 50, skip = 0 } = req.query;
    
    const query: any = {};
    if (betType) query.betType = betType;
    if (result) query.result = result;
    
    const bets = await BetHistory.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string));
    
    const total = await BetHistory.countDocuments(query);
    
    return res.json({
      success: true,
      bets,
      total,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    });
  } catch (err: any) {
    console.error("Bet history error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get P&L summary stats
router.get("/stats", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));
    
    const bets = await BetHistory.find({
      date: { $gte: startDate },
      result: { $in: ['win', 'loss'] }
    });
    
    const stats = {
      totalBets: bets.length,
      wins: bets.filter(b => b.result === 'win').length,
      losses: bets.filter(b => b.result === 'loss').length,
      pending: await BetHistory.countDocuments({ result: 'pending' }),
      totalProfitLoss: bets.reduce((sum, b) => sum + b.profitLoss, 0),
      winRate: bets.length > 0 ? (bets.filter(b => b.result === 'win').length / bets.length) * 100 : 0,
      avgConfidence: bets.length > 0 ? bets.reduce((sum, b) => sum + b.confidence, 0) / bets.length : 0,
      byType: {
        goldenBets: {
          total: bets.filter(b => b.betType === 'golden_bet').length,
          wins: bets.filter(b => b.betType === 'golden_bet' && b.result === 'win').length,
          profitLoss: bets.filter(b => b.betType === 'golden_bet').reduce((sum, b) => sum + b.profitLoss, 0)
        },
        betBuilders: {
          total: bets.filter(b => b.betType === 'bet_builder').length,
          wins: bets.filter(b => b.betType === 'bet_builder' && b.result === 'win').length,
          profitLoss: bets.filter(b => b.betType === 'bet_builder').reduce((sum, b) => sum + b.profitLoss, 0)
        }
      }
    };
    
    return res.json({
      success: true,
      stats,
      period: `${days} days`
    });
  } catch (err: any) {
    console.error("P&L stats error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get bet history for specific date range
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate required"
      });
    }
    
    const bets = await BetHistory.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).sort({ date: -1 });
    
    return res.json({
      success: true,
      bets,
      total: bets.length
    });
  } catch (err: any) {
    console.error("Date range error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

export default router;
