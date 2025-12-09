import { Router } from 'express';
import { mlService } from '../services/mlService';
import dayjs from 'dayjs';

const router = Router();

// GET /api/bet-builder (today's bet builder)
router.get('/', async (req, res) => {
  try {
    const today = dayjs().format('YYYY-MM-DD');
    const data = await mlService.getBetBuilder(today);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Bet Builder error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bet-builder/history (multiple days)
router.get('/history', async (req, res) => {
  try {
    const date = (req.query.date as string) || dayjs().format('YYYY-MM-DD');
    const data = await mlService.getBetBuilder(date);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error('Bet Builder history error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
