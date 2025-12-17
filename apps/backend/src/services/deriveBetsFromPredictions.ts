import fs from "fs";
import path from "path";

type Market = "over25" | "btts" | "corners" | "cards";

interface PredictionRow {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  probabilities: Record<Market, number>;
}

interface PredictionsFile {
  success: boolean;
  total: number;
  predictions: PredictionRow[];
}

const ML_OUTPUT = "C:\\Users\\Danny\\football-betting-ai-system\\footy_oracle_v2\\outputs\\predictions.json";

const ODDS_MIN = 1.6;
const VALUE_EDGE = 0.05;

function impliedProb(odds: number) {
  return odds > 0 ? 1 / odds : 0;
}

export function loadPredictions(): PredictionsFile {
  const raw = fs.readFileSync(ML_OUTPUT, "utf-8");
  return JSON.parse(raw);
}

export function deriveGoldenPerFixture(rows: PredictionRow[]) {
  return rows.map(r => {
    const entries = Object.entries(r.probabilities) as [Market, number][];
    const [market, prob] = entries.sort((a,b)=>b[1]-a[1])[0];
    return { ...r, goldenMarket: market, goldenProb: prob };
  });
}

export function pickTop3Golden(goldens: any[], oddsByFixture: Record<number, Record<Market, number>>) {
  return goldens
    .filter(g => (oddsByFixture[g.fixtureId]?.[g.goldenMarket] ?? 0) >= ODDS_MIN)
    .sort((a,b)=>b.goldenProb - a.goldenProb)
    .slice(0,3);
}

export function deriveValueBets(rows: PredictionRow[], oddsByFixture: Record<number, Record<Market, number>>) {
  const values: any[] = [];
  rows.forEach(r => {
    (Object.keys(r.probabilities) as Market[]).forEach(m => {
      const odds = oddsByFixture[r.fixtureId]?.[m];
      if (!odds || odds < ODDS_MIN) return;
      const p = r.probabilities[m];
      const edge = p - impliedProb(odds);
      if (edge >= VALUE_EDGE) {
        values.push({ ...r, market: m, prob: p, odds, edge });
      }
    });
  });
  return values.sort((a,b)=>b.edge - a.edge).slice(0,3);
}

export function deriveBetBuilder(goldenTop3: any[], valueTop3: any[]) {
  const legs = [...goldenTop3.slice(0,2), ...valueTop3.slice(0,1)];
  let combinedOdds = legs.reduce((acc,l)=>acc * l.odds, 1);
  combinedOdds = combinedOdds * 0.75; // realism factor
  return { legs, combinedOdds: Number(combinedOdds.toFixed(2)) };
}
