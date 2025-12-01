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

/**
 * Helper function to format Date to HH:mm string
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Helper function to format Date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ============================================================
   📌 FIXTURES LIST - CLEAN FLAT STRUCTURE WITH ODDS & SCORES
   Returns EXACT structure frontend expects with odds and predictions
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
    const fixtures = await Fixture.find(query)
      .sort({ date: 1 })
      .limit(200)
      .lean()
      .maxTimeMS(5000);

    // Convert to CLEAN FLAT structure with odds, scores, and predictions
    const cleanFixtures = fixtures.map((f: any) => ({
      id: f.fixtureId,
      date: formatDate(new Date(f.date)),
      time: formatTime(new Date(f.date)),
      leagueId: f.leagueId,
      leagueName: f.league,
      homeTeamName: f.homeTeam,
      awayTeamName: f.awayTeam,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status: f.status,
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
      season: f.season,
      country: f.country,
      // Include odds if available
      odds: f.odds ? {
        btts: f.odds.btts,
        btts_yes: f.odds.btts_yes,
        over25: f.odds.over25,
        over_2_5: f.odds.over_2_5,
        over35cards: f.odds.over35cards,
        over_3_5_cards: f.odds.over_3_5_cards,
        over95corners: f.odds.over95corners,
        over_9_5_corners: f.odds.over_9_5_corners,
      } : undefined,
      // Include AI predictions if available
      aiBets: f.aiBets ? {
        bts: f.aiBets.bts,
        over25: f.aiBets.over25,
        over35cards: f.aiBets.over35cards,
        over95corners: f.aiBets.over95corners,
        goldenBet: f.aiBets.goldenBet,
      } : undefined,
      // Include golden bet if available
      golden_bet: f.golden_bet,
    }));

    res.json({
      success: true,
      data: cleanFixtures,
      count: cleanFixtures.length,
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
   📌 FIXTURE BY ID - CLEAN FLAT STRUCTURE
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

    // Return CLEAN FLAT structure
    const cleanFixture = {
      id: fixture.fixtureId,
      date: formatDate(new Date(fixture.date)),
      time: formatTime(new Date(fixture.date)),
      leagueId: fixture.leagueId,
      leagueName: fixture.league,
      homeTeamName: fixture.homeTeam,
      awayTeamName: fixture.awayTeam,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      status: fixture.status,
      country: fixture.country,
      season: fixture.season,
      homeScore: fixture.score?.home ?? null,
      awayScore: fixture.score?.away ?? null,
      odds: fixture.odds,
      score: fixture.score,
      aiBets: fixture.aiBets,
      golden_bet: fixture.golden_bet,
    };

    res.json({
      success: true,
      data: cleanFixture
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
router.get('/team/:teamId/last', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { last } = req.query;

    const fixtures = await fetchTeamLastFixtures(
      Number(teamId),
      last ? Number(last) : 5
    );

    res.json({
      success: true,
      data: fixtures
    });

  } catch (error: any) {
    console.error('❌ Error fetching team last fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 ANALYZE FIXTURE (ML PREDICTIONS)
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

    // Convert to FixtureInput format for ML service
    const fixtureInput: FixtureInput = {
      id: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
      odds: fixture.odds
    };

    const analysis = await analyzeFixture(fixtureInput);

    res.json({
      success: true,
      data: analysis
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
   📌 BULK ANALYZE FIXTURES
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
    }).lean();

    // Convert to FixtureInput format
    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
      odds: f.odds
    }));

    const analyses = await analyzeBulkFixtures(fixtureInputs);

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });

  } catch (error: any) {
    console.error('❌ Error bulk analyzing fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 FIND GOLDEN BETS
   ============================================================ */
router.get('/golden-bets/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow }
    }).lean();

    // Convert to FixtureInput format
    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
      odds: f.odds
    }));

    const goldenBets = await findGoldenBets(fixtureInputs);

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
   📌 FIND VALUE BETS
   ============================================================ */
router.get('/value-bets/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow }
    }).lean();

    // Convert to FixtureInput format
    const fixtureInputs: FixtureInput[] = fixtures.map(f => ({
      id: f.fixtureId,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      league: f.league,
      date: f.date.toISOString(),
      odds: f.odds
    }));

    const valueBets = await findValueBets(fixtureInputs);

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
