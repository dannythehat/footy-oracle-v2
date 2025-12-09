import axios from "axios";
import { IFixture } from "../models/Fixture.js";

export interface MLPrediction {
  fixtureId: number;
  over25: number;
  btts: number;
  over95corners: number;
  over35cards: number;
}

export interface GoldenBet extends MLPrediction {
  market: string;
  probability: number;
}

export interface ValueBet extends MLPrediction {
  market: string;
  modelProbability: number;
  bookmakerProbability: number;
  value: number;
}

const ML_API_URL = process.env.ML_API_URL || "";

export async function loadMLPredictions(fixtures: IFixture[]): Promise<MLPrediction[]> {
  const res = await axios.post(${ML_API_URL}/predict, {
    fixtures: fixtures.map((f) => ({
      fixtureId: f.fixtureId,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      leagueId: f.leagueId,
      odds: f.odds || {}
    }))
  });
  return res.data.predictions || [];
}

export async function loadGoldenBets(fixtures: IFixture[]): Promise<GoldenBet[]> {
  const res = await axios.post(${ML_API_URL}/golden-bets, { fixtures });
  return res.data.goldenBets || [];
}

export async function loadValueBets(fixtures: IFixture[]): Promise<ValueBet[]> {
  const res = await axios.post(${ML_API_URL}/value-bets, { fixtures });
  return res.data.valueBets || [];
}

export async function checkMLAPIHealth(): Promise<boolean> {
  try {
    const res = await axios.get(${ML_API_URL}/health);
    return !!res.data?.models_loaded;
  } catch {
    return false;
  }
}
