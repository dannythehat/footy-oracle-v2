import { Router } from 'express';
import { loadValueBets } from '../services/mlService';

const router = Router();

router.get('/today', async (req, res) => {
  try {
    const bets = await loadValueBets();
    return res.json({
      success: true,
      count: bets.length,
      data: bets,
    });
  } catch (error) {
    console.error('Error in /value-bets/today:', error);
    return res.status(500).json({
      success: false,
      error: 'Value Bets failed',
    });
  }
});

export default router;
