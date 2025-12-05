import axios from 'axios';
import { Fixture } from '../models/Fixture.js';

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
 * Fetch live fixtures from API-Football
 * Returns all currently live matches across all leagues
 */
export async function fetchLiveFixtures(): Promise<any[]> {
  try {
    console.log('🔴 Fetching live fixtures...');
    
    const response = await apiClient.get('/fixtures', {
      params: { live: 'all' }
    });

    const fixtures = response.data.response || [];
    console.log(`✅ Found ${fixtures.length} live fixtures`);
    
    return fixtures.map((f: any) => ({
      fixtureId: f.fixture.id,
      date: f.fixture.date,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeTeamId: f.teams.home.id,
      awayTeamId: f.teams.away.id,
      league: f.league.name,
      leagueId: f.league.id,
      country: f.league.country,
      season: f.league.season,
      status: mapStatus(f.fixture.status.short),
      statusShort: f.fixture.status.short,
      elapsed: f.fixture.status.elapsed,
      score: {
        home: f.goals.home ?? null,
        away: f.goals.away ?? null,
      },
      homeScore: f.goals.home ?? null,
      awayScore: f.goals.away ?? null,
    }));
  } catch (error: any) {
    console.error('❌ Error fetching live fixtures:', error.message);
    return [];
  }
}

/**
 * Fetch detailed statistics for a specific fixture
 * Returns comprehensive match statistics including shots, possession, cards, etc.
 */
export async function fetchFixtureStatistics(fixtureId: number): Promise<any> {
  try {
    console.log(`📊 Fetching statistics for fixture ${fixtureId}...`);
    
    const response = await apiClient.get('/fixtures/statistics', {
      params: { fixture: fixtureId }
    });

    const stats = response.data.response;
    
    if (!stats || stats.length < 2) {
      return null;
    }

    const homeStats = stats[0];
    const awayStats = stats[1];

    const getStat = (teamStats: any, key: string) => {
      const stat = teamStats?.statistics?.find((s: any) => s.type === key);
      return stat?.value;
    };

    return {
      home: {
        shotsOnGoal: getStat(homeStats, 'Shots on Goal') || 0,
        shotsOffGoal: getStat(homeStats, 'Shots off Goal') || 0,
        shotsInsideBox: getStat(homeStats, 'Shots insidebox') || 0,
        shotsOutsideBox: getStat(homeStats, 'Shots outsidebox') || 0,
        totalShots: getStat(homeStats, 'Total Shots') || 0,
        blockedShots: getStat(homeStats, 'Blocked Shots') || 0,
        fouls: getStat(homeStats, 'Fouls') || 0,
        cornerKicks: getStat(homeStats, 'Corner Kicks') || 0,
        offsides: getStat(homeStats, 'Offsides') || 0,
        ballPossession: getStat(homeStats, 'Ball Possession') || '0%',
        yellowCards: getStat(homeStats, 'Yellow Cards') || 0,
        redCards: getStat(homeStats, 'Red Cards') || 0,
        goalkeeperSaves: getStat(homeStats, 'Goalkeeper Saves') || 0,
        totalPasses: getStat(homeStats, 'Total passes') || 0,
        passesAccurate: getStat(homeStats, 'Passes accurate') || 0,
        passesPercentage: getStat(homeStats, 'Passes %') || '0%',
      },
      away: {
        shotsOnGoal: getStat(awayStats, 'Shots on Goal') || 0,
        shotsOffGoal: getStat(awayStats, 'Shots off Goal') || 0,
        shotsInsideBox: getStat(awayStats, 'Shots insidebox') || 0,
        shotsOutsideBox: getStat(awayStats, 'Shots outsidebox') || 0,
        totalShots: getStat(awayStats, 'Total Shots') || 0,
        blockedShots: getStat(awayStats, 'Blocked Shots') || 0,
        fouls: getStat(awayStats, 'Fouls') || 0,
        cornerKicks: getStat(awayStats, 'Corner Kicks') || 0,
        offsides: getStat(awayStats, 'Offsides') || 0,
        ballPossession: getStat(awayStats, 'Ball Possession') || '0%',
        yellowCards: getStat(awayStats, 'Yellow Cards') || 0,
        redCards: getStat(awayStats, 'Red Cards') || 0,
        goalkeeperSaves: getStat(awayStats, 'Goalkeeper Saves') || 0,
        totalPasses: getStat(awayStats, 'Total passes') || 0,
        passesAccurate: getStat(awayStats, 'Passes accurate') || 0,
        passesPercentage: getStat(awayStats, 'Passes %') || '0%',
      },
    };
  } catch (error: any) {
    console.error(`❌ Error fetching statistics for fixture ${fixtureId}:`, error.message);
    return null;
  }
}

