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

const router = Router();

/* ============================================================
   📌 FIXTURES LIST (FRONTEND USES THIS ONE)
   Normalized format for React UI (no undefined, camelCase only)
   ============================================================ */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { date, league, status } = req.query;

    const query: any = {};

    if (date) {
      const targetDate = new Date(date as string);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      query.date = { $gte: targetDate, $lt: nextDate };
    }

    if (league) query.league = league;
    if (status) query.status = status;

    // Fetch from DB
    const fixtures = await Fixture.find(query).sort({ date: 1 });

    // Convert to clean frontend format
    const normalized = fixtures.map((f: any) => ({
      fixtureId: f.fixtureId ?? f.fixture_id,
      kickoff: f.date ?? null,
      homeTeam: f.homeTeam || f.home_team || f.teams?.home?.name || "Unknown Home",
      awayTeam: f.awayTeam || f.away_team || f.teams?.away?.name || "Unknown Away",
      league: typeof f.league === 'string'
        ? f.league
        : f.league?.name || "Unknown League",
      country: typeof f.country === 'string'
        ? f.country
        : f.league?.country || "Unknown",
      status: f.status || "scheduled",
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
    }));

    res.json({
      success: true,
      data: normalized,
      count: normalized.length,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 FIXTURE BY ID
   ============================================================ */
router.get('/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) });

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found'
      });
    }

    res.json({
      success: true,
      data: fixture
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 DISTINCT LEAGUES
   ============================================================ */
router.get('/meta/leagues', async (req, res) => {
  try {
    const leagues = await Fixture.distinct('league');

    res.json({
      success: true,
      data: leagues,
      count: leagues.length
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 H2H
   ============================================================ */
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


/* ============================================================
   📌 TEAM STATS
   ============================================================ */
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


/* ============================================================
   📌 FIXTURE STATS
   ============================================================ */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { homeTeamId, awayTeamId, leagueId, season } = req.query;

    if (!homeTeamId || !awayTeamId || !leagueId || !season) {
      return res.status(400).json({
        success: false,
        error: 'Missing params'
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


/* ============================================================
   📌 TEAM LAST FIXTURES
   ============================================================ */
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


/* ============================================================
   📌 AI: ANALYZE SINGLE FIXTURE
   ============================================================ */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const fixture: FixtureInput = req.body;

    if (!fixture.homeTeam || !fixture.awayTeam || !fixture.league) {
      return res.status(400).json({
        error: 'Missing required fixture fields'
      });
    }

    const prediction = await analyzeFixture(fixture);

    res.json({
      success: true,
      data: prediction
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to analyze fixture',
      message: error.message
    });
  }
});


/* ============================================================
   📌 AI: BULK ANALYZE FIXTURES
   ============================================================ */
router.post('/analyze-bulk', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({
        error: 'fixtures array is required'
      });
    }

    const predictions = await analyzeBulkFixtures(fixtures);

    res.json({
      success: true,
      data: predictions,
      count: predictions.length
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to analyze fixtures',
      message: error.message
    });
  }
});


/* ============================================================
   📌 AI: GOLDEN BETS
   ============================================================ */
router.post('/golden-bets', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;

    const predictions = await analyzeBulkFixtures(fixtures);
    const golden = await findGoldenBets(predictions);

    res.json({
      success: true,
      data: golden,
      count: golden.length
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to find golden bets',
      message: error.message
    });
  }
});


/* ============================================================
   📌 AI: VALUE BETS
   ============================================================ */
router.post('/value-bets', async (req: Request, res: Response) => {
  try {
    const fixtures: FixtureInput[] = req.body.fixtures;

    const predictions = await analyzeBulkFixtures(fixtures);
    const value = await findValueBets(predictions);

    res.json({
      success: true,
      data: value,
      count: value.length
    });

  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to find value bets',
      message: error.message
    });
  }
});


/* ============================================================
   📌 HEALTH CHECK
   ============================================================ */
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
