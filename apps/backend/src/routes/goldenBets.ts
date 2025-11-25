import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';
import { loadGoldenBets } from '../services/mlService.js';

const router = Router();

// Get today's Golden Bets from LM outputs
router.get('/today', async (req, res) => {
  try {
    // First try to load from LM outputs (golden-betopia)
    const lmGoldenBets = await loadGoldenBets();
    
    if (lmGoldenBets && lmGoldenBets.length > 0) {
      return res.json({
        success: true,
        data: lmGoldenBets,
        count: lmGoldenBets.length,
        source: 'LM_OUTPUTS'
      });
    }
    
    // Fallback to database
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
    
    res.json({
      success: true,
      data: goldenBets,
      count: goldenBets.length,
      source: 'DATABASE'
    });
  } catch (error: any) {
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
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
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
