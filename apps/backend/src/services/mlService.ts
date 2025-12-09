import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'https://football-ml-api.onrender.com';

const client = axios.create({
  baseURL: ML_API_URL,
  timeout: 20000,
});

// Fetch predictions for all fixtures for a date
export const mlService = {
  async getPredictions(date: string) {
    try {
      const res = await client.get('/predictions', {
        params: { date },
      });
      return res.data;
    } catch (err: any) {
      console.error('ML API predictions error:', err.message);
      return [];
    }
  },

  async getGoldenBets(date: string) {
    try {
      const res = await client.get('/golden-bets', {
        params: { date },
      });
      return res.data;
    } catch (err: any) {
      console.error('ML API golden bets error:', err.message);
      return [];
    }
  },

  async getValueBets(date: string) {
    try {
      const res = await client.get('/value-bets', {
        params: { date },
      });
      return res.data;
    } catch (err: any) {
      console.error('ML API value bets error:', err.message);
      return [];
    }
  },

  async getBetBuilder(date: string) {
    try {
      const res = await client.get('/bet-builder', {
        params: { date },
      });
      return res.data;
    } catch (err: any) {
      console.error('ML API bet builder error:', err.message);
      return null;
    }
  },
};
