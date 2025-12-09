import { Router } from 'express';
import { mlService } from '../services/mlService';
import dayjs from 'dayjs';

const router = Router();

// GET /api/value-bets/today
router.get('/today', async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const data = await mlService.getValueBets(today);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Value Bets error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/value-bets
router.get('/', async (req, res) => {
  try {
    const date = (req.query.date as string) || dayjs().format('YYYY-MM-DD');
    const data = await mlService.getValueBets(date);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Value Bets error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
