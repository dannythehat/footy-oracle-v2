import axios from 'axios';

const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  }
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
  league: string;
  country: string;
  odds?: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    btts?: number;
    over25?: number;
    under25?: number;
  };
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

export async function fetchFixtures(date: string): Promise<FixtureData[]> {
  try {
    const response = await apiClient.get('/fixtures', {
      params: { date }
    });

    const fixtures = response.data.response
      .filter((f: any) => TOP_LEAGUES.includes(f.league.id))
      .map((f: any) => ({
        fixtureId: f.fixture.id,
        date: f.fixture.date,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        league: f.league.name,
        country: f.league.country,
      }));

    return fixtures;
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    throw error;
  }
}

export async function fetchOdds(fixtureId: number): Promise<any> {
  try {
    const response = await apiClient.get('/odds', {
      params: { 
        fixture: fixtureId,
        bookmaker: 1 // Bet365
      }
    });

    const oddsData = response.data.response[0]?.bookmakers[0]?.bets;
    if (!oddsData) return null;

    const matchWinner = oddsData.find((b: any) => b.name === 'Match Winner');
    const btts = oddsData.find((b: any) => b.name === 'Both Teams Score');
    const goals = oddsData.find((b: any) => b.name === 'Goals Over/Under');

    return {
      homeWin: matchWinner?.values.find((v: any) => v.value === 'Home')?.odd,
      draw: matchWinner?.values.find((v: any) => v.value === 'Draw')?.odd,
      awayWin: matchWinner?.values.find((v: any) => v.value === 'Away')?.odd,
      btts: btts?.values.find((v: any) => v.value === 'Yes')?.odd,
      over25: goals?.values.find((v: any) => v.value === 'Over 2.5')?.odd,
      under25: goals?.values.find((v: any) => v.value === 'Under 2.5')?.odd,
    };
  } catch (error) {
    console.error(`Error fetching odds for fixture ${fixtureId}:`, error);
    return null;
  }
}

export async function fetchFixtureResult(fixtureId: number): Promise<any> {
  try {
    const response = await apiClient.get('/fixtures', {
      params: { id: fixtureId }
    });

    const fixture = response.data.response[0];
    return {
      status: fixture.fixture.status.short,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
    };
  } catch (error) {
    console.error(`Error fetching result for fixture ${fixtureId}:`, error);
    return null;
  }
}

// NEW: Fetch Head-to-Head data
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
  } catch (error) {
    console.error('Error fetching H2H data:', error);
    throw error;
  }
}

// NEW: Fetch team statistics
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
      over25Percentage: parseFloat((stats.goals.for.total.total > 2.5 ? 100 : 0).toFixed(1)) || 0 // Simplified
    };
  } catch (error) {
    console.error(`Error fetching team stats for team ${teamId}:`, error);
    throw error;
  }
}

// NEW: Fetch complete fixture statistics (H2H + both teams stats)
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
  } catch (error) {
    console.error(`Error fetching fixture stats for fixture ${fixtureId}:`, error);
    throw error;
  }
}

// NEW: Fetch team's last N fixtures
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
  } catch (error) {
    console.error(`Error fetching last fixtures for team ${teamId}:`, error);
    throw error;
  }
}
