import { useEffect, useState } from "react";
import { fixturesApi } from "../services/api";

export interface LiveFixture {
  fixtureId: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  date: string;
  timestamp?: number;
  score?: any;
}

export default function useLiveFixtures(date: string) {
  const [fixtures, setFixtures] = useState<LiveFixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fixturesApi.getByDate(date);
      if (Array.isArray(data)) {
        setFixtures(data as LiveFixture[]);
      } else {
        setFixtures([]);
      }
    } catch (err) {
      console.error("Fixtures load error:", err);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [date]);

  return { fixtures, loading };
}
