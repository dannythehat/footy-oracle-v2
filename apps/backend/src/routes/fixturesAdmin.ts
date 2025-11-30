import { Router } from 'express';
import { Fixture } from '../models/Fixture.js';
import { loadFixturesWindow, loadFixturesForDate } from '../cron/fixturesCron.js';

const router = Router();

/**
 * GET /api/admin/fixtures/count
 * Check how many fixtures exist in MongoDB
 */
router.get('/fixtures/count', async (_req, res) => {
  try {
    const count = await Fixture.countDocuments();
    const latest = await Fixture.findOne().sort({ date: -1 }).lean();
    const earliest = await Fixture.findOne().sort({ date: 1 }).lean();

    res.json({
      ok: true,
      count,
      latestDate: latest?.date ?? null,
      earliestDate: earliest?.date ?? null,
    });
  } catch (err) {
    console.error('[ADMIN] fixtures/count error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get fixtures count' });
  }
});

/**
 * POST /api/admin/fixtures/load-window
 * Manually trigger fixtures window loading (7 days back + 7 days ahead)
 */
router.post('/fixtures/load-window', async (_req, res) => {
  try {
    console.log('🔄 Manual fixtures window load triggered...');
    
    // Don't await - respond immediately and load in background
    loadFixturesWindow().catch(err => 
      console.error('❌ Background fixtures load failed:', err)
    );

    res.json({
      ok: true,
      message: 'Fixtures loading started in background (7 days back + 7 days ahead)',
      note: 'Check server logs for progress'
    });
  } catch (err) {
    console.error('[ADMIN] fixtures/load-window error:', err);
    res.status(500).json({ ok: false, error: 'Failed to trigger fixtures load' });
  }
});

/**
 * POST /api/admin/fixtures/load-date
 * Manually load fixtures for a specific date
 * Body: { date: "YYYY-MM-DD" }
 */
router.post('/fixtures/load-date', async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Date is required (format: YYYY-MM-DD)' 
      });
    }

    console.log(`🔄 Manual fixtures load for ${date} triggered...`);
    
    const result = await loadFixturesForDate(date);

    res.json({
      ok: true,
      message: `Fixtures loaded for ${date}`,
      result
    });
  } catch (err: any) {
    console.error('[ADMIN] fixtures/load-date error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to load fixtures for date' 
    });
  }
});

export default router;
