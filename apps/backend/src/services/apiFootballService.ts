import axios from 'axios';

const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.warn('⚠️  API_FOOTBALL_KEY not set - API calls will fail');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  },
  timeout: 10000 // 10 second timeout
});

// Top 30 leagues to filter
const TOP_LEAGUES = [
  39, 140, 78, 135, 61, // Premier League, La Liga, Bundesliga, Serie A, Ligue 1
  2, 3, 94, 88, 203, // Champions League, Europa League, Primeira Liga, Eredivisie, Super Lig
  144, 71, 179, 235, 253, // Belgian Pro League, Brazilian Serie A, Scottish Premiership, Russian Premier League, MLS
  1, 4, 5, 6, 7, // World Cup, Euro Championship, Copa America, Asian Cup, African Cup
  128, 169, 218, 119, 307, // Argentine Primera, Championship, La Liga 2, Danish Superliga, Saudi Pro League
  113, 188, 197, 345, 283 // Allsvenskan, Austrian Bundesliga, Greek Super League, Indian Super League, UAE Pro League
];

export interface FixtureData {
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  league: string;
  leagueId: number;
  country: string;
  season: number;
  odds?: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    btts?: number;
    over25?: number;
    under25?: number;
    over95corners?: number;
    over35cards?: number;
  };
  status: string;
}

export interface H2HData {
  played: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  lastMeetings: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    league: string;
  }>;
}

export interface TeamStats {
  form: string; // Last 5 results: W, D, L
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  failedToScore: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bttsPercentage: number;
  over25Percentage: number;
}

export interface FixtureStats {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  h2h: H2HData;
}

/**
 * Fetch fixtures for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Array of fixtures with basic info (no odds yet)
 */
