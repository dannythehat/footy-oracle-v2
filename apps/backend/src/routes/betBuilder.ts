import { Router } from 'express';
import {
  getTodaysBetBuilders,
  getBetBuildersByDate,
  getHistoricalBetBuilders,
} from '../services/betBuilderService.js';
import { BetBuilder } from '../models/BetBuilder.js';

const router = Router();

/**
 * GET /api/bet-builders/today
 * Get today's bet builders (top 5 multi-market convergence opportunities)
 */
router.get('/today', async (req, res) => {
  try {
    const betBuilders = await getTodaysBetBuilders();
    
    res.json({
      success: true,
      data: betBuilders,
      count: betBuilders.length,
      message: betBuilders.length === 0 
        ? 'No bet builders found for today. Check back tomorrow!' 
        : `Found ${betBuilders.length} high-confidence bet builder${betBuilders.length > 1 ? 's' : ''} for today`,
    });
  } catch (error: any) {
    console.error('Error fetching today\'s bet builders:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/bet-builders?date=YYYY-MM-DD
 * Get bet builders for a specific date
 */
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, page = '1', limit = '10' } = req.query;
    
    // If specific date provided
    if (date && typeof date === 'string') {
      const targetDate = new Date(date);
      const betBuilders = await getBetBuildersByDate(targetDate);
      
      return res.json({
        success: true,
        data: betBuilders,
        count: betBuilders.length,
        date: date,
      });
    }
    
    // If date range provided (historical)
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const { builders, total, pages } = await getHistoricalBetBuilders(
      start,
      end,
      pageNum,
      limitNum
    );
    
    res.json({
      success: true,
      data: builders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching bet builders:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/bet-builders/:id
 * Get a specific bet builder by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const betBuilder = await BetBuilder.findById(req.params.id);
    
    if (!betBuilder) {
      return res.status(404).json({
        success: false,
        error: 'Bet builder not found',
      });
    }
    
    res.json({
      success: true,
      data: betBuilder,
    });
  } catch (error: any) {
    console.error('Error fetching bet builder:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/bet-builders/stats/summary
 * Get bet builder statistics (win rate, ROI, etc.)
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    const [total, wins, losses, pending] = await Promise.all([
      BetBuilder.countDocuments(query),
      BetBuilder.countDocuments({ ...query, result: 'win' }),
      BetBuilder.countDocuments({ ...query, result: 'loss' }),
      BetBuilder.countDocuments({ ...query, result: 'pending' }),
    ]);
    
    const settled = wins + losses;
    const winRate = settled > 0 ? (wins / settled) * 100 : 0;
    
    // Calculate total profit/loss
    const profitData = await BetBuilder.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$profit' },
        },
      },
    ]);
    
    const totalProfit = profitData.length > 0 ? profitData[0].totalProfit : 0;
    
    // Get average combined confidence
    const avgConfidenceData = await BetBuilder.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$combinedConfidence' },
          avgOdds: { $avg: '$estimatedCombinedOdds' },
        },
      },
    ]);
    
    const avgConfidence = avgConfidenceData.length > 0 
      ? Math.round(avgConfidenceData[0].avgConfidence) 
      : 0;
    const avgOdds = avgConfidenceData.length > 0 
      ? Math.round(avgConfidenceData[0].avgOdds * 100) / 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        total,
        wins,
        losses,
        pending,
        settled,
        winRate: Math.round(winRate * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        avgConfidence,
        avgOdds,
      },
    });
  } catch (error: any) {
    console.error('Error fetching bet builder stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/bet-builders/weekly
 * Get this week's bet builders
 */
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const betBuilders = await BetBuilder.find({
      date: { $gte: startOfWeek, $lt: endOfWeek },
    })
      .sort({ date: -1, combinedConfidence: -1 });
    
    res.json({
      success: true,
      data: betBuilders,
      count: betBuilders.length,
      week: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('Error fetching weekly bet builders:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
