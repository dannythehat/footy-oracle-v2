import { fixturesApi } from "./api";

// FULL compatibility with old code

export const getFixturesByDate = (date: string) =>
  fixturesApi.getByDate(date);

export const getFixtureById = (id: number) =>
  fixturesApi.getById(id);

export const getFixtureStats = (id: number) =>
  fixturesApi.getStats(id);

export const getFixtureEvents = (id: number) =>
  fixturesApi.getEvents(id);

export const getStandings = (leagueId: number, season: number) =>
  fixturesApi.getStandings(leagueId, season);

export const getH2H = (homeId: number, awayId: number) =>
  fixturesApi.getH2H(homeId, awayId);

export const getComplete = (id: number) =>
  fixturesApi.getComplete(id);
