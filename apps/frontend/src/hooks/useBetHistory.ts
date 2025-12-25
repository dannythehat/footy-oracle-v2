import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface BetHistoryEntry {
  _id: string;
  date: string;
  betType: 'golden_bet' | 'bet_builder';
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  market?: string;
  markets?: Array<{
    market: string;
    prediction: string;
    confidence: number;
  }>;
  confidence: number;
  odds: number | null;
  aiCommentary: string;
  result: 'win' | 'loss' | 'pending' | 'void';
  stake: number;
  profitLoss: number;
  createdAt: string;
}

export interface BetStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  totalProfitLoss: number;
  winRate: number;
  avgConfidence: number;
  byType: {
    goldenBets: {
      total: number;
      wins: number;
      profitLoss: number;
    };
    betBuilders: {
      total: number;
      wins: number;
      profitLoss: number;
    };
  };
}

const fetchBetHistory = async (filters?: { betType?: string; result?: string; limit?: number }): Promise<{ bets: BetHistoryEntry[]; total: number }> => {
  const params = new URLSearchParams();
  if (filters?.betType) params.append('betType', filters.betType);
  if (filters?.result) params.append('result', filters.result);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get(`/api/bet-history?${params.toString()}`);
  return response.data;
};

const fetchBetStats = async (days: number = 30): Promise<BetStats> => {
  const response = await api.get(`/api/bet-history/stats?days=${days}`);
  return response.data.stats;
};

export const useBetHistory = (filters?: { betType?: string; result?: string; limit?: number }) =>
  useQuery({
    queryKey: ["bet-history", filters],
    queryFn: () => fetchBetHistory(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useBetStats = (days: number = 30) =>
  useQuery({
    queryKey: ["bet-stats", days],
    queryFn: () => fetchBetStats(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
