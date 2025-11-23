import { Router } from 'express';
import { Prediction } from '../models/Prediction.js';

const router = Router();

// Get all predictions with filters
router.get('/', async (req, res) => {
  try {
    const { 
      date, 
      league, 
      minConfidence, 
      result,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query: any = {};
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (league) {
      query.league = league;
    }
    
    if (minConfidence) {
      query.confidence = { $gte: Number(minConfidence) };
    }
    
    if (result) {
      query.result = result;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort({ confidence: -1, date: 1 })
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

export default router;