/**
 * Update live scores in database
 * Fetches all live fixtures and updates their scores and statistics
 */
export async function updateLiveScores(): Promise<{ updated: number; total: number }> {
  try {
    console.log('🔄 Starting live scores update...');
    
    // Fetch all currently live fixtures from API
    const liveFixtures = await fetchLiveFixtures();
    
    if (liveFixtures.length === 0) {
      console.log('ℹ️  No live fixtures to update');
      return { updated: 0, total: 0 };
    }

    let updated = 0;

    // Update each live fixture in database
    for (const fixture of liveFixtures) {
      try {
        // Fetch detailed statistics
        const statistics = await fetchFixtureStatistics(fixture.fixtureId);
        
        // Update fixture in database with BOTH score formats
        await Fixture.updateOne(
          { fixtureId: fixture.fixtureId },
          {
            $set: {
              status: fixture.status,
              statusShort: fixture.statusShort,
              'score.home': fixture.score.home,
              'score.away': fixture.score.away,
              homeScore: fixture.homeScore,  // Top-level field for frontend
              awayScore: fixture.awayScore,  // Top-level field for frontend
              elapsed: fixture.elapsed,
              statistics: statistics || undefined,
              lastUpdated: new Date(),
            }
          },
          { upsert: true }
        );

        updated++;
        console.log(`✅ Updated ${fixture.homeTeam} vs ${fixture.awayTeam} (${fixture.homeScore}-${fixture.awayScore})`);
        
        // Rate limiting - wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`❌ Error updating fixture ${fixture.fixtureId}:`, error.message);
      }
    }

    console.log(`✅ Live scores update complete: ${updated}/${liveFixtures.length} fixtures updated`);
    return { updated, total: liveFixtures.length };
  } catch (error: any) {
    console.error('❌ Error in updateLiveScores:', error.message);
    return { updated: 0, total: 0 };
  }
}

/**
 * Update scores for recently finished fixtures (last 6 hours)
 * Ensures final scores are captured for matches that just ended
 * CRITICAL: Checks ALL fixtures, not just ones marked 'live'
 */
export async function updateRecentlyFinishedFixtures(): Promise<{ updated: number; total: number }> {
  try {
    console.log('🏁 Updating recently finished fixtures...');
    
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    // CRITICAL FIX: Find ALL fixtures from last 6 hours, regardless of status
    // This catches games stuck in 'live' status from yesterday
    const recentFixtures = await Fixture.find({
      date: { $gte: sixHoursAgo }
    }).lean();

    if (recentFixtures.length === 0) {
      console.log('ℹ️  No recently finished fixtures to update');
      return { updated: 0, total: 0 };
    }

    console.log(`🔍 Checking ${recentFixtures.length} fixtures from last 6 hours...`);
    let updated = 0;

    for (const fixture of recentFixtures) {
      try {
        const response = await apiClient.get('/fixtures', {
          params: { id: fixture.fixtureId }
        });

        const apiFixture = response.data.response?.[0];
        
        if (apiFixture) {
          const newStatus = mapStatus(apiFixture.fixture.status.short);
          const homeScore = apiFixture.goals.home ?? null;
          const awayScore = apiFixture.goals.away ?? null;
          
          // Only update if status or scores changed
          if (
            fixture.status !== newStatus ||
            fixture.homeScore !== homeScore ||
            fixture.awayScore !== awayScore
          ) {
            await Fixture.updateOne(
              { fixtureId: fixture.fixtureId },
              {
                $set: {
                  status: newStatus,
                  statusShort: apiFixture.fixture.status.short,
                  'score.home': homeScore,
                  'score.away': awayScore,
                  homeScore: homeScore,  // Top-level field for frontend
                  awayScore: awayScore,  // Top-level field for frontend
                  lastUpdated: new Date(),
                }
              }
            );

            updated++;
            console.log(`✅ Updated ${fixture.homeTeam} vs ${fixture.awayTeam} - Status: ${fixture.status} → ${newStatus}`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`❌ Error updating fixture ${fixture.fixtureId}:`, error.message);
      }
    }

    console.log(`✅ Recently finished fixtures update complete: ${updated}/${recentFixtures.length} updated`);
    return { updated, total: recentFixtures.length };
  } catch (error: any) {
    console.error('❌ Error in updateRecentlyFinishedFixtures:', error.message);
    return { updated: 0, total: 0 };
  }
}
