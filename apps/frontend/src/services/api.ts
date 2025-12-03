import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://footy-oracle-backend.onrender.com/api";

const api = axios.create({
  baseURL,
  withCredentials: false,
});

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// ---- FIXTURES API ----
export const fixturesApi = {
  async getByDate(date: string) {
    const res = await api.get<ApiResponse<any[]>>("/fixtures", {
      params: { date },
    });
    return res.data.data ?? [];
  },

  async getById(fixtureId: string | number) {
    const res = await api.get<ApiResponse<any>>(/fixtures/);
    return res.data.data ?? null;
  },

  async getEvents(fixtureId: string | number) {
    const res = await api.get<ApiResponse<any[]>>(
      /fixtures//events
    );
    return res.data.data ?? [];
  },

  async getStats(fixtureId: string | number) {
    const res = await api.get<ApiResponse<any>>(
      /fixtures//stats
    );
    return res.data.data ?? null;
  },

  async getH2H(fixtureId: string | number) {
    const res = await api.get<ApiResponse<any>>(
      /fixtures//h2h
    );
    return res.data.data ?? null;
  },

  async getStandings(leagueId: number | string, season: number | string) {
    const res = await api.get<ApiResponse<any>>(
      /leagues//standings,
      { params: { season } }
    );
    return res.data.data ?? null;
  },
};

// ---- BET BUILDER ----
export const betBuilderApi = {
  getToday: () => api.get("/bet-builder/today").then((res) => res.data),
  getHistory: () => api.get("/bet-builder/history").then((res) => res.data),
};

// ---- GOLDEN BETS ----
export const goldenBetApi = {
  getToday: () => api.get("/golden-bets/today").then((res) => res.data),
};

// ---- VALUE BETS ----
export const valueBetApi = {
  getToday: () => api.get("/value-bets/today").then((res) => res.data),
};

// ---- BETTING INSIGHTS ----
export const bettingInsightsApi = {
  getForFixture: (fixtureId: number) =>
    api.get(/betting-insights/).then((res) => res.data),

  revealBet: (fixtureId: number, betType: string) =>
    api
      .post(/betting-insights//reveal, { betType })
      .then((res) => res.data),
};

// ---- LIVE FIXTURES ----
export const liveFixturesApi = {
  getLive: () => api.get("/live-fixtures").then((res) => res.data),
};

// ---- PREDICTIONS ----
export const predictionsApi = {
  getForFixture: (fixtureId: number) =>
    api.get(/predictions/).then((res) => res.data),
};

export default api;
