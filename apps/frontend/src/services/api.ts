import axios from 'axios';

// Use environment variable or fallback to Render backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://footy-oracle-backend.onrender.com/api';
  || 'https://footy-oracle-backend.onrender.com/api';
;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

// Get user's timezone offset in minutes
const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

// Fixtures API
export const fixturesApi = {
  // Get fixtures by date (with timezone support)
  getByDate: (date: string) => {
    const timezoneOffset = getTimezoneOffset();
    return api.get(`/api/fixtures`, { 
      params: { 
        date,
        timezoneOffset 
      } 
    }).then(r => r.data);
  },

  // Get fixtures by date range
  getByDateRange: (startDate: string, endDate: string) =>
    api.get(`/api/fixtures`, { params: { startDate, endDate } }).then(r => r.data),

  // Get filtered fixtures
  getFiltered: (params: any) =>
    api.get(`/api/fixtures`, { params }).then(r => r.data),

  // Get single fixture by ID
  getById: (fixtureId: number) =>
    api.get(`/api/fixtures/${fixtureId}`).then(r => r.data),

  // Get fixture statistics
  getStats: (fixtureId: number) =>
    api.get(`/api/fixtures/${fixtureId}/stats`).then(r => r.data),

  // Get fixture events
  getEvents: (fixtureId: number) =>
    api.get(`/api/fixtures/${fixtureId}/events`).then(r => r.data),

  // Get complete fixture data (fixture + stats + events + h2h + standings)
  getComplete: (fixtureId: number) =>
    api.get(`/api/fixtures/${fixtureId}/complete`).then(r => r.data),

  // Get live fixtures
  getLive: () =>
    api.get(`/api/live-fixtures`).then(r => r.data),

  // Refresh scores for a date
  refreshScores: (date: string) =>
    api.post(`/api/fixtures/refresh`, { date }).then(r => r.data),

  // Get head-to-head data
  getH2H: (homeTeamId: number, awayTeamId: number) =>
    api.get(`/api/fixtures/h2h`, { params: { homeTeamId, awayTeamId } }).then(r => r.data),

  // Get league standings
  getStandings: (leagueId: number, season: number) =>
    api.get(`/api/leagues/${leagueId}/standings`, { params: { season } }).then(r => r.data),
};

// Live Fixtures API
export const liveFixturesApi = {
  getLive: () =>
    api.get(`/api/live-fixtures`).then(r => r.data),
};

// Bet Builder API
export const betBuilderApi = {
  getDaily: () =>
    api.get(`/api/bet-builder`).then(r => r.data),
  
  getHistory: (params?: any) =>
    api.get(`/api/bet-builder/history`, { params }).then(r => r.data),
};

// Golden Bets API
export const goldenBetApi = {
  getAll: (params?: any) =>
    api.get(`/api/golden-bets`, { params }).then(r => r.data),
};

// Value Bets API
export const valueBetApi = {
  getAll: (params?: any) =>
    api.get(`/api/value-bets`, { params }).then(r => r.data),
};

// Betting Insights API
export const bettingInsightsApi = {
  getAll: (params?: any) =>
    api.get(`/api/betting-insights`, { params }).then(r => r.data),
};

// Predictions API
export const predictionsApi = {
  getAll: (params?: any) =>
    api.get(`/api/predictions`, { params }).then(r => r.data),
};

export default api;
