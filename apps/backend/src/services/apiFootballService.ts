import axios from "axios";

const API_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.warn("⚠️ API_FOOTBALL_KEY not set!");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
  timeout: 20000,
});

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
  odds?: any;
  status: string;
  score?: { home: number | null; away: number | null };
}

/** MAP STATUS */
function mapStatus(short: string): string {
  const liveCodes = ["1H", "2H", "ET", "P", "BT", "HT"];
  if (short === "FT") return "finished";
  if (liveCodes.includes(short)) return "live";
  return "scheduled";
}

/** Fetch Fixtures by Date */
export async function fetchFixtures(date: string): Promise<FixtureData[]> {
  console.log(`📅 Fetching fixtures for ${date}...`);

  const response = await apiClient.get("/fixtures", {
    params: { date },
  });

  const list = response.data.response || [];

  return list.map((f: any) => ({
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
    score: {
      home: f.goals.home ?? null,
      away: f.goals.away ?? null,
    },
  }));
}

/** Fetch Odds with fallback bookmakers */
export async function fetchOdds(fixtureId: number): Promise<any> {
  // Try multiple bookmakers in order of preference
  // 8 = Bet365, 6 = Bwin, 11 = Williamhill
  const bookmakers = [
    { id: 8, name: "Bet365" },
    { id: 6, name: "Bwin" },
    { id: 11, name: "Williamhill" }
  ];

  for (const bookmaker of bookmakers) {
    try {
      console.log(`💰 Fetching odds for fixture ${fixtureId} from ${bookmaker.name}...`);

      const response = await apiClient.get("/odds", {
        params: {
          fixture: fixtureId,
          bookmaker: bookmaker.id,
        },
      });

      const res = response.data.response[0];
      if (!res || !res.bookmakers?.[0]?.bets) {
        console.log(`⚠️  No odds from ${bookmaker.name} for fixture ${fixtureId}`);
        continue; // Try next bookmaker
      }

      const bets = res.bookmakers[0].bets;

      function get(bid: number, value: string) {
        const market = bets.find((b: any) => b.id === bid);
        return market?.values?.find((v: any) => v.value === value)?.odd;
      }

      const odds = {
        homeWin: get(1, "Home"),
        draw: get(1, "Draw"),
        awayWin: get(1, "Away"),
        btts: get(8, "Yes"),
        over25: get(5, "Over 2.5"),
        under25: get(5, "Under 2.5"),
        over95corners: get(12, "Over 9.5"),
        over35cards: get(11, "Over 3.5"),
      };

      // Check if we got at least some odds
      const hasOdds = Object.values(odds).some(odd => odd !== undefined);
      
      if (hasOdds) {
        console.log(`✅ Got odds for fixture ${fixtureId} from ${bookmaker.name}`);
        return odds;
      } else {
        console.log(`⚠️  ${bookmaker.name} returned empty odds for fixture ${fixtureId}`);
      }
    } catch (err: any) {
      console.warn(`❌ Error fetching odds from ${bookmaker.name}:`, err.message);
      // Continue to next bookmaker
    }
  }

  // No bookmaker had odds
  console.warn(`⚠️  No odds available from any bookmaker for fixture ${fixtureId}`);
  return null;
}

/** Fetch H2H */
export async function fetchH2H(
  homeTeamId: number,
  awayTeamId: number,
  last: number = 10
) {
  console.log(`🔄 Fetching H2H: ${homeTeamId} vs ${awayTeamId}`);

  const response = await apiClient.get("/fixtures/headtohead", {
    params: {
      h2h: `${homeTeamId}-${awayTeamId}`,
      last,
    },
  });

  const matches = response.data.response || [];

  const transformed = matches.map((m: any) => ({
    date: m.fixture.date,
    homeTeam: m.teams.home.name,
    awayTeam: m.teams.away.name,
    score: {
      home: m.goals.home ?? 0,
      away: m.goals.away ?? 0,
    },
    league: m.league.name,
  }));

  let homeWins = 0,
    awayWins = 0,
    draws = 0,
    btts = 0,
    over25 = 0;

  transformed.forEach((m: any) => {
    const h = m.score.home;
    const a = m.score.away;

    if (h > a) homeWins++;
    else if (a > h) awayWins++;
    else draws++;

    if (h > 0 && a > 0) btts++;
    if (h + a > 2.5) over25++;
  });

  return {
    matches: transformed,
    stats: {
      totalMatches: transformed.length,
      homeWins,
      awayWins,
      draws,
      bttsCount: btts,
      over25Count: over25,
    },
  };
}

