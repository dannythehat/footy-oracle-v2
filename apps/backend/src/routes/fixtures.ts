import { Router, Request, Response } from 'express';
import { Fixture } from '../models/Fixture.js';
import { 
  analyzeFixture, 
  analyzeBulkFixtures, 
  findGoldenBets, 
  findValueBets,
  Fixture as FixtureInput 
} from '../services/fixturesService';
import {
  fetchH2H,
  fetchTeamStats,
  fetchFixtureStats,
  fetchTeamLastFixtures
} from '../services/apiFootballService';
import { loadFixturesForDate } from '../cron/fixturesCron.js';

const router = Router();

// Manual fixtures loading endpoint
router.post('/load', async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`📥 Manual fixtures load requested for ${targetDate}`);
    const result = await loadFixturesForDate(targetDate);
    
    res.json({
      success: true,
      message: `Loaded fixtures for ${targetDate}`,
      ...result
    });
  } catch (error: any) {
    console.error('Error loading fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get fixtures by date
router.get('/', async (req, res) => {
  try {
    const { date, league, status } = req.query;
    
    const query: any = {};
    
    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDate };
    }
    
    if (league) {
      query.league = league;
    }
    
    if (status) {
      query.status = status;
    }
    
    const fixtures = await Fixture.find(query).sort({ date: 1 });
    
    res.json({
      success: true,
      data: fixtures,
      count: fixtures.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get fixture by ID
router.get('/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) });
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found',
      });
    }
    
    res.json({
      success: true,
      data: fixture,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get available leagues
router.get('/meta/leagues', async (req, res) => {
  try {
    const leagues = await Fixture.distinct('league');
    
    res.json({
      success: true,
      data: leagues,
      count: leagues.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// NEW: Get Head-to-Head data
router.get('/:id/h2h', async (req: Request, res: Response) => {
  try {
    const { homeTeamId, awayTeamId, last } = req.query;
    
    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({
        success: false,
        error: 'homeTeamId and awayTeamId are required'
      });
    }

    const h2hData = await fetchH2H(
      Number(homeTeamId),
      Number(awayTeamId),
      last ? Number(last) : 10
    );

    res.json({
      success: true,
      data: h2hData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Get team statistics
router.get('/team/:teamId/stats', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { leagueId, season } = req.query;
    
    if (!leagueId || !season) {
      return res.status(400).json({
        success: false,
        error: 'leagueId and season are required'
      });
    }

    const stats = await fetchTeamStats(
      Number(teamId),
      Number(leagueId),
      Number(season)
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Get complete fixture statistics (H2H + both teams)
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeTeamId, awayTeamId, leagueId, season } = req.query;
    
    if (!homeTeamId || !awayTeamId || !leagueId || !season) {
      return res.status(400).json({
        success: false,
        error: 'homeTeamId, awayTeamId, leagueId, and season are required'
      });
    }

    const stats = await fetchFixtureStats(
      Number(id),
      Number(homeTeamId),
      Number(awayTeamId),
      Number(leagueId),
      Number(season)
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NEW: Get team's last fixtures
router.get('/team/:teamId/last-fixtures', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { last } = req.query;

    const fixtures = await fetchTeamLastFixtures(
      Number(teamId),
      last ? Number(last) : 5
    );

    res.json({
      success: true,
      data: fixtures,
      count: fixtures.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI-POWERED ENDPOINTS

/**
 * POST /api/fixtures/analyze
 * Analyze a single fixture with AI
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const fixture: FixtureInput = req.body;
    
    if (!fixture.homeTeam || !fixture.awayTeam || !fixture.league) {
      return res.status(400).json({ 
        error: 'Missing required fields: homeTeam, awayTeam, league' 
      });
    }

    const prediction = await analyzeFixture(fixture);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    console.error('Error analyzing fixture:', error);
    res.status(500).json({ 
      error: 'Failed to analyze fixture', 
      message: error.message 
    });
  }
});

/**
 * POST /api/fixtures/analyze-bulk
 * Analyze multiple fixtures with AI
 */
router.post('/analyze-bulk', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({ 
        error: 'fixtures array is required and must not be empty' 
      });
    }

    const predictions = await analyzeBulkFixtures(fixtures);
    res.json({ 
      success: true, 
      data: predictions,
      count: predictions.length 
    });
  } catch (error: any) {
    console.error('Error analyzing fixtures:', error);
    res.status(500).json({ 
      error: 'Failed to analyze fixtures', 
      message: error.message 
    });
  }
});

/**
 * POST /api/fixtures/golden-bets
 * Find golden bets from fixtures using AI
 */
router.post('/golden-bets', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({ 
        error: 'fixtures array is required' 
      });
    }

    const predictions = await analyzeBulkFixtures(fixtures);
    const goldenBets = await findGoldenBets(predictions);
    
    res.json({ 
      success: true, 
      data: goldenBets,
      count: goldenBets.length 
    });
  } catch (error: any) {
    console.error('Error finding golden bets:', error);
    res.status(500).json({ 
      error: 'Failed to find golden bets', 
      message: error.message 
    });
  }
});

/**
 * POST /api/fixtures/value-bets
 * Find value bets from fixtures using AI
 */
router.post('/value-bets', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({ 
        error: 'fixtures array is required' 
      });
    }

    const predictions = await analyzeBulkFixtures(fixtures);
    const valueBets = await findValueBets(predictions);
    
    res.json({ 
      success: true, 
      data: valueBets,
      count: valueBets.length 
    });
  } catch (error: any) {
    console.error('Error finding value bets:', error);
    res.status(500).json({ 
      error: 'Failed to find value bets', 
      message: error.message 
    });
  }
});

/**
 * GET /api/fixtures/health
 * Health check for fixtures service
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    service: 'fixtures',
    openai: !!process.env.OPENAI_API_KEY,
    apiFootball: !!process.env.API_FOOTBALL_KEY,
    timestamp: new Date().toISOString()
  });
});

export default router;
