import { Router } from 'express';
import { Fixture } from '../models/Fixture.js';
import { loadValueBets } from '../services/mlService.js';

const router = Router();

router.get('/today', async (req, res) => {
  try {
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
    
    return res.json({
      success: true,
      count: bets.length,
      data: bets,
      source: 'ML_API',
      fixturesAnalyzed: fixtures.length
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
