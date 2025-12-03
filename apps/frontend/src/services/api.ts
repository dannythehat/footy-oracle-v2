import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false
});

export const fixturesApi = {
  getById: (fixtureId: number) =>
    api.get(/fixtures/).then(r => r.data),

  getStats: (fixtureId: number) =>
    api.get(/fixtures//stats).then(r => r.data),

  getEvents: (fixtureId: number) =>
    api.get(/fixtures//events).then(r => r.data),

  getH2H: (homeId: number, awayId: number) =>
    api.get(/fixtures/h2h, { params: { homeTeamId: homeId, awayTeamId: awayId }})
      .then(r => r.data),

  getStandings: (leagueId: number, season: number) =>
    api.get(/leagues//standings, { params: { season }})
      .then(r => r.data),
};

export default api;
