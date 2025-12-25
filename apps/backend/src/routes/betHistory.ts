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

// Get comprehensive P&L stats (daily/weekly/monthly/yearly)
router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    
    // Calculate date ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    // Fetch all settled bets for different periods
    const allBets = await BetHistory.find({
      result: { $in: ['win', 'loss'] }
    }).sort({ date: -1 });
    
    const pendingBets = await BetHistory.find({ result: 'pending' });
    
    // Helper function to calculate stats for a period
    const calculatePeriodStats = (bets: any[]) => {
      const wins = bets.filter(b => b.result === 'win');
      const losses = bets.filter(b => b.result === 'loss');
      const goldenBets = bets.filter(b => b.betType === 'golden_bet');
      const betBuilders = bets.filter(b => b.betType === 'bet_builder');
      
      return {
        totalBets: bets.length,
        wins: wins.length,
        losses: losses.length,
        totalStake: bets.reduce((sum, b) => sum + b.stake, 0),
        totalProfitLoss: bets.reduce((sum, b) => sum + b.profitLoss, 0),
        winRate: bets.length > 0 ? (wins.length / bets.length) * 100 : 0,
        avgConfidence: bets.length > 0 ? bets.reduce((sum, b) => sum + b.confidence, 0) / bets.length : 0,
        avgOdds: bets.filter(b => b.odds).length > 0 
          ? bets.filter(b => b.odds).reduce((sum, b) => sum + b.odds!, 0) / bets.filter(b => b.odds).length 
          : 0,
        roi: bets.reduce((sum, b) => sum + b.stake, 0) > 0 
          ? (bets.reduce((sum, b) => sum + b.profitLoss, 0) / bets.reduce((sum, b) => sum + b.stake, 0)) * 100 
          : 0,
        byType: {
          goldenBets: {
            total: goldenBets.length,
            wins: goldenBets.filter(b => b.result === 'win').length,
            losses: goldenBets.filter(b => b.result === 'loss').length,
            profitLoss: goldenBets.reduce((sum, b) => sum + b.profitLoss, 0),
            winRate: goldenBets.length > 0 ? (goldenBets.filter(b => b.result === 'win').length / goldenBets.length) * 100 : 0
          },
          betBuilders: {
            total: betBuilders.length,
            wins: betBuilders.filter(b => b.result === 'win').length,
            losses: betBuilders.filter(b => b.result === 'loss').length,
            profitLoss: betBuilders.reduce((sum, b) => sum + b.profitLoss, 0),
            winRate: betBuilders.length > 0 ? (betBuilders.filter(b => b.result === 'win').length / betBuilders.length) * 100 : 0
          }
        }
      };
    };
    
    // Filter bets by period
    const todayBets = allBets.filter(b => new Date(b.date) >= today);
    const weekBets = allBets.filter(b => new Date(b.date) >= weekStart);
    const monthBets = allBets.filter(b => new Date(b.date) >= monthStart);
    const yearBets = allBets.filter(b => new Date(b.date) >= yearStart);
    
    // Calculate daily P&L trend (last 30 days)
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayBets = allBets.filter(b => {
        const betDate = new Date(b.date);
        return betDate >= date && betDate < nextDate;
      });
      
      dailyTrend.push({
        date: date.toISOString().split('T')[0],
        bets: dayBets.length,
        profitLoss: dayBets.reduce((sum, b) => sum + b.profitLoss, 0),
        wins: dayBets.filter(b => b.result === 'win').length,
        losses: dayBets.filter(b => b.result === 'loss').length
      });
    }
    
    return res.json({
      success: true,
      stats: {
        today: calculatePeriodStats(todayBets),
        week: calculatePeriodStats(weekBets),
        month: calculatePeriodStats(monthBets),
        year: calculatePeriodStats(yearBets),
        allTime: calculatePeriodStats(allBets),
        pending: {
          total: pendingBets.length,
          goldenBets: pendingBets.filter(b => b.betType === 'golden_bet').length,
          betBuilders: pendingBets.filter(b => b.betType === 'bet_builder').length,
          totalStake: pendingBets.reduce((sum, b) => sum + b.stake, 0)
        },
        dailyTrend
      }
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
