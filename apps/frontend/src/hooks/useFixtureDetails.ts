import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Backend routes are all mounted under /api in server.ts
const FIXTURES_BASE = "/api/fixtures";
const LEAGUES_BASE = "/api/leagues";

export const useFixtureH2H = (fixtureId?: number) =>
  useQuery({
    queryKey: ["fixture-h2h", fixtureId],
    queryFn: async () => {
      const res = await api.get(`${FIXTURES_BASE}/${fixtureId}/h2h`);
      return res.data;
    },
    enabled: !!fixtureId,
  });

export const useFixtureStats = (fixtureId?: number) =>
  useQuery({
    queryKey: ["fixture-stats", fixtureId],
    queryFn: async () => {
      const res = await api.get(`${FIXTURES_BASE}/${fixtureId}/stats`);
      return res.data;
    },
    enabled: !!fixtureId,
  });

export const useFixtureOdds = (fixtureId?: number) =>
  useQuery({
    queryKey: ["fixture-odds", fixtureId],
    queryFn: async () => {
      const res = await api.get(`${FIXTURES_BASE}/${fixtureId}/odds`);
      return res.data;
    },
    enabled: !!fixtureId,
    refetchInterval: 60000,
  });

export const useFixtureLive = (fixtureId?: number) =>
  useQuery({
    queryKey: ["fixture-live", fixtureId],
    queryFn: async () => {
      const res = await api.get(`${FIXTURES_BASE}/${fixtureId}/live`);
      return res.data;
    },
    enabled: !!fixtureId,
    refetchInterval: 30000,
  });

export const useLeagueStandings = (leagueId?: number, season?: number) =>
  useQuery({
    queryKey: ["league-standings", leagueId, season],
    queryFn: async () => {
      const res = await api.get(
        `${LEAGUES_BASE}/${leagueId}/standings`,
        { params: { season } }
      );
      return res.data;
    },
    enabled: !!leagueId && !!season,
  });
