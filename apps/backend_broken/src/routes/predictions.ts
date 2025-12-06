import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';

const router = Router();

// Get all predictions with advanced filters
router.get('/', async (req, res) => {
  try {
    const { 
      date, 
      startDate,
      endDate,
      league, 
      market,
      minConfidence, 
      maxConfidence,
      result,
      isGoldenBet,
      search,
      sortBy = 'confidence',
      sortOrder = 'desc',
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query: any = {};
    
    // Date filters
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    // League filter
    if (league) {
      query.league = league;
    }
    
    // Market filter
    if (market) {
      query.market = market;
    }
    
    // Confidence range
    if (minConfidence || maxConfidence) {
      query.confidence = {};
      if (minConfidence) query.confidence.$gte = Number(minConfidence);
      if (maxConfidence) query.confidence.$lte = Number(maxConfidence);
    }
    
    // Result filter
    if (result) {
      query.result = result;
    }
    
    // Golden Bet filter
    if (isGoldenBet !== undefined) {
      query.isGoldenBet = isGoldenBet === 'true';
    }
    
    // Search by team name
    if (search) {
      query.$or = [
        { homeTeam: { $regex: search, $options: 'i' } },
        { awayTeam: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Prediction.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: predictions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      filters: {
        date,
        startDate,
        endDate,
        league,
        market,
        minConfidence,
        maxConfidence,
        result,
        isGoldenBet,
        search,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get prediction by fixture ID
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const predictions = await Prediction.find({ 
      fixtureId: Number(req.params.fixtureId) 
    });
    
    res.json({
      success: true,
      data: predictions,
      count: predictions.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get historical results with filters (for frontend history page)
router.get('/history', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      league,
      market,
      result,
      page = 1,
      limit = 20,
    } = req.query;
    
    const query: any = {
      isGoldenBet: true, // Only show Golden Bets in history
    };
    
    // Date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    // Filters
    if (league) query.league = league;
    if (market) query.market = market;
    if (result) query.result = result;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Prediction.countDocuments(query),
    ]);
    
    // Calculate summary stats
    const wins = predictions.filter(p => p.result === 'win').length;
    const losses = predictions.filter(p => p.result === 'loss').length;
    const pending = predictions.filter(p => p.result === 'pending').length;
    const totalProfit = predictions.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    res.json({
      success: true,
      data: predictions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      summary: {
        wins,
        losses,
        pending,
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        winRate: (wins + losses) > 0 ? parseFloat(((wins / (wins + losses)) * 100).toFixed(2)) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get available leagues (for filter dropdown)
router.get('/leagues', async (req, res) => {
  try {
    const leagues = await Prediction.distinct('league');
    
    res.json({
      success: true,
      data: leagues.sort(),
      count: leagues.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get available markets (for filter dropdown)
router.get('/markets', async (req, res) => {
  try {
    const markets = await Prediction.distinct('market');
    
    res.json({
      success: true,
      data: markets.sort(),
      count: markets.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
