import axios from 'axios';

const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.warn('⚠️ API_FOOTBALL_KEY not set!');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-apisports-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io',
  },
  timeout: 15000,
});

/**
 * Complete fixture data interface
 */
export interface CompleteFixtureData {
  fixture: any;
  statistics: any;
  events: any[];
  h2h: {
    matches: any[];
    stats: {
      totalMatches: number;
      homeWins: number;
      awayWins: number;
      draws: number;
      bttsCount: number;
      over25Count: number;
    };
  };
  standings: any;
  homeUpcoming: any[];
  awayUpcoming: any[];
}

/**
 * Fetch complete match data for a fixture from MongoDB
 * This is the MAIN function you should use
 */
export async function getCompleteFixtureData(fixtureDoc: any): Promise<CompleteFixtureData> {
  const fixtureId = fixtureDoc.fixtureId;
  const leagueId = fixtureDoc.leagueId;
  const season = fixtureDoc.season;
  const homeId = fixtureDoc.homeTeamId;
  const awayId = fixtureDoc.awayTeamId;

  console.log(`📊 Fetching complete data for fixture ${fixtureId}`);
  console.log(`   Teams: ${homeId} vs ${awayId}`);
  console.log(`   League: ${leagueId}, Season: ${season}`);

  try {
    const [
      fixture,
      statistics,
      events,
      h2h,
      standings,
      homeUpcoming,
      awayUpcoming
    ] = await Promise.allSettled([
      fetchFixtureById(fixtureId),
      fetchFixtureStatistics(fixtureId),
      fetchFixtureEvents(fixtureId),
      fetchH2H(homeId, awayId),
      fetchStandings(leagueId, season),
      fetchTeamUpcoming(homeId),
      fetchTeamUpcoming(awayId)
    ]);

    return {
      fixture: fixture.status === 'fulfilled' ? fixture.value : null,
      statistics: statistics.status === 'fulfilled' ? statistics.value : null,
      events: events.status === 'fulfilled' ? events.value : [],
      h2h: h2h.status === 'fulfilled' ? h2h.value : { matches: [], stats: { totalMatches: 0, homeWins: 0, awayWins: 0, draws: 0, bttsCount: 0, over25Count: 0 } },
      standings: standings.status === 'fulfilled' ? standings.value : null,
      homeUpcoming: homeUpcoming.status === 'fulfilled' ? homeUpcoming.value : [],
      awayUpcoming: awayUpcoming.status === 'fulfilled' ? awayUpcoming.value : []
    };
  } catch (error: any) {
    console.error('❌ Error fetching complete fixture data:', error.message);
    throw error;
  }
}

/**
 * Fetch fixture by ID
 */
