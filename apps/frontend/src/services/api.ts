import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds for Render cold starts
});

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic for timeout errors (Render cold start)
    if (error.code === 'ECONNABORTED' && !config._retry) {
      config._retry = true;
      console.log('⏳ Request timed out, retrying (Render cold start)...');
      return apiClient(config);
    }
    
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

// Value Bets API
export const valueBetsApi = {
  getToday: async () => {
    const response = await apiClient.get('/api/value-bets/today');
    return response.data;
  },
  
  getAll: async (params?: {
    minEdge?: number;
    minConfidence?: number;
    league?: string;
    market?: string;
  }) => {
    const response = await apiClient.get('/api/value-bets', { params });
    return response.data;
  },
};

// Bet Builder API
export const betBuilderApi = {
  getOfTheDay: async () => {
    const response = await apiClient.get('/api/bet-builders/of-the-day');
    return response.data;
  },
  
  getToday: async () => {
    const response = await apiClient.get('/api/bet-builders/today');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/bet-builders/${id}`);
    return response.data;
  },
  
  getByDate: async (date: string) => {
    const response = await apiClient.get('/api/bet-builders', {
      params: { date },
    });
    return response.data;
  },
  
  getHistorical: async (params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/api/bet-builders', { params });
    return response.data;
  },
  
  getWeekly: async () => {
    const response = await apiClient.get('/api/bet-builders/weekly');
    return response.data;
  },
  
  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/api/bet-builders/stats/summary', { params });
    return response.data;
  },
};

// Fixtures API
export const fixturesApi = {
  getByDate: async (date: string, league?: string, status?: string) => {
    const response = await apiClient.get('/api/fixtures', {
      params: { date, league, status },
    });
    // Backend returns { success, data, count } - return the whole response
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

  // Get Head-to-Head data
  getH2H: async (fixtureId: number, homeTeamId: number, awayTeamId: number, last: number = 10) => {
    const response = await apiClient.get(`/api/fixtures/${fixtureId}/h2h`, {
      params: { homeTeamId, awayTeamId, last }
    });
    return response.data;
  },

  // Get team statistics
  getTeamStats: async (teamId: number, leagueId: number, season: number) => {
    const response = await apiClient.get(`/api/fixtures/team/${teamId}/stats`, {
      params: { leagueId, season }
    });
    return response.data;
  },

  // Get complete fixture statistics (H2H + both teams)
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

  // Get team's last fixtures
  getTeamLastFixtures: async (teamId: number, last: number = 5) => {
    const response = await apiClient.get(`/api/fixtures/team/${teamId}/last-fixtures`, {
      params: { last }
    });
    return response.data;
  },

  // Refresh scores from API-Football
  refreshScores: async (date?: string) => {
    const response = await apiClient.post('/api/fixtures/refresh-scores', {
      date
    });
    return response.data;
  },
};

// Live Fixtures API - Real-time scores and statistics
export const liveFixturesApi = {
  // Get all currently live fixtures with scores and statistics
  getAll: async () => {
    const response = await apiClient.get('/api/live-fixtures');
    return response.data;
  },

  // Get detailed statistics for a specific live fixture
  getStatistics: async (fixtureId: number) => {
    const response = await apiClient.get(`/api/live-fixtures/${fixtureId}/statistics`);
    return response.data;
  },

  // Manually trigger live scores update
  forceUpdate: async () => {
    const response = await apiClient.post('/api/live-fixtures/update');
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

// Betting Insights API
export const bettingInsightsApi = {
  // Get AI betting insights for a specific fixture
  getByFixture: async (fixtureId: number) => {
    const response = await apiClient.get(`/api/betting-insights/${fixtureId}`);
    return response.data;
  },

  // Reveal a specific bet type
  revealBetType: async (fixtureId: number, betType: 'bts' | 'over25' | 'over35cards' | 'over95corners') => {
    const response = await apiClient.post(`/api/betting-insights/${fixtureId}/reveal/${betType}`);
    return response.data;
  },

  // Reveal the golden bet
  revealGoldenBet: async (fixtureId: number) => {
    const response = await apiClient.post(`/api/betting-insights/${fixtureId}/reveal-golden`);
    return response.data;
  },

  // Get all upcoming fixtures with AI insights
  getUpcoming: async () => {
    const response = await apiClient.get('/api/betting-insights/fixtures/upcoming');
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
