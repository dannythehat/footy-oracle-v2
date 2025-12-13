import { Router, Request, Response } from 'express';
import { Fixture } from '../models/Fixture.js';
import { getLeagueLogo } from '../config/leagues.js';

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
   📅 GET FIXTURES BY DATE
   Returns all fixtures for a specific date
   Query params:
   - date: YYYY-MM-DD (required)
   - tzOffset: timezone offset in minutes (optional, default: 0)
   ============================================================ */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { date, tzOffset } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }

    console.log(`📅 Fetching fixtures for date: ${date}`);

    // Parse the date and create start/end of day
    const targetDate = new Date(date);
    
    // Apply timezone offset if provided
    const offset = tzOffset ? parseInt(tzOffset as string) : 0;
    targetDate.setMinutes(targetDate.getMinutes() - offset);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query fixtures for the date range
    const fixtures = await Fixture.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .sort({ date: 1 })
      .lean();

    if (fixtures.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: `No fixtures found for ${date}`
      });
    }

    // Format fixtures with all required data
    const formattedFixtures = fixtures.map((f: any) => ({
      id: f.fixtureId,
      fixtureId: f.fixtureId,
      date: formatDate(new Date(f.date)),
      time: formatTime(new Date(f.date)),
      leagueId: f.leagueId,
      league: f.league,
      leagueName: f.league,
      leagueLogo: getLeagueLogo(f.leagueId),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeTeamName: f.homeTeam,
      awayTeamName: f.awayTeam,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status: f.status || 'NS',
      statusShort: f.statusShort || 'NS',
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
      score: {
        home: f.score?.home ?? null,
        away: f.score?.away ?? null
      },
      odds: f.odds || null,
      season: f.season || new Date().getFullYear(),
      country: f.country || null,
    }));

    res.json({
      success: true,
      data: formattedFixtures,
      count: formattedFixtures.length,
      date: date
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
   📅 GET TODAY'S FIXTURES
   Convenience endpoint for today's fixtures
   ============================================================ */
router.get('/today', async (req: Request, res: Response) => {
  try {
    const { tzOffset } = req.query;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = formatDate(today);

    console.log(`📅 Fetching today's fixtures: ${dateStr}`);

    // Apply timezone offset if provided
    const offset = tzOffset ? parseInt(tzOffset as string) : 0;
    today.setMinutes(today.getMinutes() - offset);

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Query fixtures for today
    const fixtures = await Fixture.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .sort({ date: 1 })
      .lean();

    if (fixtures.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No fixtures found for today'
      });
    }

    // Format fixtures
    const formattedFixtures = fixtures.map((f: any) => ({
      id: f.fixtureId,
      fixtureId: f.fixtureId,
      date: formatDate(new Date(f.date)),
      time: formatTime(new Date(f.date)),
      leagueId: f.leagueId,
      league: f.league,
      leagueName: f.league,
      leagueLogo: getLeagueLogo(f.leagueId),
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      homeTeamName: f.homeTeam,
      awayTeamName: f.awayTeam,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status: f.status || 'NS',
      statusShort: f.statusShort || 'NS',
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
      score: {
        home: f.score?.home ?? null,
        away: f.score?.away ?? null
      },
      odds: f.odds || null,
      season: f.season || new Date().getFullYear(),
      country: f.country || null,
    }));

    res.json({
      success: true,
      data: formattedFixtures,
      count: formattedFixtures.length,
      date: dateStr
    });

  } catch (error: any) {
    console.error('❌ Error fetching today\'s fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch today\'s fixtures'
    });
  }
});

export default router;
