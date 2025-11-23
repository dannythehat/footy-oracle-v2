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
