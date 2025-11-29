import { useQuery } from "@tanstack/react-query";

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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://footy-oracle-backend.onrender.com/api";

const fetchBetBuilder = async (): Promise<BetBuilder | null> => {
  const res = await fetch(`${API_BASE}/bet-builders/today`, {
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Failed to fetch bet builder:", res.status);
    return null;
  }

  const data = await res.json();
  return data ?? null;
};

export const useBetBuilder = () =>
  useQuery({
    queryKey: ["bet-builder-today"],
    queryFn: fetchBetBuilder,
    staleTime: 30000,
  });
