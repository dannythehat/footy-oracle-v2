import fs from "fs";
import path from "path";
import { predictionCache } from "./predictionCache.js";

const ML_OUTPUT_DIR = "C:/Users/Danny/football-betting-ai-system/shared/ml_outputs";

function loadJson(file: string) {
  const full = path.join(ML_OUTPUT_DIR, file);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

export async function generateDailyOracle() {
  const predictions = loadJson("predictions.json") || [];
  const oddsSnapshot = loadJson("odds_snapshot.json") || {};
  const aiReasoning = loadJson("ai_reasoning.json") || {};

  // ---- GOLDEN PER FIXTURE ----
  const goldenPerFixture = predictions.map((p: any) => {
    const markets = [
      { key: "over25", prob: p.over25 },
      { key: "btts", prob: p.btts },
      { key: "corners_over95", prob: p.corners_over95 },
      { key: "cards_over35", prob: p.cards_over35 }
    ];

    const best = markets.sort((a, b) => b.prob - a.prob)[0];
    const odds = oddsSnapshot[p.fixtureId]?.[best.key] ?? null;

    return {
      fixtureId: p.fixtureId,
      league: p.league,
      homeTeam: p.homeTeam,
      awayTeam: p.awayTeam,
      market: best.key,
      probability: best.prob,
      odds,
      reasoning: aiReasoning[p.fixtureId]?.[best.key] ?? null
    };
  });

  // ---- TOP 3 GOLDEN ----
  const topGolden = goldenPerFixture
    .filter(g => g.odds && g.odds >= 1.6)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  // ---- VALUE BETS ----
  const valueBets = goldenPerFixture
    .map(g => {
      if (!g.odds) return null;
      const implied = 1 / g.odds;
      const edge = g.probability - implied;
      return { ...g, edge };
    })
    .filter(v => v && v.odds >= 1.6 && v.edge >= 0.05)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, 3);

  // ---- BET BUILDER OF THE DAY ----
  const builderLegs = [...topGolden, ...valueBets]
    .filter(l => l.probability >= 0.7)
    .slice(0, 4);

  const betBuilder =
    builderLegs.length >= 3
      ? {
          legs: builderLegs,
          combinedProbability: builderLegs.reduce((a, b) => a * b.probability, 1),
          combinedOdds:
            builderLegs.reduce((a, b) => a * (b.odds || 1), 1) * 0.75
        }
      : null;

  const snapshot = {
    date: new Date().toISOString().slice(0, 10),
    goldenPerFixture,
    topGolden,
    valueBets,
    betBuilder
  };

  predictionCache.setDailyOracle(snapshot);
  return snapshot;
}
