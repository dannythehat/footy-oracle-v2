import express, { Request, Response } from 'express';
import { Fixture } from '../models/Fixture.js';
import {
  getCompleteFixtureData,
  fetchFixtureById,
  fetchFixtureStatistics,
  fetchFixtureEvents,
  fetchH2H,
  fetchStandings
} from '../services/fixtureDataService.js';

const router = express.Router();

/**
 * Get complete fixture data (all endpoints in one call)
 * GET /fixtures/:fixtureId/complete
 */
router.get('/fixtures/:fixtureId/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    // Get fixture from MongoDB
    const fixtureDoc = await Fixture.findOne({ fixtureId }).lean();
    
    if (!fixtureDoc) {
      res.status(404).json({ error: 'Fixture not found in database' });
      return;
    }

    // Fetch all data using the unified service
    const completeData = await getCompleteFixtureData(fixtureDoc);

    res.json({
      success: true,
      data: completeData
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Complete data error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch complete fixture data' });
  }
});

/**
 * Get fixture by ID
 * GET /fixtures/:fixtureId
 */
router.get('/fixtures/:fixtureId', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    const fixture = await fetchFixtureById(fixtureId);

    res.json({
      success: true,
      data: fixture
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Fixture error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch fixture' });
  }
});

/**
 * Get head-to-head matches
 * GET /fixtures/:fixtureId/h2h
 */
router.get('/fixtures/:fixtureId/h2h', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    // Get fixture from MongoDB to get team IDs
    const fixtureDoc = await Fixture.findOne({ fixtureId }).lean();
    
    if (!fixtureDoc) {
      res.status(404).json({ error: 'Fixture not found in database' });
      return;
    }

    const homeId = fixtureDoc.homeTeamId;
    const awayId = fixtureDoc.awayTeamId;

    if (!homeId || !awayId) {
      res.status(400).json({ error: 'Cannot determine teams for H2H' });
      return;
    }

    const h2hData = await fetchH2H(homeId, awayId);

    res.json({
      success: true,
      data: h2hData
    });
  } catch (err: any) {
    console.error('[fixtureDetails] H2H error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch H2H data' });
  }
});

/**
 * Get fixture statistics
 * GET /fixtures/:fixtureId/stats
 */
router.get('/fixtures/:fixtureId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    const stats = await fetchFixtureStatistics(fixtureId);

    res.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Stats error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch fixture statistics' });
  }
});

/**
 * Get fixture events (goals, cards, subs)
 * GET /fixtures/:fixtureId/events
 */
router.get('/fixtures/:fixtureId/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    const events = await fetchFixtureEvents(fixtureId);

    res.json({
      success: true,
      data: events
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Events error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch fixture events' });
  }
});

/**
 * Get league standings
 * GET /leagues/:leagueId/standings?season=2024
 */
router.get('/leagues/:leagueId/standings', async (req: Request, res: Response): Promise<void> => {
  try {
    const leagueId = Number(req.params.leagueId);
    const season = Number(req.query.season);

    if (!leagueId) {
      res.status(400).json({ error: 'Invalid leagueId' });
      return;
    }
    if (!season) {
      res.status(400).json({ error: 'season query parameter is required' });
      return;
    }

    const standings = await fetchStandings(leagueId, season);

    res.json({
      success: true,
      data: standings
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Standings error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch league standings' });
  }
});

/**
 * Get live fixture data (fixture + events)
 * GET /fixtures/:fixtureId/live
 */
router.get('/fixtures/:fixtureId/live', async (req: Request, res: Response): Promise<void> => {
  try {
    const fixtureId = Number(req.params.fixtureId);
    if (!fixtureId) {
      res.status(400).json({ error: 'Invalid fixtureId' });
      return;
    }

    const [fixture, events, stats] = await Promise.all([
      fetchFixtureById(fixtureId),
      fetchFixtureEvents(fixtureId),
      fetchFixtureStatistics(fixtureId)
    ]);

    res.json({
      success: true,
      data: {
        fixture,
        events,
        stats
      }
    });
  } catch (err: any) {
    console.error('[fixtureDetails] Live error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch live data' });
  }
});

export default router;
