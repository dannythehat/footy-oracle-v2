import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// ---- Fixtures API ----
export const fixturesApi = {
  // Get fixtures by date
  getByDate: (date: string) =>
    api.get(`/fixtures`, { params: { date } }).then(res => res.data),

  // Get fixtures by date range
  getByDateRange: (startDate: string, endDate: string) =>
    api.get(`/fixtures`, { params: { startDate, endDate } }).then(res => res.data),

  // Get fixtures with filters
  getFiltered: (params: {
    date?: string;
    startDate?: string;
    endDate?: string;
    league?: string;
    leagueId?: number;
    status?: 'scheduled' | 'live' | 'finished' | 'postponed';
    limit?: number;
    page?: number;
    sort?: string;
  }) =>
    api.get(`/fixtures`, { params }).then(res => res.data),

  // Get fixture by ID
  getById: (fixtureId: number) =>
    api.get(`/fixtures/${fixtureId}`).then(res => res.data),

  // Get fixture details
  getDetails: (fixtureId: number) =>
    api.get(`/fixtures/${fixtureId}`).then(res => res.data),

  // Get fixture stats
  getStats: (fixtureId: number) =>
    api.get(`/fixtures/${fixtureId}/stats`).then(res => res.data),

  // Get head-to-head
  getH2H: (homeTeamId: number, awayTeamId: number) =>
    api.get(`/fixtures/h2h`, {
      params: { homeTeamId, awayTeamId }
    }).then(res => res.data),

  // Refresh scores
  refreshScores: (date: string) =>
    api.post(`/fixtures/refresh-scores`, { date }).then(res => res.data),
};

// ---- Bet Builder API ----
export const betBuilderApi = {
  getToday: () => api.get(`/bet-builders/today`).then(res => res.data),
  getHistory: () => api.get(`/bet-builders/history`).then(res => res.data),
};

// ---- Golden Bets ----
export const goldenBetApi = {
  getToday: () => api.get(`/golden-bets/today`).then(res => res.data),
};

// ---- Value Bets ----
export const valueBetApi = {
  getToday: () => api.get(`/value-bets/today`).then(res => res.data),
};

// ---- Betting Insights ----
export const bettingInsightsApi = {
  getForFixture: (fixtureId: number) =>
    api.get(`/betting-insights/${fixtureId}`).then(res => res.data),
  
  revealBet: (fixtureId: number, betType: string) =>
    api.post(`/betting-insights/${fixtureId}/reveal`, { betType }).then(res => res.data),
};

// ---- Live Fixtures ----
export const liveFixturesApi = {
  getLive: () => api.get(`/live-fixtures`).then(res => res.data),
};

// ---- Predictions ----
export const predictionsApi = {
  getForFixture: (fixtureId: number) =>
    api.get(`/predictions/${fixtureId}`).then(res => res.data),
};

export default api;
