import axios from 'axios';

// Force NO credentials, avoid CORS blocking
axios.defaults.withCredentials = false;

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://footy-oracle-backend.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // crucial fix
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor with retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.code === 'ECONNABORTED' && !config._retry) {
      config._retry = true;
      console.log('⏳ Retry after timeout...');
      return apiClient(config);
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ------------------- GOLDEN BETS -------------------
export const goldenBetsApi = {
  getToday: async () => {
    return (await apiClient.get('/api/golden-bets/today')).data;
  },
  getById: async (id: string) => {
    return (await apiClient.get(`/api/golden-bets/${id}`)).data;
  },
  getHistorical: async (params?: any) => {
    return (await apiClient.get('/api/golden-bets', { params })).data;
  },
};

// ------------------- VALUE BETS -------------------
export const valueBetsApi = {
  getToday: async () => {
    return (await apiClient.get('/api/value-bets/today')).data;
  },
  getAll: async (params?: any) => {
    return (await apiClient.get('/api/value-bets', { params })).data;
  },
};

// ------------------- BET BUILDER -------------------
export const betBuilderApi = {
  getOfTheDay: async () => {
    return (await apiClient.get('/api/bet-builders/of-the-day')).data;
  },
  getToday: async () => {
    return (await apiClient.get('/api/bet-builders/today')).data;
  },
  getById: async (id: string) => {
    return (await apiClient.get(`/api/bet-builders/${id}`)).data;
  },
  getByDate: async (date: string) => {
    return (await apiClient.get('/api/bet-builders', { params: { date } }))
      .data;
  },
  getHistorical: async (params?: any) => {
    return (await apiClient.get('/api/bet-builders', { params })).data;
  },
  getWeekly: async () => {
    return (await apiClient.get('/api/bet-builders/weekly')).data;
  },
  getStats: async (params?: any) => {
    return (
      await apiClient.get('/api/bet-builders/stats/summary', { params })
    ).data;
  },
};

// ------------------- FIXTURES -------------------
export const fixturesApi = {
  getByDate: async (date: string, league?: string, status?: string) => {
    return (
      await apiClient.get('/api/fixtures', {
        params: { date, league, status },
      })
    ).data;
  },

  getById: async (id: number) => {
    return (await apiClient.get(`/api/fixtures/${id}`)).data;
  },

  getLeagues: async () => {
    return (await apiClient.get('/api/fixtures/meta/leagues')).data;
  },

  getH2H: async (fixtureId: number, homeTeamId: number, awayTeamId: number, last = 10) => {
    return (
      await apiClient.get(`/api/fixtures/${fixtureId}/h2h`, {
        params: { homeTeamId, awayTeamId, last },
      })
    ).data;
  },

  getTeamStats: async (teamId: number, leagueId: number, season: number) => {
    return (
      await apiClient.get(`/api/fixtures/team/${teamId}/stats`, {
        params: { leagueId, season },
      })
    ).data;
  },

  getFixtureStats: async (
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
    leagueId: number,
    season: number
  ) => {
    return (
      await apiClient.get(`/api/fixtures/${fixtureId}/stats`, {
        params: { homeTeamId, awayTeamId, leagueId, season },
      })
    ).data;
  },

  getTeamLastFixtures: async (teamId: number, last = 5) => {
    return (
      await apiClient.get(`/api/fixtures/team/${teamId}/last-fixtures`, {
        params: { last },
      })
    ).data;
  },

  refreshScores: async (date?: string) => {
    return (await apiClient.post('/api/fixtures/refresh-scores', { date }))
      .data;
  },
};

// ------------------- LIVE FIXTURES -------------------
export const liveFixturesApi = {
  getAll: async () => {
    return (await apiClient.get('/api/live-fixtures')).data;
  },
  getStatistics: async (fixtureId: number) => {
    return (await apiClient.get(`/api/live-fixtures/${fixtureId}/statistics`))
      .data;
  },
  forceUpdate: async () => {
    return (await apiClient.post('/api/live-fixtures/update')).data;
  },
};

// ------------------- PREDICTIONS -------------------
export const predictionsApi = {
  getAll: async (params?: any) => {
    return (await apiClient.get('/api/predictions', { params })).data;
  },
  getByFixture: async (fixtureId: number) => {
    return (await apiClient.get(`/api/predictions/fixture/${fixtureId}`))
      .data;
  },
};

// ------------------- GENERAL STATS -------------------
export const statsApi = {
  getPnL: async (period = 'all') => {
    return (
      await apiClient.get('/api/stats/pnl', {
        params: { period },
      })
    ).data;
  },
  getTreble: async () => {
    return (await apiClient.get('/api/stats/treble')).data;
  },
  getOverview: async () => {
    return (await apiClient.get('/api/stats/overview')).data;
  },
};

// ------------------- BETTING INSIGHTS -------------------
export const bettingInsightsApi = {
  getByFixture: async (fixtureId: number) => {
    return (await apiClient.get(`/api/betting-insights/${fixtureId}`)).data;
  },

  revealBetType: async (fixtureId: number, betType: string) => {
    return (
      await apiClient.post(`/api/betting-insights/${fixtureId}/reveal/${betType}`)
    ).data;
  },

  revealGoldenBet: async (fixtureId: number) => {
    return (
      await apiClient.post(`/api/betting-insights/${fixtureId}/reveal-golden`)
    ).data;
  },

  getUpcoming: async () => {
    return (await apiClient.get('/api/betting-insights/fixtures/upcoming'))
      .data;
  },
};

// ------------------- HEALTH CHECK -------------------
export const healthCheck = async () => {
  return (await apiClient.get('/health')).data;
};

export default apiClient;
