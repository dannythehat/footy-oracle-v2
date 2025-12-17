import axios from "axios";
import Fixture from "../models/Fixture.js";

const ML_API_URL = process.env.ML_API_URL;

if (!ML_API_URL) {
  throw new Error("ML_API_URL is not set");
}

function buildPayload(fixtures: any[]) {
  return {
    fixtures: fixtures.map(fx => ({
      fixture_id: fx.fixtureId,
      home_team: fx.homeTeam,
      away_team: fx.awayTeam,
      league_id: fx.leagueId,
      league_name: fx.league,
      date: fx.date.toISOString(),
      features: fx.features || {},
      odds: fx.odds || null,
    })),
  };
}

export async function runPredictionsForToday() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const fixtures = await Fixture.find({
    date: { $gte: todayStart, $lte: todayEnd },
    statusShort: "NS",
  }).lean();

  if (!fixtures.length) {
    return { predictions: [], goldenBets: [], valueBets: [] };
  }

  const payload = buildPayload(fixtures);

  const [predRes, goldenRes, valueRes] = await Promise.all([
    axios.post(`${ML_API_URL}/predictions`, payload),
    axios.post(`${ML_API_URL}/golden-bets`, payload, { params: { min_confidence: 0.75 } }),
    axios.post(`${ML_API_URL}/value-bets`, payload, { params: { min_edge: 0.05 } }),
  ]);

  return {
    predictions: predRes.data,
    goldenBets: goldenRes.data,
    valueBets: valueRes.data,
  };
}

export async function getGoldenBetsForToday(minConfidence = 0.75) {
  const { goldenBets } = await runPredictionsForToday();
  return { data: goldenBets };
}

export async function getValueBetsForToday(minEdge = 0.05) {
  const { valueBets } = await runPredictionsForToday();
  return { data: valueBets };
}
