import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Fixture } from '../models/Fixture.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
const API_KEY = process.env.API_FOOTBALL_KEY!;

async function run() {
  await mongoose.connect(MONGODB_URI);

  const today = new Date().toISOString().split('T')[0];

  const url = 'https://v3.football.api-sports.io/fixtures?date=' + today;
  const headers = { 'x-apisports-key': API_KEY };

  const res = await axios.get(url, { headers: headers });

  const list = res.data.response || [];

  for (const f of list) {
    const data = {
      fixtureId: f.fixture.id,
      date: new Date(f.fixture.timestamp * 1000),
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      league: f.league.name,
      country: f.league.country,
      status: f.fixture.status.short === 'FT' ? 'finished' : 
              f.fixture.status.short === 'NS' ? 'scheduled' : 'live',
      score: f.score.fulltime.home !== null ? {
        home: f.score.fulltime.home,
        away: f.score.fulltime.away
      } : undefined,
      odds: {} // Odds would be fetched separately if needed
    };

    await Fixture.findOneAndUpdate(
      { fixtureId: f.fixture.id },
      data,
      { upsert: true }
    );
  }

  console.log('✅ Fixtures updated: ' + list.length);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