export async function fetchFixtures(date: string): Promise<FixtureData[]> {
  try {
    console.log(`📥 Fetching fixtures for ${date}...`);
    
    const response = await apiClient.get('/fixtures', {
      params: { date }
    });

    if (!response.data.response || response.data.response.length === 0) {
      console.log(`ℹ️  No fixtures found for ${date}`);
      return [];
    }

    const fixtures = response.data.response
      .filter((f: any) => TOP_LEAGUES.includes(f.league.id))
      .map((f: any) => ({
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
        status: f.fixture.status.short,
      }));

    console.log(`✅ Found ${fixtures.length} fixtures in top 30 leagues`);
    return fixtures;
  } catch (error: any) {
    console.error('❌ Error fetching fixtures:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch odds for a specific fixture (4 markets)
 * Markets: Match Winner, BTTS, Over/Under 2.5, Corners, Cards
 * @param fixtureId - Fixture ID
 * @returns Odds object with all 4 markets
 */
export async function fetchOdds(fixtureId: number): Promise<any> {
  try {
    console.log(`📊 Fetching odds for fixture ${fixtureId}...`);
    
    const response = await apiClient.get('/odds', {
      params: { 
        fixture: fixtureId,
        bookmaker: 8 // Bet365 (most reliable)
      }
    });

    if (!response.data.response || response.data.response.length === 0) {
      console.log(`⚠️  No odds found for fixture ${fixtureId}`);
      return null;
    }

    const oddsData = response.data.response[0]?.bookmakers[0]?.bets;
    if (!oddsData) {
      console.log(`⚠️  No bookmaker data for fixture ${fixtureId}`);
      return null;
    }

    // Extract Match Winner odds
    const matchWinner = oddsData.find((b: any) => b.id === 1); // Match Winner
    const homeWin = matchWinner?.values.find((v: any) => v.value === 'Home')?.odd;
    const draw = matchWinner?.values.find((v: any) => v.value === 'Draw')?.odd;
    const awayWin = matchWinner?.values.find((v: any) => v.value === 'Away')?.odd;

    // Extract BTTS odds
    const btts = oddsData.find((b: any) => b.id === 8); // Both Teams Score
    const bttsYes = btts?.values.find((v: any) => v.value === 'Yes')?.odd;

    // Extract Over/Under 2.5 Goals odds
    const goals = oddsData.find((b: any) => b.id === 5); // Goals Over/Under
    const over25 = goals?.values.find((v: any) => v.value === 'Over 2.5')?.odd;
    const under25 = goals?.values.find((v: any) => v.value === 'Under 2.5')?.odd;

    // Extract Corners odds (Over 9.5)
    const corners = oddsData.find((b: any) => b.id === 12); // Corners Over/Under
    const over95corners = corners?.values.find((v: any) => v.value === 'Over 9.5')?.odd;

    // Extract Cards odds (Over 3.5)
    const cards = oddsData.find((b: any) => b.id === 11); // Cards Over/Under
    const over35cards = cards?.values.find((v: any) => v.value === 'Over 3.5')?.odd;

    const odds = {
      homeWin,
      draw,
      awayWin,
      btts: bttsYes,
      over25,
      under25,
      over95corners,
      over35cards,
    };

    console.log(`✅ Odds fetched for fixture ${fixtureId}`);
    return odds;
  } catch (error: any) {
    console.error(`❌ Error fetching odds for fixture ${fixtureId}:`, error.message);
    return null;
  }
}

/**
 * Fetch odds for a specific fixture (raw response)
 * This is the function that fixturesCron.ts imports
 * @param fixtureId - Fixture ID
 * @returns Raw odds response from API
 */
export async function fetchOddsForFixture(fixtureId: number): Promise<any> {
  try {
    console.log(`📊 Fetching raw odds for fixture ${fixtureId}...`);
    
    const response = await apiClient.get('/odds', {
      params: { 
        fixture: fixtureId
      }
    });

    if (!response.data.response || response.data.response.length === 0) {
      console.log(`⚠️  No odds found for fixture ${fixtureId}`);
      return null;
    }

    console.log(`✅ Raw odds fetched for fixture ${fixtureId}`);
    return response.data.response;
  } catch (error: any) {
    console.error(`❌ Error fetching raw odds for fixture ${fixtureId}:`, error.message);
    return null;
  }
}

/**
 * Fetch fixtures with odds for a specific date
 * This combines fetchFixtures and fetchOdds
 * @param date - Date in YYYY-MM-DD format
 * @returns Array of fixtures with odds
 */
export async function fetchFixturesWithOdds(date: string): Promise<FixtureData[]> {
  try {
    // Step 1: Fetch all fixtures
    const fixtures = await fetchFixtures(date);
    
    if (fixtures.length === 0) {
      return [];
    }

    console.log(`📊 Fetching odds for ${fixtures.length} fixtures...`);

    // Step 2: Fetch odds for each fixture (with rate limiting)
    const fixturesWithOdds = [];
    
    for (let i = 0; i < fixtures.length; i++) {
      const fixture = fixtures[i];
      
      // Fetch odds
      const odds = await fetchOdds(fixture.fixtureId);
      
      fixturesWithOdds.push({
        ...fixture,
        odds: odds || undefined
      });

      // Rate limiting: Wait 100ms between requests (max 10 req/sec)
      if (i < fixtures.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const fixturesWithValidOdds = fixturesWithOdds.filter(f => f.odds);
    console.log(`✅ Successfully fetched odds for ${fixturesWithValidOdds.length}/${fixtures.length} fixtures`);

    return fixturesWithOdds;
  } catch (error: any) {
    console.error('❌ Error fetching fixtures with odds:', error.message);
    throw error;
  }
}

/**
 * Fetch fixture result (score and status)
 * @param fixtureId - Fixture ID
 * @returns Result object with status and scores
 */
export async function fetchFixtureResult(fixtureId: number): Promise<any> {
  try {
    const response = await apiClient.get('/fixtures', {
      params: { id: fixtureId }
    });

    const fixture = response.data.response[0];
    if (!fixture) {
      return null;
    }

    return {
      status: fixture.fixture.status.short,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
    };
  } catch (error: any) {
    console.error(`❌ Error fetching result for fixture ${fixtureId}:`, error.message);
    return null;
  }
}

/**
 * Fetch Head-to-Head data between two teams
 * @param homeTeamId - Home team ID
 * @param awayTeamId - Away team ID
 * @param last - Number of last meetings to fetch
 * @returns H2H data
 */
export async function fetchH2H(homeTeamId: number, awayTeamId: number, last: number = 10): Promise<H2HData> {
  try {
    const response = await apiClient.get('/fixtures/headtohead', {
      params: {
        h2h: `${homeTeamId}-${awayTeamId}`,
        last
      }
    });

    const matches = response.data.response;
    
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;

    const lastMeetings = matches.slice(0, 5).map((match: any) => {
      const isHomeTeamHome = match.teams.home.id === homeTeamId;
      const homeScore = match.goals.home;
      const awayScore = match.goals.away;

      if (homeScore > awayScore) {
        isHomeTeamHome ? homeWins++ : awayWins++;
      } else if (awayScore > homeScore) {
        isHomeTeamHome ? awayWins++ : homeWins++;
      } else {
        draws++;
      }

      return {
        date: match.fixture.date,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        homeScore,
        awayScore,
        league: match.league.name
      };
    });

    return {
      played: matches.length,
      homeWins,
      awayWins,
      draws,
      lastMeetings
    };
  } catch (error: any) {
    console.error('❌ Error fetching H2H data:', error.message);
    throw error;
  }
}

/**
 * Fetch team statistics for a season
 * @param teamId - Team ID
 * @param leagueId - League ID
 * @param season - Season year
 * @returns Team statistics
 */
export async function fetchTeamStats(teamId: number, leagueId: number, season: number): Promise<TeamStats> {
  try {
    const response = await apiClient.get('/teams/statistics', {
      params: {
        team: teamId,
        league: leagueId,
        season
      }
    });

    const stats = response.data.response;
    const fixtures = stats.fixtures;
    const goals = stats.goals.for;
    const goalsAgainst = stats.goals.against;

    return {
      form: stats.form || 'N/A',
      goalsFor: goals.total.total || 0,
      goalsAgainst: goalsAgainst.total.total || 0,
      cleanSheets: stats.clean_sheet.total || 0,
      failedToScore: stats.failed_to_score.total || 0,
      avgGoalsScored: parseFloat((goals.total.total / fixtures.played.total).toFixed(2)) || 0,
      avgGoalsConceded: parseFloat((goalsAgainst.total.total / fixtures.played.total).toFixed(2)) || 0,
      bttsPercentage: parseFloat(((fixtures.played.total - stats.clean_sheet.total - stats.failed_to_score.total) / fixtures.played.total * 100).toFixed(1)) || 0,
      over25Percentage: parseFloat((stats.goals.for.total.total > 2.5 ? 100 : 0).toFixed(1)) || 0
    };
  } catch (error: any) {
    console.error(`❌ Error fetching team stats for team ${teamId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch complete fixture statistics (H2H + both teams stats)
 * @param fixtureId - Fixture ID
 * @param homeTeamId - Home team ID
 * @param awayTeamId - Away team ID
 * @param leagueId - League ID
 * @param season - Season year
 * @returns Complete fixture statistics
 */
export async function fetchFixtureStats(
  fixtureId: number,
  homeTeamId: number,
  awayTeamId: number,
  leagueId: number,
  season: number
): Promise<FixtureStats> {
  try {
    const [h2h, homeStats, awayStats] = await Promise.all([
      fetchH2H(homeTeamId, awayTeamId),
      fetchTeamStats(homeTeamId, leagueId, season),
      fetchTeamStats(awayTeamId, leagueId, season)
    ]);

    return {
      homeTeam: homeStats,
      awayTeam: awayStats,
      h2h
    };
  } catch (error: any) {
    console.error(`❌ Error fetching fixture stats for fixture ${fixtureId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch team's last N fixtures
 * @param teamId - Team ID
 * @param last - Number of last fixtures to fetch
 * @returns Array of last fixtures
 */
export async function fetchTeamLastFixtures(teamId: number, last: number = 5): Promise<any[]> {
  try {
    const response = await apiClient.get('/fixtures', {
      params: {
        team: teamId,
        last
      }
    });

    return response.data.response.map((match: any) => ({
      date: match.fixture.date,
      homeTeam: match.teams.home.name,
      awayTeam: match.teams.away.name,
      homeScore: match.goals.home,
      awayScore: match.goals.away,
      league: match.league.name,
      result: match.teams.home.id === teamId 
        ? (match.goals.home > match.goals.away ? 'W' : match.goals.home < match.goals.away ? 'L' : 'D')
        : (match.goals.away > match.goals.home ? 'W' : match.goals.away < match.goals.home ? 'L' : 'D')
    }));
  } catch (error: any) {
    console.error(`❌ Error fetching last fixtures for team ${teamId}:`, error.message);
    throw error;
  }
}

/**
 * Test API connection
 * @returns True if API is accessible
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔌 Testing API-Football connection...');
    const response = await apiClient.get('/status');
    console.log('✅ API-Football connection successful');
    console.log('📊 API Status:', response.data.response);
    return true;
  } catch (error: any) {
    console.error('❌ API-Football connection failed:', error.message);
    return false;
  }
}
