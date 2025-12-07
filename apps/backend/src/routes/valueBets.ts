import { Router } from 'express';
import { Fixture } from '../models/Fixture.js';
import { loadValueBets } from '../services/mlService.js';
import { predictionCache } from '../services/predictionCache.js';

const router = Router();

router.get('/today', async (req, res) => {
  try {
    // Check cache first
    const cachedBets = predictionCache.getValueBets();
    if (cachedBets && cachedBets.length > 0) {
      return res.json({
        success: true,
        data: cachedBets,
        count: cachedBets.length,
        source: 'CACHE',
        cached: true
      });
    }
    
    console.log('🔄 Cache miss - fetching fresh Value Bets from ML API');
    
    // Get today's fixtures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const fixtures = await Fixture.find({
      date: { $gte: today, $lte: endOfDay },
      status: { $in: ['scheduled', 'live'] }
    });
    
    console.log(`📊 Found ${fixtures.length} fixtures for Value Bets`);
    
    // Call ML API with today's fixtures
    const bets = await loadValueBets(fixtures);
    
    if (bets && bets.length > 0) {
      // Cache the results for 24 hours
      predictionCache.setValueBets(bets);
      
      return res.json({
        success: true,
        count: bets.length,
        data: bets,
        source: 'ML_API',
        fixturesAnalyzed: fixtures.length,
        cached: false
      });
    }
    
    // Return empty array if no bets found
    return res.json({
      success: true,
      count: 0,
      data: [],
      source: 'ML_API',
      fixturesAnalyzed: fixtures.length,
      cached: false
    });
  } catch (error: any) {
    console.error('Error in /value-bets/today:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Value Bets failed',
    });
  }
});

export default router;
