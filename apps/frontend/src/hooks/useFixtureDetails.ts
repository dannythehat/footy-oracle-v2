import { useQuery } from "@tanstack/react-query";
import { fixturesApi } from "../services/api";

export interface FixtureTeamInfo {
  id: number;
  name: string;
  logo?: string;
}

export interface FixtureLeagueInfo {
  id: number;
  name: string;
  country: string;
  season: number;
}

export interface FixtureDetailsData {
  id: number;
  date: string;
  status: string;
  homeTeam: FixtureTeamInfo;
  awayTeam: FixtureTeamInfo;
  league: FixtureLeagueInfo;
  odds?: any;
}

const useFixtureDetails = (fixtureId: number | null) => {
  return useQuery({
    queryKey: ["fixture-details", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;

      const response = await fixturesApi.getById(fixtureId);

      return {
        id: response.fixtureId,
        date: response.date,
        status: response.status,
        homeTeam: {
          id: response.homeTeamId,
          name: response.homeTeam,
          logo: response.homeTeamLogo,
        },
        awayTeam: {
          id: response.awayTeamId,
          name: response.awayTeam,
          logo: response.awayTeamLogo,
        },
        league: {
          id: response.leagueId,
          name: response.league,
          country: response.country,
          season: response.season,
        },
        odds: response.odds || null,
      } as FixtureDetailsData;
    },
    enabled: !!fixtureId,
  });
};

export default useFixtureDetails;
