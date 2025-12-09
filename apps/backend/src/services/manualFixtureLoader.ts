import axios from "axios";
import { Fixture } from "../models/Fixture.js";

export const loadTodayFixturesManual = async () => {
  const today = new Date().toISOString().split("T")[0];

  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`;

  const headers = {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
  };

  const res = await axios.get(url, { headers });

  const fixtures = res.data.response || [];

  // Normalize + insert
  for (const f of fixtures) {
    await Fixture.updateOne(
      { fixtureId: f.fixture.id },
      {
        fixtureId: f.fixture.id,
        date: f.fixture.date,
        league: f.league.name,
        leagueId: f.league.id,
        home: f.teams.home.name,
        away: f.teams.away.name,
        status: f.fixture.status.short
      },
      { upsert: true }
    );
  }

  return fixtures.length;
};