export async function fetchFixtureById(fixtureId: number): Promise<any> {
  try {
    console.log(`🎯 Fetching fixture ${fixtureId}`);
    
    const response = await apiClient.get('/fixtures', {
      params: { id: fixtureId }
    });

    const fixture = response.data.response?.[0];
    
    if (!fixture) {
      throw new Error('Fixture not found');
    }

    return fixture;
  } catch (error: any) {
    console.error(`❌ Error fetching fixture ${fixtureId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch fixture statistics (shots, possession, corners, etc.)
 * CRITICAL: Use parameter 'fixture' not 'fixture_id'
 */
export async function fetchFixtureStatistics(fixtureId: number): Promise<any> {
  try {
    console.log(`📊 Fetching statistics for fixture ${fixtureId}`);
    
    const response = await apiClient.get('/fixtures/statistics', {
      params: { fixture: fixtureId }  // ✅ CORRECT: 'fixture' parameter
    });

    const stats = response.data.response;
    
    if (!stats || stats.length < 2) {
      console.log(`ℹ️  No statistics available for fixture ${fixtureId}`);
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
        totalShots: getStat(homeStats, 'Total Shots') || 0,
        possession: getStat(homeStats, 'Ball Possession') || '0%',
        corners: getStat(homeStats, 'Corner Kicks') || 0,
        fouls: getStat(homeStats, 'Fouls') || 0,
        yellowCards: getStat(homeStats, 'Yellow Cards') || 0,
        redCards: getStat(homeStats, 'Red Cards') || 0,
      },
      away: {
        shotsOnGoal: getStat(awayStats, 'Shots on Goal') || 0,
        shotsOffGoal: getStat(awayStats, 'Shots off Goal') || 0,
        totalShots: getStat(awayStats, 'Total Shots') || 0,
        possession: getStat(awayStats, 'Ball Possession') || '0%',
        corners: getStat(awayStats, 'Corner Kicks') || 0,
        fouls: getStat(awayStats, 'Fouls') || 0,
        yellowCards: getStat(awayStats, 'Yellow Cards') || 0,
        redCards: getStat(awayStats, 'Red Cards') || 0,
      },
    };
  } catch (error: any) {
    console.error(`❌ Error fetching statistics for fixture ${fixtureId}:`, error.message);
    return null;
  }
}

/**
 * Fetch fixture events (goals, cards, substitutions)
 * CRITICAL: Use parameter 'fixture' not 'fixture_id'
 */
export async function fetchFixtureEvents(fixtureId: number): Promise<any[]> {
  try {
    console.log(`⚽ Fetching events for fixture ${fixtureId}`);
    
    const response = await apiClient.get('/fixtures/events', {
      params: { fixture: fixtureId }  // ✅ CORRECT: 'fixture' parameter
    });

    const events = response.data.response || [];
    
    console.log(`✅ Found ${events.length} events for fixture ${fixtureId}`);
    
    return events;
  } catch (error: any) {
    console.error(`❌ Error fetching events for fixture ${fixtureId}:`, error.message);
    return [];
  }
}

/**
 * Fetch head-to-head matches
 * CRITICAL: Use parameter 'h2h' with format 'homeId-awayId'
 */
export async function fetchH2H(homeTeamId: number, awayTeamId: number, last: number = 10) {
  try {
    console.log(`🔄 Fetching H2H: ${homeTeamId} vs ${awayTeamId}`);

    const response = await apiClient.get('/fixtures/headtohead', {
      params: {
        h2h: `${homeTeamId}-${awayTeamId}`,  // ✅ CORRECT: 'h2h' parameter with dash format
        last: last,
      },
    });

    const matches = response.data.response || [];

    if (matches.length === 0) {
      return {
        matches: [],
        stats: {
          totalMatches: 0,
          homeWins: 0,
          awayWins: 0,
          draws: 0,
          bttsCount: 0,
          over25Count: 0,
        },
      };
    }

    // Transform matches
    const transformedMatches = matches.map((m: any) => ({
      date: m.fixture.date,
      homeTeam: m.teams.home.name,
      awayTeam: m.teams.away.name,
      score: {
        home: m.goals.home ?? 0,
        away: m.goals.away ?? 0,
      },
      league: m.league.name,
    }));

    // Calculate stats
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let bttsCount = 0;
    let over25Count = 0;

    transformedMatches.forEach((match: any) => {
      const homeScore = match.score.home;
      const awayScore = match.score.away;

      if (homeScore > awayScore) homeWins++;
      else if (awayScore > homeScore) awayWins++;
      else draws++;

      if (homeScore > 0 && awayScore > 0) bttsCount++;
      if (homeScore + awayScore > 2.5) over25Count++;
    });

    console.log(`✅ Found ${transformedMatches.length} H2H matches`);

    return {
      matches: transformedMatches,
      stats: {
        totalMatches: transformedMatches.length,
        homeWins,
        awayWins,
        draws,
        bttsCount,
        over25Count,
      },
    };
  } catch (error: any) {
    console.error('❌ Error fetching H2H:', error.message);
    return {
      matches: [],
      stats: {
        totalMatches: 0,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        bttsCount: 0,
        over25Count: 0,
      },
    };
  }
}

/**
 * Fetch league standings
 * CRITICAL: Use parameters 'league' and 'season'
 */
export async function fetchStandings(leagueId: number, season: number): Promise<any> {
  try {
    console.log(`🏆 Fetching standings for league ${leagueId}, season ${season}`);

    const response = await apiClient.get('/standings', {
      params: {
        league: leagueId,  // ✅ CORRECT: 'league' parameter
        season: season     // ✅ CORRECT: 'season' parameter
      },
    });

    const standings = response.data.response?.[0];
    
    if (!standings) {
      console.log(`ℹ️  No standings available for league ${leagueId}`);
      return null;
    }

    console.log(`✅ Found standings for league ${leagueId}`);
    
    return standings;
  } catch (error: any) {
    console.error(`❌ Error fetching standings for league ${leagueId}:`, error.message);
    return null;
  }
}

/**
 * Fetch team's upcoming fixtures
 * CRITICAL: Use parameters 'team' and 'next'
 */
export async function fetchTeamUpcoming(teamId: number, next: number = 5): Promise<any[]> {
  try {
    console.log(`📅 Fetching next ${next} fixtures for team ${teamId}`);

    const response = await apiClient.get('/fixtures', {
      params: {
        team: teamId,  // ✅ CORRECT: 'team' parameter
        next: next     // ✅ CORRECT: 'next' parameter
      },
    });

    const fixtures = response.data.response || [];
    
    console.log(`✅ Found ${fixtures.length} upcoming fixtures for team ${teamId}`);
    
    return fixtures.map((f: any) => ({
      fixtureId: f.fixture.id,
      date: f.fixture.date,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      league: f.league.name,
    }));
  } catch (error: any) {
    console.error(`❌ Error fetching upcoming fixtures for team ${teamId}:`, error.message);
    return [];
  }
}

/**
 * Fetch all live fixtures
 * CRITICAL: Use parameter 'live=all'
 */
export async function fetchLiveFixtures(): Promise<any[]> {
  try {
    console.log('🔴 Fetching all live fixtures');

    const response = await apiClient.get('/fixtures', {
      params: { live: 'all' }  // ✅ CORRECT: 'live=all' parameter
    });

    const fixtures = response.data.response || [];
    
    console.log(`✅ Found ${fixtures.length} live fixtures`);
    
    return fixtures;
  } catch (error: any) {
    console.error('❌ Error fetching live fixtures:', error.message);
    return [];
  }
}

export default {
  getCompleteFixtureData,
  fetchFixtureById,
  fetchFixtureStatistics,
  fetchFixtureEvents,
  fetchH2H,
  fetchStandings,
  fetchTeamUpcoming,
  fetchLiveFixtures
};
