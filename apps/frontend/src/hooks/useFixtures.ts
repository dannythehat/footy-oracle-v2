import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api";

export interface NormalizedFixture {
  id: number;
  fixtureId: number;
  date: string;
  time: string;
  status: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  leagueId: number;
  country: string | null;
  season: number | null;
}

export const useFixtures = (date: string) => {
  return useQuery({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      const res = await apiClient.get(`/fixtures?date=${date}`);

      const raw = res.data?.data ?? [];

      const normalized: NormalizedFixture[] = raw.map((fx: any) => ({
        id: fx.id ?? fx.fixtureId,
        fixtureId: fx.fixtureId,
        date: fx.date,
        time: fx.time,
        status: fx.status,
        homeTeamName: fx.homeTeamName ?? fx.homeTeam,
        awayTeamName: fx.awayTeamName ?? fx.awayTeam,
        leagueName: fx.leagueName ?? fx.league,
        leagueId: fx.leagueId,
        country: fx.country ?? null,
        season: fx.season ?? null,
      }));

      return normalized;
    },
  });
};
