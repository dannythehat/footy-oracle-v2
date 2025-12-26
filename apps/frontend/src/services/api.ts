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
  betBuilderToday: () => fetchJSON("/api/bet-builder/today"),
  pnlSummary: () => fetchJSON("/api/pnl/summary"),
  fixturesStats: () => fetchJSON("/api/fixtures/stats"),
  leagueTables: () => fetchJSON("/api/league-tables"),
};

export const fixturesApi = {
  getByDate: (date: string) => fetchJSON(`/api/fixtures/today?tzOffset=-120`),
};

export default api;
