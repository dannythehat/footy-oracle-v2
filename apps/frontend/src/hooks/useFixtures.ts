import { useQuery } from "@tanstack/react-query";
import { fixturesApi } from "../services/api";

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
      // Call the API with just the date - the API handles the endpoint construction
      const res = await fixturesApi.getByDate(date);

      // Extract the data array from the response
      const raw = res.data ?? [];

      // Normalize the fixture data for consistent frontend usage
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
