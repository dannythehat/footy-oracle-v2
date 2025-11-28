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

// Transform fixture from DB format (camelCase) to API format (snake_case)
// CLEAN VERSION - Only fixture data, no betting predictions
function transformFixture(fixture: any) {
  return {
    fixture_id: fixture.fixtureId?.toString() || fixture._id.toString(),
    home_team: fixture.homeTeam,
    away_team: fixture.awayTeam,
    kickoff: fixture.date,
    league: fixture.league,
    home_team_id: fixture.homeTeamId,
    away_team_id: fixture.awayTeamId,
    league_id: fixture.leagueId,
    season: fixture.season,
    country: fixture.country,
    status: fixture.status || 'scheduled',
    home_score: fixture.score?.home,
    away_score: fixture.score?.away,
  };
}

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
    
    // Transform fixtures to match frontend expectations
    const transformedFixtures = fixtures.map(transformFixture);
    
    res.json({
      success: true,
      data: transformedFixtures,
      count: transformedFixtures.length,
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
      data: transformFixture(fixture),
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
      data: leagues.sort(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get H2H data for a fixture
router.get('/:id/h2h', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, last } = req.query;
    
    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({
        success: false,
        error: 'homeTeamId and awayTeamId are required',
      });
    }
    
    const h2hData = await fetchH2H(
      Number(homeTeamId),
      Number(awayTeamId),
      Number(last) || 10
    );
    
    res.json({
      success: true,
      data: h2hData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get team statistics
router.get('/team/:teamId/stats', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { leagueId, season } = req.query;
    
    if (!leagueId || !season) {
      return res.status(400).json({
        success: false,
        error: 'leagueId and season are required',
      });
    }
    
    const stats = await fetchTeamStats(
      Number(teamId),
      Number(leagueId),
      Number(season)
    );
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get complete fixture statistics (H2H + both teams)
router.get('/:id/stats', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, leagueId, season } = req.query;
    
    if (!homeTeamId || !awayTeamId || !leagueId || !season) {
      return res.status(400).json({
        success: false,
        error: 'homeTeamId, awayTeamId, leagueId, and season are required',
      });
    }
    
    const stats = await fetchFixtureStats(
      Number(req.params.id),
      Number(homeTeamId),
      Number(awayTeamId),
      Number(leagueId),
      Number(season)
    );
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get team's last fixtures
router.get('/team/:teamId/last-fixtures', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { last } = req.query;
    
    const fixtures = await fetchTeamLastFixtures(
      Number(teamId),
      Number(last) || 5
    );
    
    res.json({
      success: true,
      data: fixtures,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Analyze a single fixture
router.post('/:id/analyze', async (req, res) => {
  try {
    const fixture = await Fixture.findOne({ fixtureId: Number(req.params.id) });
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found',
      });
    }
    
    const fixtureInput: FixtureInput = {
      id: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
      odds: {
        homeWin: fixture.odds?.homeWin || 0,
        draw: fixture.odds?.draw || 0,
        awayWin: fixture.odds?.awayWin || 0,
        btts: fixture.odds?.btts || 0,
        over25: fixture.odds?.over25 || 0,
        under25: fixture.odds?.under25 || 0,
      },
    };
    
    const analysis = await analyzeFixture(fixtureInput);
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Analyze multiple fixtures
router.post('/analyze-bulk', async (req, res) => {
  try {
    const { fixtureIds } = req.body;
    
    if (!Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'fixtureIds array is required',
      });
    }
    
    const fixtures = await Fixture.find({ 
      fixtureId: { $in: fixtureIds.map(Number) } 
    });
    
    const fixtureInputs: FixtureInput[] = fixtures.map(fixture => ({
      id: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
      odds: {
        homeWin: fixture.odds?.homeWin || 0,
        draw: fixture.odds?.draw || 0,
        awayWin: fixture.odds?.awayWin || 0,
        btts: fixture.odds?.btts || 0,
        over25: fixture.odds?.over25 || 0,
        under25: fixture.odds?.under25 || 0,
      },
    }));
    
    const analyses = await analyzeBulkFixtures(fixtureInputs);
    
    res.json({
      success: true,
      data: analyses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Find golden bets
router.get('/golden-bets/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow },
    });
    
    const fixtureInputs: FixtureInput[] = fixtures.map(fixture => ({
      id: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
      odds: {
        homeWin: fixture.odds?.homeWin || 0,
        draw: fixture.odds?.draw || 0,
        awayWin: fixture.odds?.awayWin || 0,
        btts: fixture.odds?.btts || 0,
        over25: fixture.odds?.over25 || 0,
        under25: fixture.odds?.under25 || 0,
      },
    }));
    
    const goldenBets = await findGoldenBets(fixtureInputs);
    
    res.json({
      success: true,
      data: goldenBets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Find value bets
router.get('/value-bets/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow },
    });
    
    const fixtureInputs: FixtureInput[] = fixtures.map(fixture => ({
      id: fixture.fixtureId,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date.toISOString(),
      odds: {
        homeWin: fixture.odds?.homeWin || 0,
        draw: fixture.odds?.draw || 0,
        awayWin: fixture.odds?.awayWin || 0,
        btts: fixture.odds?.btts || 0,
        over25: fixture.odds?.over25 || 0,
        under25: fixture.odds?.under25 || 0,
      },
    }));
    
    const valueBets = await findValueBets(fixtureInputs);
    
    res.json({
      success: true,
      data: valueBets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
