import { useQuery } from '@tanstack/react-query';

export interface GoldenBet {
  bet_id: string;
  fixture_id: string;
  league: string;
  home_team: string;
  away_team: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  ai_explanation: string;
  confidence: number;
  result: 'win' | 'loss' | 'pending';
  profit_loss: number;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  'https://footy-oracle-backend.onrender.com/api';

const fetchGoldenBets = async (): Promise<GoldenBet[]> => {
  const res = await fetch(`${API_BASE}/golden-bets/today`, {
    credentials: 'include',
  });

  if (!res.ok) {
    console.error('Failed to fetch golden bets:', res.status);
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const useGoldenBets = () =>
  useQuery<GoldenBet[]>({
    queryKey: ['golden-bets-today'],
    queryFn: fetchGoldenBets,
    staleTime: 30_000, // 30 seconds
  });
