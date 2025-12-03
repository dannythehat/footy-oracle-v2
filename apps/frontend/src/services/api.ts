import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// ---- Fixtures API ----
export const fixturesApi = {
  getById: (fixtureId) =>
    api.get(`/fixtures/${fixtureId}`).then((res) => res.data),

  getStats: (fixtureId) =>
    api.get(`/fixtures/${fixtureId}/stats`).then((res) => res.data),

  getEvents: (fixtureId) =>
    api.get(`/fixtures/${fixtureId}/events`).then((res) => res.data),

  getComplete: (fixtureId) =>
    api.get(`/fixtures/${fixtureId}/complete`).then((res) => res.data),

  getLive: (fixtureId) =>
    api.get(`/fixtures/${fixtureId}/live`).then((res) => res.data),

  getH2H: (homeId, awayId) =>
    api
      .get(`/fixtures/h2h`, { params: { homeTeamId: homeId, awayTeamId: awayId } })
      .then((res) => res.data),

  getStandings: (leagueId, season) =>
    api
      .get(`/leagues/${leagueId}/standings`, { params: { season } })
      .then((res) => res.data),
};

export default api;
