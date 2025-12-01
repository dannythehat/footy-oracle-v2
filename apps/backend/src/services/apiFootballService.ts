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
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
  timeout: 15000,
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

/**
 * Fetch ALL fixtures for a date (NO FILTER)
 */
export async function fetchFixtures(date: string): Promise<FixtureData[]> {
  console.log(`📅 Fetching fixtures for ${date}...`);

  const response = await apiClient.get("/fixtures", {
    params: { date },
  });

  const list = response.data.response || [];

  const fixtures = list.map((f: any) => ({
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

  console.log(`✅ Fixtures fetched: ${fixtures.length}`);
  return fixtures;
}

/**
 * Fetch odds (unchanged logic, normalized output)
 */
export async function fetchOdds(fixtureId: number): Promise<any> {
  console.log(`💰 Odds for ${fixtureId}`);

  const response = await apiClient.get("/odds", {
    params: {
      fixture: fixtureId,
      bookmaker: 8,
    },
  });

  const res = response.data.response[0];
  if (!res) return null;

  const bets = res.bookmakers?.[0]?.bets || [];

  function get(bid: number, value: string) {
    const market = bets.find((b: any) => b.id === bid);
    return market?.values?.find((v: any) => v.value === value)?.odd;
  }

  return {
    homeWin: get(1, "Home"),
    draw: get(1, "Draw"),
    awayWin: get(1, "Away"),
    btts: get(8, "Yes"),
    over25: get(5, "Over 2.5"),
    under25: get(5, "Under 2.5"),
    over95corners: get(12, "Over 9.5"),
    over35cards: get(11, "Over 3.5"),
  };
}

/**
 * Combine fixtures + odds
 */
export async function fetchFixturesWithOdds(
  date: string
): Promise<FixtureData[]> {
  const fixtures = await fetchFixtures(date);
  if (!fixtures.length) return [];

  const enriched: FixtureData[] = [];

  for (const fx of fixtures) {
    const odds = await fetchOdds(fx.fixtureId);
    enriched.push({
      ...fx,
      odds: odds || undefined,
    });

    // Rate limiting
    await new Promise((res) => setTimeout(res, 100));
  }

  return enriched;
}

/**
 * Fetch Head-to-Head matches between two teams
 */
export async function fetchH2H(
  homeTeamId: number,
  awayTeamId: number,
  last: number = 10
) {
  try {
    console.log(`🔄 Fetching H2H: ${homeTeamId} vs ${awayTeamId}`);

    const response = await apiClient.get("/fixtures/headtohead", {
      params: {
        h2h: `${homeTeamId}-${awayTeamId}`,
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
    console.error("❌ Error fetching H2H:", error.message);
    throw new Error("Failed to fetch H2H data");
  }
}

/**
 * Fetch team statistics for a season
 */
export async function fetchTeamStats(
  teamId: number,
  leagueId: number,
  season: number
) {
  try {
    console.log(`📊 Fetching team stats: ${teamId} in league ${leagueId}`);

    const response = await apiClient.get("/teams/statistics", {
      params: {
        team: teamId,
        league: leagueId,
        season: season,
      },
    });

    const data = response.data.response;

    if (!data) {
      throw new Error("No statistics available");
    }

    return {
      form: data.form,
      fixtures: {
        played: data.fixtures?.played?.total || 0,
        wins: data.fixtures?.wins?.total || 0,
        draws: data.fixtures?.draws?.total || 0,
        loses: data.fixtures?.loses?.total || 0,
      },
      goals: {
        for: data.goals?.for?.total?.total || 0,
        against: data.goals?.against?.total?.total || 0,
        average: {
          for: data.goals?.for?.average?.total || "0",
          against: data.goals?.against?.average?.total || "0",
        },
      },
      cleanSheets: {
        home: data.clean_sheet?.home || 0,
        away: data.clean_sheet?.away || 0,
        total: data.clean_sheet?.total || 0,
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching team stats:", error.message);
    throw new Error("Failed to fetch team statistics");
  }
}

/**
 * Fetch complete fixture statistics (combines H2H + both team stats)
 */
export async function fetchFixtureStats(
  fixtureId: number,
  homeTeamId: number,
  awayTeamId: number,
  leagueId: number,
  season: number
) {
  try {
    console.log(`📈 Fetching fixture stats for ${fixtureId}`);

    // Try to get live statistics first
    const response = await apiClient.get("/fixtures/statistics", {
      params: {
        fixture: fixtureId,
      },
    });

    const stats = response.data.response;

    if (stats && stats.length >= 2) {
      // Live match statistics available
      const homeStats = stats.find((s: any) => s.team.id === homeTeamId);
      const awayStats = stats.find((s: any) => s.team.id === awayTeamId);

      const getStat = (teamStats: any, key: string) => {
        const stat = teamStats?.statistics?.find((s: any) => s.type === key);
        return stat?.value;
      };

      return {
        home: {
          shots: {
            total: getStat(homeStats, "Total Shots") || 0,
            on: getStat(homeStats, "Shots on Goal") || 0,
          },
          possession: parseInt(getStat(homeStats, "Ball Possession") || "0"),
          corners: getStat(homeStats, "Corner Kicks") || 0,
          fouls: getStat(homeStats, "Fouls") || 0,
          yellowCards: getStat(homeStats, "Yellow Cards") || 0,
          redCards: getStat(homeStats, "Red Cards") || 0,
          attacks: getStat(homeStats, "Total passes") || 0,
          dangerousAttacks: getStat(homeStats, "Passes accurate") || 0,
        },
        away: {
          shots: {
            total: getStat(awayStats, "Total Shots") || 0,
            on: getStat(awayStats, "Shots on Goal") || 0,
          },
          possession: parseInt(getStat(awayStats, "Ball Possession") || "0"),
          corners: getStat(awayStats, "Corner Kicks") || 0,
          fouls: getStat(awayStats, "Fouls") || 0,
          yellowCards: getStat(awayStats, "Yellow Cards") || 0,
          redCards: getStat(awayStats, "Red Cards") || 0,
          attacks: getStat(awayStats, "Total passes") || 0,
          dangerousAttacks: getStat(awayStats, "Passes accurate") || 0,
        },
      };
    }

    // No live stats, return empty structure
    throw new Error("Statistics not available yet");
  } catch (error: any) {
    console.error("❌ Error fetching fixture stats:", error.message);
    throw new Error("Match statistics not available");
  }
}

/**
 * Fetch team's last fixtures
 */
export async function fetchTeamLastFixtures(teamId: number, last: number = 5) {
  try {
    console.log(`🔙 Fetching last ${last} fixtures for team ${teamId}`);

    const response = await apiClient.get("/fixtures", {
      params: {
        team: teamId,
        last: last,
      },
    });

    const fixtures = response.data.response || [];

    return fixtures.map((f: any) => ({
      fixtureId: f.fixture.id,
      date: f.fixture.date,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      score: {
        home: f.goals.home ?? null,
        away: f.goals.away ?? null,
      },
      league: f.league.name,
      status: mapStatus(f.fixture.status.short),
    }));
  } catch (error: any) {
    console.error("❌ Error fetching team last fixtures:", error.message);
    throw new Error("Failed to fetch team fixtures");
  }
}
