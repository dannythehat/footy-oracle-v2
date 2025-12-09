import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface BetBuilder {
  bet_id: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  league: string;
  combined_odds: number;
  confidence: number;
  ai_explanation: string;
  result: "win" | "loss" | "pending";
  profit_loss: number;
}

const fetchBetBuilder = async (): Promise<BetBuilder | null> => {
  const response = await api.get("/api/bet-builders/today");

  const body = response.data;

  // Handle different response formats
  const data = body?.data ?? body;
  
  return data ?? null;
};

export const useBetBuilder = () =>
  useQuery({
    queryKey: ["bet-builder-today"],
    queryFn: fetchBetBuilder,
    staleTime: 30000,
  });
