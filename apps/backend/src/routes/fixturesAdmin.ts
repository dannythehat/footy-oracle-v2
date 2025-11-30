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

    // Count mock fixtures
    const mockCount = await Fixture.countDocuments({
      $or: [
        { homeTeam: /Unknown/i },
        { awayTeam: /Unknown/i },
        { league: /Unknown/i },
        { country: /Unknown/i }
      ]
    });

    res.json({
      ok: true,
      count,
      mockFixtures: mockCount,
      realFixtures: count - mockCount,
      latestDate: latest?.date ?? null,
      earliestDate: earliest?.date ?? null,
    });
  } catch (err) {
    console.error('[ADMIN] fixtures/count error:', err);
    res.status(500).json({ ok: false, error: 'Failed to get fixtures count' });
  }
});

/**
 * POST /api/admin/fixtures/clear-mock
 * Clear all mock/seed fixtures with "Unknown" team names
 * and reload real fixtures from API-Football
 */
router.post('/fixtures/clear-mock', async (_req, res) => {
  try {
    console.log('🗑️  Clearing mock fixtures...');
    
    // Count mock fixtures before deletion
    const mockCount = await Fixture.countDocuments({
      $or: [
        { homeTeam: /Unknown/i },
        { awayTeam: /Unknown/i },
        { league: /Unknown/i },
        { country: /Unknown/i }
      ]
    });

    if (mockCount === 0) {
      return res.json({
        ok: true,
        message: 'No mock fixtures found - database is clean',
        deleted: 0
      });
    }

    // Delete mock fixtures
    const deleteResult = await Fixture.deleteMany({
      $or: [
        { homeTeam: /Unknown/i },
        { awayTeam: /Unknown/i },
        { league: /Unknown/i },
        { country: /Unknown/i }
      ]
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} mock fixtures`);

    // Trigger real fixtures load in background
    console.log('🔄 Loading real fixtures from API-Football...');
    loadFixturesWindow().catch(err => 
      console.error('❌ Background fixtures load failed:', err)
    );

    res.json({
      ok: true,
      message: 'Mock fixtures cleared and real fixtures loading started',
      deleted: deleteResult.deletedCount,
      note: 'Real fixtures loading in background (takes 2-3 minutes). Check /api/admin/fixtures/count to monitor progress.'
    });
  } catch (err: any) {
    console.error('[ADMIN] fixtures/clear-mock error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to clear mock fixtures' 
    });
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
