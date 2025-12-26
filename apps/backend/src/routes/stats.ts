import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';
// import { getTrebleStats, getTodaysTreble, getHistoricalTrebles } from '../services/trebleService.js';
import { getSettlementStats } from '../services/resultSettlementService.js';

const router = Router();

// Get P&L statistics for Golden Bets
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
      data: {
        ...stats,
        totalProfit: parseFloat(stats.totalProfit.toFixed(2)),
        winRate: parseFloat(stats.winRate.toFixed(2)),
        roi: parseFloat(stats.roi.toFixed(2)),
      },
      period,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get today's treble calculator
router.get('/treble/today', async (req, res) => {
  try {
    const treble = await getTodaysTreble();
    
    if (!treble) {
      return res.status(404).json({
        success: false,
        error: 'No treble available for today',
      });
    }
    
    res.json({
      success: true,
      data: treble,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get treble statistics
router.get('/treble', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    const stats = await getTrebleStats(period as any);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get historical trebles
router.get('/treble/history', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const trebles = await getHistoricalTrebles(
      startDate as string,
      endDate as string,
      status as any
    );
    
    res.json({
      success: true,
      data: trebles,
      count: trebles.length,
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
    
    // Get settlement stats
    const settlementStats = await getSettlementStats();
    
    // Get treble stats
    const trebleStats = await getTrebleStats('all');
    
    res.json({
      success: true,
      data: {
        totalPredictions,
        goldenBets,
        pendingBets,
        winRate: parseFloat(winRate.toFixed(2)),
        settlement: settlementStats,
        trebles: {
          total: trebleStats.totalTrebles,
          won: trebleStats.wonTrebles,
          lost: trebleStats.lostTrebles,
          pending: trebleStats.pendingTrebles,
          winRate: trebleStats.winRate,
          totalProfit: trebleStats.totalProfit,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get performance by league
router.get('/by-league', async (req, res) => {
  try {
    const predictions = await Prediction.find({
      isGoldenBet: true,
      result: { $in: ['win', 'loss'] },
    });
    
    // Group by league
    const leagueStats = predictions.reduce((acc: any, pred) => {
      if (!acc[pred.league]) {
        acc[pred.league] = {
          league: pred.league,
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalProfit: 0,
        };
      }
      
      acc[pred.league].totalBets++;
      if (pred.result === 'win') acc[pred.league].wins++;
      if (pred.result === 'loss') acc[pred.league].losses++;
      acc[pred.league].totalProfit += pred.profit || 0;
      
      return acc;
    }, {});
    
    // Calculate win rates and sort
    const leagueArray = Object.values(leagueStats).map((stats: any) => ({
      ...stats,
      winRate: parseFloat(((stats.wins / stats.totalBets) * 100).toFixed(2)),
      totalProfit: parseFloat(stats.totalProfit.toFixed(2)),
    })).sort((a: any, b: any) => b.winRate - a.winRate);
    
    res.json({
      success: true,
      data: leagueArray,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get performance by market
router.get('/by-market', async (req, res) => {
  try {
    const predictions = await Prediction.find({
      isGoldenBet: true,
      result: { $in: ['win', 'loss'] },
    });
    
    // Group by market
    const marketStats = predictions.reduce((acc: any, pred) => {
      if (!acc[pred.market]) {
        acc[pred.market] = {
          market: pred.market,
          totalBets: 0,
          wins: 0,
          losses: 0,
          totalProfit: 0,
        };
      }
      
      acc[pred.market].totalBets++;
      if (pred.result === 'win') acc[pred.market].wins++;
      if (pred.result === 'loss') acc[pred.market].losses++;
      acc[pred.market].totalProfit += pred.profit || 0;
      
      return acc;
    }, {});
    
    // Calculate win rates and sort
    const marketArray = Object.values(marketStats).map((stats: any) => ({
      ...stats,
      winRate: parseFloat(((stats.wins / stats.totalBets) * 100).toFixed(2)),
      totalProfit: parseFloat(stats.totalProfit.toFixed(2)),
    })).sort((a: any, b: any) => b.winRate - a.winRate);
    
    res.json({
      success: true,
      data: marketArray,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
