import { Router, Request, Response } from 'express';
import { Fixture } from '../models/Fixture.js';
import axios from 'axios';
import { getLeagueLogo } from '../config/leagues.js';

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

const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  },
  timeout: 15000,
});

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

/**
 * MAP STATUS from API-Football to our format
 */
function mapStatus(short: string): string {
  const statusMap: Record<string, string> = {
    'TBD': 'scheduled',
    'NS': 'scheduled',
    '1H': 'live',
    'HT': 'live',
    '2H': 'live',
    'ET': 'live',
    'BT': 'live',
    'P': 'live',
    'SUSP': 'live',
    'INT': 'live',
    'FT': 'finished',
    'AET': 'finished',
    'PEN': 'finished',
    'PST': 'postponed',
    'CANC': 'cancelled',
    'ABD': 'abandoned',
    'AWD': 'finished',
    'WO': 'finished',
  };
  return statusMap[short] || short;
}

/**
 * Fetch live scores for a specific date from API-Football (ONE API CALL)
 * This is 100x faster than fetching individual fixtures
 */
async function fetchLiveScoresByDate(dateStr: string): Promise<Map<number, any>> {
  const scoresMap = new Map();
  
  try {
    console.log(`🔄 Fetching all fixtures for date: ${dateStr}`);
    
    // Fetch ALL fixtures for this date in ONE API call
    const response = await apiClient.get('/fixtures', {
      params: { 
        date: dateStr,
        timezone: 'UTC'
      }
    });
    
    const fixtures = response.data.response || [];
    console.log(`✅ Received ${fixtures.length} fixtures from API`);
    
    // Map all fixtures by their ID
    for (const fixture of fixtures) {
      const fixtureId = fixture.fixture.id;
      scoresMap.set(fixtureId, {
        status: mapStatus(fixture.fixture.status.short),
        homeScore: fixture.goals.home ?? null,
        awayScore: fixture.goals.away ?? null,
        statusShort: fixture.fixture.status.short,
      });
    }
    
    console.log(`✅ Mapped ${scoresMap.size} fixture scores`);
  } catch (error: any) {
    console.error('❌ Error fetching live scores by date:', error.message);
  }
  
  return scoresMap;
}

/* ============================================================
   📌 REFRESH SCORES - Update live and completed fixture scores
   ============================================================ */
router.post('/refresh-scores', async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    
    let dateStr: string;
    let query: any = {};
    
    if (date) {
      dateStr = date;
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    } else {
      // Default: refresh today's fixtures
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateStr = formatDate(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }
    
    console.log(`🔄 Refreshing scores for date: ${dateStr}`);
    
    // Find fixtures in our database for this date
    const fixtures = await Fixture.find(query).lean();
    
    if (fixtures.length === 0) {
      return res.json({
        success: true,
        message: 'No fixtures found to update',
        updated: 0
      });
    }
    
    console.log(`📊 Found ${fixtures.length} fixtures in database`);
    
    // Fetch ALL scores for this date in ONE API call
    const scoresMap = await fetchLiveScoresByDate(dateStr);
    
    let updated = 0;
    let notFound = 0;
    
    // Update fixtures with new scores
    for (const fixture of fixtures) {
      const scoreData = scoresMap.get(fixture.fixtureId);
      
      if (scoreData) {
        await Fixture.updateOne(
          { fixtureId: fixture.fixtureId },
          {
            $set: {
              status: scoreData.status,
              'score.home': scoreData.homeScore,
              'score.away': scoreData.awayScore,
            }
          }
        );
        updated++;
      } else {
        notFound++;
      }
    }
    
    console.log(`✅ Updated ${updated} fixtures, ${notFound} not found in API response`);
    
    res.json({
      success: true,
      message: `Updated ${updated} fixtures`,
      updated,
      total: fixtures.length,
      notFound
    });
    
  } catch (error: any) {
    console.error('❌ Error refreshing scores:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh scores'
    });
  }
});

