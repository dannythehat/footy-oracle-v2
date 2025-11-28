import { Router } from 'express';
import { Fixture } from '../models/Fixture';

const router = Router();

/**
 * GET /api/admin/fixtures/count
 * Check how many fixtures exist in MongoDB
 */
router.get('/fixtures/count', async (_req, res) => {
  try {
    const count = await Fixture.countDocuments();
    const latest = await Fixture.findOne().sort({ date: -1 }).lean();

    res.json({
      ok: true,
      count,
      latestDate: latest?.date ?? null,
    });
  } catch (err) {
    console.error('[ADMIN] fixtures/count error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get fixtures count' });
  }
});

export default router;
