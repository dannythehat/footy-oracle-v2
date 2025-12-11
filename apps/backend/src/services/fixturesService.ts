import axios from "axios";
import { Fixture } from "../models/Fixture.js";
import { fetchOddsForFixture } from "./oddsService.js";

const KEY = process.env.FOOTBALL_API_KEY!;
const BASE = "https://v3.football.api-sports.io";

export async function fetchTodayFixtures() {
  const res = await axios.get(`${BASE}/fixtures`, {
    headers: { "x-apisports-key": KEY },
    params: { date: new Date().toISOString().slice(0,10) }
  });

  return res.data.response || [];
}

export async function saveFixtures(fixtures: any[]) {
  for (const f of fixtures) {

    const odds = await fetchOddsForFixture(f.fixture.id);

    await Fixture.updateOne(
      { fixtureId: f.fixture.id },
      {
        fixtureId: f.fixture.id,
        leagueId: f.league.id,
        league: f.league.name,
        date: f.fixture.date,
        status: f.fixture.status.short,
        homeTeamId: f.teams.home.id,
        homeTeam: f.teams.home.name,
        awayTeamId: f.teams.away.id,
        awayTeam: f.teams.away.name,
        odds
      },
      { upsert: true }
    );
  }
}
