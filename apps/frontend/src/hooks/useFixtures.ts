import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:10000';

export function useFixtures(date: string) {
  return useQuery({
    queryKey: ['fixtures', date],
    queryFn: async () => {
      const res = await axios.get(API_BASE + '/api/fixtures?date=' + date);
      return res.data;
    }
  });
}
