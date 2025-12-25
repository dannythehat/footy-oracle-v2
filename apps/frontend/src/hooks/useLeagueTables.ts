import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface LeagueTableEntry {
  team: string;
  league: string;
  games: number;
  hits: number;
  misses: number;
  percentage: number;
  display: string;
  avgValue: number;
}

export interface LeagueTables {
  goals: {
    over_1_5: LeagueTableEntry[];
    over_2_5: LeagueTableEntry[];
    over_3_5: LeagueTableEntry[];
    under_1_5: LeagueTableEntry[];
    under_2_5: LeagueTableEntry[];
    under_3_5: LeagueTableEntry[];
  };
  btts: {
    yes: LeagueTableEntry[];
    no: LeagueTableEntry[];
  };
  corners: {
    over_8_5: LeagueTableEntry[];
    over_9_5: LeagueTableEntry[];
    over_10_5: LeagueTableEntry[];
    over_11_5: LeagueTableEntry[];
    over_12_5: LeagueTableEntry[];
    under_8_5: LeagueTableEntry[];
    under_9_5: LeagueTableEntry[];
    under_10_5: LeagueTableEntry[];
  };
  cards: {
    over_3_5: LeagueTableEntry[];
    over_4_5: LeagueTableEntry[];
    over_5_5: LeagueTableEntry[];
    under_3_5: LeagueTableEntry[];
    under_4_5: LeagueTableEntry[];
  };
}

const fetchLeagueTables = async (region: string = "All"): Promise<LeagueTables> => {
  const response = await api.get(`/api/league-tables/${region}`);
  return response.data.tables;
};

export const useLeagueTables = (region: string = "All") =>
  useQuery({
    queryKey: ["league-tables", region],
    queryFn: () => fetchLeagueTables(region),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