/* ============================================================
   📌 FIXTURES LIST - CLEAN FLAT STRUCTURE WITH ODDS & SCORES & LOGOS
   Returns EXACT structure frontend expects with odds, predictions, and league logos
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

    // Convert to CLEAN FLAT structure with odds, scores, predictions, and league logos
    const cleanFixtures = fixtures.map((f: any) => ({
      id: f.fixtureId,
      fixtureId: f.fixtureId,
      date: formatDate(new Date(f.date)),
      time: formatTime(new Date(f.date)),
      leagueId: f.leagueId,
      league: f.league,
      leagueName: f.league,
      leagueLogo: getLeagueLogo(f.leagueId), // Add league logo
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeTeamName: f.homeTeam,
      awayTeamName: f.awayTeam,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status: f.status,
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
      score: f.score ? {
        home: f.score.home ?? null,
        away: f.score.away ?? null
      } : null,
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
   📌 FIXTURE BY ID - CLEAN FLAT STRUCTURE WITH LOGO
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

    // Return CLEAN FLAT structure with league logo
    const cleanFixture = {
      id: fixture.fixtureId,
      fixtureId: fixture.fixtureId,
      date: formatDate(new Date(fixture.date)),
      time: formatTime(new Date(fixture.date)),
      leagueId: fixture.leagueId,
      league: fixture.league,
      leagueName: fixture.league,
      leagueLogo: getLeagueLogo(fixture.leagueId), // Add league logo
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeTeamName: fixture.homeTeam,
      awayTeamName: fixture.awayTeam,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      status: fixture.status,
      country: fixture.country,
      season: fixture.season,
      homeScore: fixture.score?.home ?? null,
      awayScore: fixture.score?.away ?? null,
      score: fixture.score,
      odds: fixture.odds,
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
   📌 ANALYZE FIXTURE - AI Analysis
   ============================================================ */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const fixtureData: FixtureInput = req.body;
    
    if (!fixtureData || !fixtureData.homeTeam || !fixtureData.awayTeam) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fixture data'
      });
    }

    const analysis = await analyzeFixture(fixtureData);

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
   📌 ANALYZE BULK FIXTURES
   ============================================================ */
router.post('/analyze-bulk', async (req: Request, res: Response) => {
  try {
    const { fixtures } = req.body;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fixtures array'
      });
    }

    const analyses = await analyzeBulkFixtures(fixtures);

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });

  } catch (error: any) {
    console.error('❌ Error analyzing bulk fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


/* ============================================================
   📌 FIND GOLDEN BETS
   ============================================================ */
router.post('/golden-bets', async (req: Request, res: Response) => {
  try {
    const { fixtures, minConfidence = 80 } = req.body;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fixtures array'
      });
    }

    const goldenBets = await findGoldenBets(fixtures, minConfidence);

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
router.post('/value-bets', async (req: Request, res: Response) => {
  try {
    const { fixtures, minValue = 5 } = req.body;
    
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fixtures array'
      });
    }

    const valueBets = await findValueBets(fixtures, minValue);

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
/* ============================================================
   ⭐ NEW ROUTE: LIVE FIXTURE SNAPSHOT
   ============================================================ */
import { fetchLiveFixtureSnapshot, fetchOdds, fetchLeagueStandings } from "../services/apiFootballService";

router.get('/:id/live', async (req: Request, res: Response) => {
  try {
    const fixtureId = Number(req.params.id);
    const live = await fetchLiveFixtureSnapshot(fixtureId);

    if (!live) {
      return res.status(404).json({
        success: false,
        error: "Live data not available"
      });
    }

    res.json({ success: true, data: live });

  } catch (error: any) {
    console.error("❌ Live snapshot error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ============================================================
   ⭐ NEW ROUTE: ODDS
   ============================================================ */
router.get('/:id/odds', async (req: Request, res: Response) => {
  try {
    const fixtureId = Number(req.params.id);
    const odds = await fetchOdds(fixtureId);

    if (!odds) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: odds });

  } catch (error: any) {
    console.error("❌ Odds error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ============================================================
   ⭐ NEW ROUTE: EVENTS (refreshed from API)
   ============================================================ */
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const fixtureId = Number(req.params.id);

    const response = await apiClient.get("/fixtures", {
      params: { id: fixtureId }
    });

    const match = response.data.response?.[0];
    const events = match?.events || [];

    res.json({ success: true, data: events });

  } catch (error: any) {
    console.error("❌ Events error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ============================================================
   ⭐ NEW ROUTE: GOALSCORERS
   ============================================================ */
router.get('/:id/goalscorers', async (req: Request, res: Response) => {
  try {
    const fixtureId = Number(req.params.id);

    const response = await apiClient.get("/fixtures", {
      params: { id: fixtureId }
    });

    const match = response.data.response?.[0];
    const events = match?.events || [];

    const goals = events.filter((e: any) => e.type === "Goal");

    res.json({ success: true, data: goals });

  } catch (error: any) {
    console.error("❌ Goalscorers error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ============================================================
   ⭐ NEW ROUTE: IN-PLAY STATS (live stats only)
   ============================================================ */
router.get('/:id/inplay', async (req: Request, res: Response) => {
  try {
    const fixtureId = Number(req.params.id);

    const response = await apiClient.get("/fixtures/statistics", {
      params: { fixture: fixtureId }
    });

    const stats = response.data.response || [];

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error("❌ Inplay stats error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ============================================================
   ⭐ NEW ROUTE: LEAGUE TABLE
   ============================================================ */
router.get('/league/:leagueId/standings', async (req: Request, res: Response) => {
  try {
    const leagueId = Number(req.params.leagueId);
    const season = Number(req.query.season) || new Date().getFullYear();

    const standings = await fetchLeagueStandings(leagueId, season);

    res.json({ success: true, data: standings });

  } catch (error: any) {
    console.error("❌ League standings error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
