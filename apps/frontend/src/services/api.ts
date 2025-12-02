import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false
});

// ---- Fixtures API ----
export const fixturesApi = {
  getByDate: (date: string) =>
    api.get(`/fixtures`, { params: { date } }).then(res => res.data),
  getDetails: (fixtureId: number) =>
    api.get(`/fixtures/${fixtureId}`).then(res => res.data),
  getStats: (fixtureId: number) =>
    api.get(`/fixtures/${fixtureId}/stats`).then(res => res.data),
  getH2H: (homeTeamId: number, awayTeamId: number) =>
    api.get(`/fixtures/h2h`, { params: { homeTeamId, awayTeamId } }).then(res => res.data)
};

// ---- Bet Builder API ----
export const betBuilderApi = {
  getToday: () => api.get(`/bet-builders/today`).then(res => res.data),
  getHistory: () => api.get(`/bet-builders/history`).then(res => res.data)
};

// ---- Golden Bets ----
export const goldenBetApi = {
  getToday: () => api.get(`/golden-bets/today`).then(res => res.data)
};

// ---- Value Bets ----
export const valueBetApi = {
  getToday: () => api.get(`/value-bets/today`).then(res => res.data)
};

export default api;
