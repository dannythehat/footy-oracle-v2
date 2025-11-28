import { useQuery } from "@tanstack/react-query";

export interface Fixture {
  fixtureId: number | string;
  league: string;
  country: string;
  kickoff: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://footy-oracle-backend.onrender.com/api";

const fetchFixtures = async (date: string): Promise<Fixture[]> => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);

  const res = await fetch(`${API_BASE}/fixtures?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Failed to fetch fixtures:", res.status);
    return [];
  }

  const data = await res.json();

  if (!Array.isArray(data)) return [];

  // We assume backend already returns normalized objects.
  return data as Fixture[];
};

export const useFixtures = (date: string) =>
  useQuery<Fixture[]>({
    queryKey: ["fixtures", date],
    queryFn: () => fetchFixtures(date),
    staleTime: 30000,
  });
