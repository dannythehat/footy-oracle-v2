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
   OPTIMIZED: Uses lean() for faster queries, limits results
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

    // Fetch from DB with optimization
    // lean() returns plain JS objects (faster than Mongoose documents)
    // limit to 200 fixtures per day (reasonable max)
    const fixtures = await Fixture.find(query)
      .sort({ date: 1 })
      .limit(200)
      .lean()
      .maxTimeMS(5000); // 5 second query timeout

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
    console.error('❌ Error fetching fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch fixtures'
    });
  }
});


/* ============================================================
   📌 FIXTURE BY ID
   ============================================================ */
router.get('/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) })
      .lean()
      .maxTimeMS(3000);

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
    console.error('❌ Error fetching fixture:', error);
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
    const leagues = await Fixture.distinct('league')
      .maxTimeMS(3000);

    res.json({
      success: true,
      data: leagues,
      count: leagues.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching leagues:', error);
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
    console.error('❌ Error fetching H2H:', error);
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
    console.error('❌ Error fetching team stats:', error);
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
    console.error('❌ Error fetching fixture stats:', error);
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
    console.error('❌ Error fetching team fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 AI ANALYSIS - SINGLE FIXTURE
   ============================================================ */
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fixture = await Fixture.findOne({ fixtureId: Number(id) }).lean();

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found'
      });
    }

    const fixtureInput: FixtureInput = {
      id: fixture.fixtureId.toString(),
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
    };

    const prediction = await analyzeFixture(fixtureInput);

    res.json({
      success: true,
      data: prediction
    });

  } catch (error: any) {
    console.error('❌ Error analyzing fixture:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 AI ANALYSIS - BULK FIXTURES
   ============================================================ */
router.post('/analyze/bulk', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: targetDate, $lt: nextDate }
    }).limit(50).lean();

    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId.toString(),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
    }));

    const predictions = await analyzeBulkFixtures(fixtureInputs);

    res.json({
      success: true,
      data: predictions,
      count: predictions.length
    });

  } catch (error: any) {
    console.error('❌ Error analyzing fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 GOLDEN BETS FINDER
   ============================================================ */
router.post('/golden-bets', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: targetDate, $lt: nextDate }
    }).limit(50).lean();

    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId.toString(),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
    }));

    const predictions = await analyzeBulkFixtures(fixtureInputs);
    const goldenBets = await findGoldenBets(predictions);

    res.json({
      success: true,
      data: goldenBets,
      count: goldenBets.length
    });

  } catch (error: any) {
    console.error('❌ Error finding golden bets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 VALUE BETS FINDER
   ============================================================ */
router.post('/value-bets', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: targetDate, $lt: nextDate }
    }).limit(50).lean();

    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId.toString(),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
    }));

    const predictions = await analyzeBulkFixtures(fixtureInputs);
    const valueBets = await findValueBets(predictions);

    res.json({
      success: true,
      data: valueBets,
      count: valueBets.length
    });

  } catch (error: any) {
    console.error('❌ Error finding value bets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