/** Fetch Team Stats */
export async function fetchTeamStats(
  teamId: number,
  leagueId: number,
  season: number
) {
  console.log(`📊 Fetching team stats: ${teamId} in league ${leagueId}`);

  const response = await apiClient.get("/teams/statistics", {
    params: {
      team: teamId,
      league: leagueId,
      season,
    },
  });

  const data = response.data.response;
  if (!data) throw new Error("No statistics available");

  return {
    form: data.form,
    fixtures: data.fixtures,
    goals: data.goals,
    cleanSheets: data.clean_sheet,
  };
}

/** Fetch Fixture Stats */
export async function fetchFixtureStats(
  fixtureId: number,
  homeTeamId: number,
  awayTeamId: number,
  leagueId: number,
  season: number
) {
  console.log(`📈 Fetching fixture stats for ${fixtureId}`);

  const response = await apiClient.get("/fixtures/statistics", {
    params: {
      fixture: fixtureId,
    },
  });

  const stats = response.data.response;

  if (!stats || stats.length < 2)
    throw new Error("Statistics not available yet");

  const getStat = (teamStats: any, type: string) =>
    teamStats?.statistics?.find((s: any) => s.type === type)?.value;

  const homeStats = stats.find((s: any) => s.team.id === homeTeamId);
  const awayStats = stats.find((s: any) => s.team.id === awayTeamId);

  return {
    home: {
      shotsOnGoal: getStat(homeStats, "Shots on Goal"),
      shotsOffGoal: getStat(homeStats, "Shots off Goal"),
      totalShots: getStat(homeStats, "Total Shots"),
      blockedShots: getStat(homeStats, "Blocked Shots"),
      shotsInsideBox: getStat(homeStats, "Shots insidebox"),
      shotsOutsideBox: getStat(homeStats, "Shots outsidebox"),
      fouls: getStat(homeStats, "Fouls"),
      cornerKicks: getStat(homeStats, "Corner Kicks"),
      offsides: getStat(homeStats, "Offsides"),
      ballPossession: getStat(homeStats, "Ball Possession"),
      yellowCards: getStat(homeStats, "Yellow Cards"),
      redCards: getStat(homeStats, "Red Cards"),
      goalkeeperSaves: getStat(homeStats, "Goalkeeper Saves"),
      totalPasses: getStat(homeStats, "Total passes"),
      passesAccurate: getStat(homeStats, "Passes accurate"),
      passesPercentage: getStat(homeStats, "Passes %"),
    },
    away: {
      shotsOnGoal: getStat(awayStats, "Shots on Goal"),
      shotsOffGoal: getStat(awayStats, "Shots off Goal"),
      totalShots: getStat(awayStats, "Total Shots"),
      blockedShots: getStat(awayStats, "Blocked Shots"),
      shotsInsideBox: getStat(awayStats, "Shots insidebox"),
      shotsOutsideBox: getStat(awayStats, "Shots outsidebox"),
      fouls: getStat(awayStats, "Fouls"),
      cornerKicks: getStat(awayStats, "Corner Kicks"),
      offsides: getStat(awayStats, "Offsides"),
      ballPossession: getStat(awayStats, "Ball Possession"),
      yellowCards: getStat(awayStats, "Yellow Cards"),
      redCards: getStat(awayStats, "Red Cards"),
      goalkeeperSaves: getStat(awayStats, "Goalkeeper Saves"),
      totalPasses: getStat(awayStats, "Total passes"),
      passesAccurate: getStat(awayStats, "Passes accurate"),
      passesPercentage: getStat(awayStats, "Passes %"),
    },
  };
}

/** Fetch Past Fixtures */
export async function fetchPastFixtures(
  teamId: number,
  last: number = 10
): Promise<any[]> {
  console.log(`📜 Fetching last ${last} fixtures for team ${teamId}`);

  const response = await apiClient.get("/fixtures", {
    params: {
      team: teamId,
      last,
    },
  });

  const fixtures = response.data.response || [];

  return fixtures.map((f: any) => ({
    fixtureId: f.fixture.id,
    date: f.fixture.date,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    score: {
      home: f.goals.home ?? 0,
      away: f.goals.away ?? 0,
    },
    league: f.league.name,
    status: mapStatus(f.fixture.status.short),
  }));
}

/** Fetch Odds for a specific fixture (used by cron) */
export async function fetchOddsForFixture(fixtureId: number): Promise<any> {
  return fetchOdds(fixtureId);
}
