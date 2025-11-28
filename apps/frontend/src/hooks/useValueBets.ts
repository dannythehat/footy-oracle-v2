import { useQuery } from '@tanstack/react-query';

export interface ValueBet {
  bet_id: string;
  fixture_id: string;
  league: string;
  home_team: string;
  away_team: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  value: number;
  ai_explanation: string;
  result: 'win' | 'loss' | 'pending';
  profit_loss: number;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  'https://footy-oracle-backend.onrender.com/api';

const fetchValueBets = async (): Promise<ValueBet[]> => {
  const res = await fetch(`${API_BASE}/value-bets/today`, {
    credentials: 'include',
  });

  if (!res.ok) {
    console.error('Failed to fetch value bets:', res.status);
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const useValueBets = () =>
  useQuery<ValueBet[]>({
    queryKey: ['value-bets-today'],
    queryFn: fetchValueBets,
    staleTime: 30000,
  });
