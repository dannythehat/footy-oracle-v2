import { Router } from 'express';
import { Fixture } from '../models/Fixture.js';
import { loadFixturesWindow, loadFixturesForDate } from '../cron/fixturesCron.js';
import { updateTodayOdds } from '../services/oddsUpdateService.js';

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
 * GET /api/admin/fixtures/sample-with-odds
 * Inspect sample fixtures to see which have odds populated
 */
router.get('/fixtures/sample-with-odds', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow }
    }).limit(10).lean();

    const withOdds = fixtures.filter(f => f.odds && Object.keys(f.odds).length > 0);
    const withoutOdds = fixtures.filter(f => !f.odds || Object.keys(f.odds).length === 0);

    res.json({
      ok: true,
      total: fixtures.length,
      withOdds: withOdds.length,
      withoutOdds: withoutOdds.length,
      samples: {
        withOdds: withOdds.slice(0, 2).map(f => ({
          fixtureId: f.fixtureId,
          homeTeam: f.homeTeam,
          awayTeam: f.awayTeam,
          league: f.league,
          odds: f.odds
        })),
        withoutOdds: withoutOdds.slice(0, 2).map(f => ({
          fixtureId: f.fixtureId,
          homeTeam: f.homeTeam,
          awayTeam: f.awayTeam,
          league: f.league,
          status: f.status
        }))
      }
    });
  } catch (err: any) {
    console.error('[ADMIN] fixtures/sample-with-odds error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to get fixture samples' 
    });
  }
});

/**
 * GET /api/admin/fixtures/odds-stats
 * Get statistics about odds coverage
 */
router.get('/fixtures/odds-stats', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow }
    }).lean();

    const total = todayFixtures.length;
    const withOdds = todayFixtures.filter(f => f.odds && Object.keys(f.odds).length > 0).length;
    const withBtts = todayFixtures.filter(f => f.odds?.btts).length;
    const withOver25 = todayFixtures.filter(f => f.odds?.over25).length;
    const withOver95Corners = todayFixtures.filter(f => f.odds?.over95corners).length;
    const withOver35Cards = todayFixtures.filter(f => f.odds?.over35cards).length;

    res.json({
      ok: true,
      date: today.toISOString().split('T')[0],
      total,
      withOdds,
      withoutOdds: total - withOdds,
      coverage: {
        overall: total > 0 ? ((withOdds / total) * 100).toFixed(1) + '%' : '0%',
        btts: total > 0 ? ((withBtts / total) * 100).toFixed(1) + '%' : '0%',
        over25: total > 0 ? ((withOver25 / total) * 100).toFixed(1) + '%' : '0%',
        over95corners: total > 0 ? ((withOver95Corners / total) * 100).toFixed(1) + '%' : '0%',
        over35cards: total > 0 ? ((withOver35Cards / total) * 100).toFixed(1) + '%' : '0%'
      }
    });
  } catch (err: any) {
    console.error('[ADMIN] fixtures/odds-stats error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to get odds statistics' 
    });
  }
});

/**
 * POST /api/admin/fixtures/update-odds
 * Manually trigger odds update for today's fixtures
 */
router.post('/fixtures/update-odds', async (_req, res) => {
  try {
    console.log('💰 Manual odds update triggered...');
    
    const result = await updateTodayOdds();

    res.json({
      ok: true,
      message: 'Odds update completed',
      result: {
        updated: result.updated,
        total: result.total,
        errors: result.errors,
        successRate: result.total > 0 
          ? ((result.updated / result.total) * 100).toFixed(1) + '%' 
          : '0%'
      }
    });
  } catch (err: any) {
    console.error('[ADMIN] fixtures/update-odds error:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to update odds' 
    });
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
