import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';

const router = Router();

// Get P&L statistics
router.get('/pnl', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { date: { $gte: today } };
        break;
      case 'weekly':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { date: { $gte: weekAgo } };
        break;
      case 'monthly':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { date: { $gte: monthAgo } };
        break;
      case 'yearly':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        dateFilter = { date: { $gte: yearAgo } };
        break;
    }
    
    const predictions = await Prediction.find({
      isGoldenBet: true,
      result: { $in: ['win', 'loss'] },
      ...dateFilter,
    });
    
    const stats = {
      totalBets: predictions.length,
      wins: predictions.filter(p => p.result === 'win').length,
      losses: predictions.filter(p => p.result === 'loss').length,
      totalProfit: predictions.reduce((sum, p) => sum + (p.profit || 0), 0),
      winRate: 0,
      roi: 0,
    };
    
    stats.winRate = stats.totalBets > 0 
      ? (stats.wins / stats.totalBets) * 100 
      : 0;
    
    stats.roi = stats.totalBets > 0 
      ? (stats.totalProfit / (stats.totalBets * 10)) * 100 
      : 0;
    
    res.json({
      success: true,
      data: stats,
      period,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get treble calculator stats
router.get('/treble', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const goldenBets = await Prediction.find({
      isGoldenBet: true,
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ confidence: -1 })
      .limit(3);
    
    const trebleOdds = goldenBets.reduce((acc, bet) => acc * bet.odds, 1);
    const stake = 10;
    const potentialReturn = stake * trebleOdds;
    const potentialProfit = potentialReturn - stake;
    
    res.json({
      success: true,
      data: {
        bets: goldenBets.map(b => ({
          match: `${b.homeTeam} vs ${b.awayTeam}`,
          prediction: b.prediction,
          odds: b.odds,
        })),
        trebleOdds: parseFloat(trebleOdds.toFixed(2)),
        stake,
        potentialReturn: parseFloat(potentialReturn.toFixed(2)),
        potentialProfit: parseFloat(potentialProfit.toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get overall statistics
router.get('/overview', async (req, res) => {
  try {
    const [totalPredictions, goldenBets, pendingBets] = await Promise.all([
      Prediction.countDocuments(),
      Prediction.countDocuments({ isGoldenBet: true }),
      Prediction.countDocuments({ result: 'pending' }),
    ]);
    
    const winningBets = await Prediction.countDocuments({ 
      isGoldenBet: true, 
      result: 'win' 
    });
    
    const totalGoldenBetsSettled = await Prediction.countDocuments({
      isGoldenBet: true,
      result: { $in: ['win', 'loss'] },
    });
    
    const winRate = totalGoldenBetsSettled > 0 
      ? (winningBets / totalGoldenBetsSettled) * 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        totalPredictions,
        goldenBets,
        pendingBets,
        winRate: parseFloat(winRate.toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
