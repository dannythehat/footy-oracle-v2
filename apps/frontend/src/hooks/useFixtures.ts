import { useQuery } from "@tanstack/react-query";
import { fixturesApi } from "../services/api";
import dayjs from "dayjs";

// Hook to load fixtures for a given date
// If no date is passed ? defaults to today's date
export function useFixtures(date?: string) {
  const queryDate = date || dayjs().format("YYYY-MM-DD");

  return useQuery({
    queryKey: ["fixtures", queryDate],
    queryFn: async () => {
      const res = await fixturesApi.getByDate(queryDate);

      // Backend might return:
      // { success: true, data: [...] }
      // OR just an array
      return res.data || res;
    },
    refetchInterval: 60 * 1000, // refresh fixtures every 60 seconds
  });
}

export default useFixtures;
