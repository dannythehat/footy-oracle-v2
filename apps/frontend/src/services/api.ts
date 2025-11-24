import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Golden Bets API
export const goldenBetsApi = {
  getToday: async () => {
    const response = await apiClient.get('/api/golden-bets/today');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/golden-bets/${id}`);
    return response.data;
  },
  
  getHistorical: async (params?: {
    startDate?: string;
    endDate?: string;
    result?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/api/golden-bets', { params });
    return response.data;
  },
};

// Fixtures API
export const fixturesApi = {
  getByDate: async (date: string, league?: string, status?: string) => {
    const response = await apiClient.get('/api/fixtures', {
      params: { date, league, status },
    });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/api/fixtures/${id}`);
    return response.data;
  },
  
  getLeagues: async () => {
    const response = await apiClient.get('/api/fixtures/meta/leagues');
    return response.data;
  },

  // NEW: Get Head-to-Head data
  getH2H: async (fixtureId: number, homeTeamId: number, awayTeamId: number, last: number = 10) => {
    const response = await apiClient.get(`/api/fixtures/${fixtureId}/h2h`, {
      params: { homeTeamId, awayTeamId, last }
    });
    return response.data;
  },

  // NEW: Get team statistics
  getTeamStats: async (teamId: number, leagueId: number, season: number) => {
    const response = await apiClient.get(`/api/fixtures/team/${teamId}/stats`, {
      params: { leagueId, season }
    });
    return response.data;
  },

  // NEW: Get complete fixture statistics (H2H + both teams)
  getFixtureStats: async (
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
    leagueId: number,
    season: number
  ) => {
    const response = await apiClient.get(`/api/fixtures/${fixtureId}/stats`, {
      params: { homeTeamId, awayTeamId, leagueId, season }
    });
    return response.data;
  },

  // NEW: Get team's last fixtures
  getTeamLastFixtures: async (teamId: number, last: number = 5) => {
    const response = await apiClient.get(`/api/fixtures/team/${teamId}/last-fixtures`, {
      params: { last }
    });
    return response.data;
  },
};

// Predictions API
export const predictionsApi = {
  getAll: async (params?: {
    date?: string;
    league?: string;
    minConfidence?: number;
    result?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/api/predictions', { params });
    return response.data;
  },
  
  getByFixture: async (fixtureId: number) => {
    const response = await apiClient.get(`/api/predictions/fixture/${fixtureId}`);
    return response.data;
  },
};

// Statistics API
export const statsApi = {
  getPnL: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all' = 'all') => {
    const response = await apiClient.get('/api/stats/pnl', {
      params: { period },
    });
    return response.data;
  },
  
  getTreble: async () => {
    const response = await apiClient.get('/api/stats/treble');
    return response.data;
  },
  
  getOverview: async () => {
    const response = await apiClient.get('/api/stats/overview');
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
