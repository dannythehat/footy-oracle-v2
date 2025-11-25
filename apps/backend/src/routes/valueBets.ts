import { Router } from 'express';
import { loadValueBets } from '../services/mlService.js';

const router = Router();

// Get today's Value Bets from LM outputs
router.get('/today', async (req, res) => {
  try {
    const valueBets = await loadValueBets();
    
    res.json({
      success: true,
      data: valueBets,
      count: valueBets.length,
      source: 'LM_OUTPUTS'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all Value Bets with filters
router.get('/', async (req, res) => {
  try {
    const { minEdge, minConfidence, league, market } = req.query;
    
    let valueBets = await loadValueBets();
    
    // Apply filters
    if (minEdge) {
      valueBets = valueBets.filter(bet => (bet.edge || 0) >= Number(minEdge));
    }
    
    if (minConfidence) {
      valueBets = valueBets.filter(bet => bet.confidence >= Number(minConfidence));
    }
    
    if (league) {
      valueBets = valueBets.filter(bet => bet.league === league);
    }
    
    if (market) {
      valueBets = valueBets.filter(bet => bet.market === market);
    }
    
    res.json({
      success: true,
      data: valueBets,
      count: valueBets.length,
      filters: { minEdge, minConfidence, league, market }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
