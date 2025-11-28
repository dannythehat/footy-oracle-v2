import { Router } from 'express';
import axios from 'axios';
import Fixture from '../models/Fixture';

const router = Router();

router.get('/reload', async (req, res) => {
  try {
    const API_KEY = process.env.API_FOOTBALL_KEY!;
    const today = new Date();

    const dates: string[] = [];
    for (let i = -1; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    let savedCount = 0;

    for (const date of dates) {
      const url = "https://v3.football.api-sports.io/fixtures?date=" + date;

      const response = await axios.get(url, {
        headers: { 'x-apisports-key': API_KEY }
      });

      const fixtures = response.data.response || [];

      for (const f of fixtures) {
        await Fixture.findOneAndUpdate(
          { fixture_id: f.fixture.id },
          {
            fixture_id: f.fixture.id,
            date: f.fixture.date,
            timestamp: f.fixture.timestamp,
            league: f.league,
            teams: f.teams
          },
          { upsert: true }
        );

        savedCount++;
      }
    }

    res.json({ status: 'ok', saved: savedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'reload_failed' });
  }
});

export default router;
