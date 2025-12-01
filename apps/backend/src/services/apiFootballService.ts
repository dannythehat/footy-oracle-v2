import axios from "axios";

const API_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
const API_KEY = process.env.API_FOOTBALL_KEY;

if (!API_KEY) {
  console.warn("?? API_FOOTBALL_KEY not set!");
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
  console.log(`?? Fetching fixtures for ${date}...`);

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

  console.log(`? Fixtures fetched: ${fixtures.length}`);
  return fixtures;
}

/**
 * Fetch odds (unchanged logic, normalized output)
 */
export async function fetchOdds(fixtureId: number): Promise<any> {
  console.log(`?? Odds for ${fixtureId}`);

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
