export const API_URL =
  import.meta.env.VITE_API_URL || "https://footy-oracle-backend.onrender.com";

export async function fetchJSON(endpoint: string) {
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  fixturesToday: () => fetchJSON("/api/fixtures/today?tzOffset=-120"),
  goldenBetsToday: () => fetchJSON("/api/golden-bets/today"),
  valueBetsToday: () => fetchJSON("/api/value-bets/today"),
  betBuilderToday: () => fetchJSON("/api/betbuilder"),
};

// Fixtures API - comprehensive fixture data access
export const fixturesApi = {
  // Get fixtures by date (YYYY-MM-DD format)
  getByDate: async (date: string) => {
    const response = await fetchJSON(`/api/fixtures?date=${date}`);
    return response;
  },

  // Get single fixture by ID
  getById: async (id: number) => {
    const response = await fetchJSON(`/api/fixtures/${id}`);
    return response;
  },

  // Get fixture statistics
  getStats: async (id: number) => {
    const response = await fetchJSON(`/api/fixtures/${id}/stats`);
    return response;
  },

  // Get fixture events (goals, cards, substitutions)
  getEvents: async (id: number) => {
    const response = await fetchJSON(`/api/fixtures/${id}/events`);
    return response;
  },

  // Get league standings
  getStandings: async (leagueId: number, season: number) => {
    const response = await fetchJSON(`/api/fixtures/standings?leagueId=${leagueId}&season=${season}`);
    return response;
  },

  // Get head-to-head between two teams
  getH2H: async (homeId: number, awayId: number) => {
    const response = await fetchJSON(`/api/fixtures/h2h?homeId=${homeId}&awayId=${awayId}`);
    return response;
  },

  // Get complete fixture data (all details)
  getComplete: async (id: number) => {
    const response = await fetchJSON(`/api/fixtures/${id}/complete`);
    return response;
  },
};

// Bet Builder API
export const betBuilderApi = {
  getToday: () => fetchJSON("/api/bet-builder/today"),
  getById: (id: string) => fetchJSON(`/api/bet-builder/${id}`),
};
