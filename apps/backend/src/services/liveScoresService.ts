import axios from "axios";
import { Fixture } from "../models/Fixture.js";

const KEY = process.env.FOOTBALL_API_KEY!;
const BASE = "https://v3.football.api-sports.io";

export async function updateLiveScores() {
  const fixtures = await Fixture.find({ status: { $ne: "FT" } });

  for (const fx of fixtures) {
    const res = await axios.get(`${BASE}/fixtures`, {
      headers: { "x-apisports-key": KEY },
      params: { id: fx.fixtureId }
    });

    const data = res.data.response?.[0];
    if (!data) continue;

    fx.status = data.fixture.status.short;
    fx.score = data.goals;
    await fx.save();
  }
}
