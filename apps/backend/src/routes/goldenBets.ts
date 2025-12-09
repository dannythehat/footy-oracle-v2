import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';
import { Fixture } from '../models/Fixture.js';
import { loadGoldenBets } from '../services/mlService.js';
import { predictionCache } from '../services/predictionCache.js';

const router = Router();

// Get today's Golden Bets from ML API (with 24-hour cache)
router.get('/today', async (req, res) => {
  try {
    // Check cache first
    const cachedBets = predictionCache.getGoldenBets();
    if (cachedBets && cachedBets.length > 0) {
      return res.json({
        success: true,
        data: cachedBets,
        count: cachedBets.length,
        source: 'CACHE',
        cached: true
      });
    }
    
    console.log('🔄 Cache miss - fetching fresh Golden Bets from ML API');
    
    // Get today's fixtures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const fixtures = await Fixture.find({
      date: { $gte: today, $lte: endOfDay },
      status: { $in: ['scheduled', 'live'] }
    });
    
    console.log(`📊 Found ${fixtures.length} fixtures for Golden Bets`);
    
    // Call ML API with today's fixtures
    const mlGoldenBets = await loadGoldenBets(fixtures);
    
    if (mlGoldenBets && mlGoldenBets.length > 0) {
      // Cache the results for 24 hours
      predictionCache.setGoldenBets(mlGoldenBets);
      
      return res.json({
        success: true,
        data: mlGoldenBets,
        count: mlGoldenBets.length,
        source: 'ML_API',
        fixturesAnalyzed: fixtures.length,
        cached: false
      });
    }
    
    // Fallback to database if ML API returns nothing
    console.log('⚠️ ML API returned no Golden Bets, falling back to database');
    
    const goldenBets = await Prediction.find({
      isGoldenBet: true,
      date: { $gte: today, $lte: endOfDay },
    })
      .sort({ confidence: -1 })
      .limit(3);
    
    res.json({
      success: true,
      data: goldenBets,
      count: goldenBets.length,
      source: 'DATABASE_FALLBACK',
      dateRange: {
        from: today.toISOString(),
        to: endOfDay.toISOString()
      },
      cached: false
    });
  } catch (error: any) {
    console.error('Golden Bets error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Golden Bet by ID
router.get('/:id', async (req, res) => {
  try {
    const goldenBet = await Prediction.findById(req.params.id);
    
    if (!goldenBet || !goldenBet.isGoldenBet) {
      return res.status(404).json({
        success: false,
        error: 'Golden Bet not found',
      });
    }
    
    res.json({
      success: true,
      data: goldenBet,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get historical Golden Bets with filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, result, page = 1, limit = 10 } = req.query;
    
    const query: any = { isGoldenBet: true };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }
    
    if (result) {
      query.result = result;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [goldenBets, total] = await Promise.all([
      Prediction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Prediction.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: goldenBets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
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
