import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Fixture from '../models/Fixture.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const API_KEY = process.env.API_FOOTBALL_KEY;

async function run() {
  await mongoose.connect(MONGODB_URI);

  const today = new Date().toISOString().split('T')[0];

  const url = 'https://v3.football.api-sports.io/fixtures?date=' + today;
  const headers = { 'x-apisports-key': API_KEY };

  const res = await axios.get(url, { headers: headers });

  const list = res.data.response || [];

  for (const f of list) {
    const data = {
      fixture_id: f.fixture.id,
      date: today,
      timestamp: f.fixture.timestamp,
      league_id: f.league.id,
      league_name: f.league.name,
      country: f.league.country,
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
      status: f.fixture.status.long,
      score: {
        fulltime: f.score.fulltime,
        halftime: f.score.halftime
      },
      events: []
    };

    await Fixture.findOneAndUpdate(
      { fixture_id: f.fixture.id },
      data,
      { upsert: true }
    );
  }

  console.log('Fixtures updated: ' + list.length);
  process.exit(0);
}

run();
