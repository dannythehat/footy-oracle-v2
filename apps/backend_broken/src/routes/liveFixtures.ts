import { Router, Request, Response } from 'express';
import { Fixture } from '../models/Fixture.js';
import { fetchLiveFixtures, fetchFixtureStatistics, updateLiveScores } from '../services/liveScoresService.js';
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
   🔴 GET LIVE FIXTURES - Real-time scores and statistics
   Returns all currently live fixtures with scores and stats
   ============================================================ */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🔴 Fetching live fixtures from database...');
    
    // Get live fixtures from database (updated by cron job every minute)
    const liveFixtures = await Fixture.find({ status: 'live' })
      .sort({ date: 1 })
      .lean();

    if (liveFixtures.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No live fixtures at the moment'
      });
    }

    // Format fixtures with all data
    const formattedFixtures = liveFixtures.map((f: any) => ({
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
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      status: f.status,
      statusShort: f.statusShort,
      elapsed: f.elapsed,
      homeScore: f.score?.home ?? null,
      awayScore: f.score?.away ?? null,
      score: {
        home: f.score?.home ?? null,
        away: f.score?.away ?? null
      },
      statistics: f.statistics || null,
      lastUpdated: f.lastUpdated,
      season: f.season,
      country: f.country,
    }));

    res.json({
      success: true,
      data: formattedFixtures,
      count: formattedFixtures.length,
      lastUpdated: new Date()
    });

  } catch (error: any) {
    console.error('❌ Error fetching live fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live fixtures'
    });
  }
});

/* ============================================================
   🔴 GET LIVE FIXTURE STATISTICS - Detailed stats for a fixture
   Returns comprehensive statistics for a specific live fixture
   ============================================================ */
router.get('/:fixtureId/statistics', async (req: Request, res: Response) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId);
    
    if (isNaN(fixtureId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fixture ID'
      });
    }

    console.log(`📊 Fetching statistics for fixture ${fixtureId}...`);

    // Check if fixture exists in database
    const fixture = await Fixture.findOne({ fixtureId }).lean();
    
    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: 'Fixture not found'
      });
    }

    // If statistics are already in database and recent (< 2 minutes old), return them
    if (fixture.statistics && fixture.lastUpdated) {
      const lastUpdate = new Date(fixture.lastUpdated);
      const now = new Date();
      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;
      
      if (minutesSinceUpdate < 2) {
        return res.json({
          success: true,
          data: {
            fixtureId: fixture.fixtureId,
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            status: fixture.status,
            elapsed: fixture.elapsed,
            score: fixture.score,
            statistics: fixture.statistics,
            lastUpdated: fixture.lastUpdated
          }
        });
      }
    }

    // Fetch fresh statistics from API
    const statistics = await fetchFixtureStatistics(fixtureId);
    
    if (!statistics) {
      return res.status(404).json({
        success: false,
        error: 'Statistics not available for this fixture'
      });
    }

    // Update database with new statistics
    await Fixture.updateOne(
      { fixtureId },
      {
        $set: {
          statistics,
          lastUpdated: new Date()
        }
      }
    );

    res.json({
      success: true,
      data: {
        fixtureId: fixture.fixtureId,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        status: fixture.status,
        elapsed: fixture.elapsed,
        score: fixture.score,
        statistics,
        lastUpdated: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching fixture statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch fixture statistics'
    });
  }
});

/* ============================================================
   🔄 FORCE UPDATE LIVE SCORES - Manual trigger for live scores update
   Manually triggers the live scores update process
   ============================================================ */
router.post('/update', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Manually triggering live scores update...');
    
    const result = await updateLiveScores();
    
    res.json({
      success: true,
      message: `Updated ${result.updated} live fixtures`,
      updated: result.updated,
      total: result.total,
      timestamp: new Date()
    });

  } catch (error: any) {
    console.error('❌ Error updating live scores:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update live scores'
    });
  }
});

export default router;
