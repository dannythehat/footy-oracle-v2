import fs from "fs";
import path from "path";
import { getTodayFixturesFromDB } from "./fixtureReadService.js";
import { runOracleSelectionEngine, BetCandidate } from "./oracleSelectionEngine.js";
import { SupportedMarketGroup } from "../config/supportedMarkets.js";

function loadJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function norm(v: any): string {
  return String(v)
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPredictionFixtureId(p: any): string | null {
  if (p.fixtureId != null) return String(p.fixtureId);
  if (p.match_id != null) return String(p.match_id);
  if (p.fixture?.id != null) return String(p.fixture.id);
  return null;
}

export async function generateDailyOracle() {
  const fixtures = await getTodayFixturesFromDB();
  if (!fixtures.length) {
    throw new Error("No fixtures found for today");
  }

  const outputsRoot =
    process.env.ML_OUTPUTS_PATH ||
    path.resolve(process.cwd(), "../../shared/ml_outputs");

  const predictions = loadJson<any[]>(
    path.join(outputsRoot, "predictions.json")
  );

  const oddsSnapshot = loadJson<any>(
    path.join(outputsRoot, "odds_snapshot.json")
  );

  const predictionMap = new Map<string, any>();
  for (const p of predictions) {
    const fid = extractPredictionFixtureId(p);
    if (fid) predictionMap.set(fid, p);
  }

  // --- Build odds map ---
  const oddsMap = new Map<string, any>();

  // Direct fixtureId keys
  for (const k of Object.keys(oddsSnapshot)) {
    oddsMap.set(String(k), oddsSnapshot[k]);
  }

  // Fallback: match by team names
  for (const f of fixtures) {
    const fid = String(f.fixtureId);
    if (oddsMap.has(fid)) continue;

    const fh = norm(f.homeTeam);
    const fa = norm(f.awayTeam);

    for (const ev of Object.values(oddsSnapshot)) {
      const eh = norm((ev as any).home_team);
      const ea = norm((ev as any).away_team);
      if (fh === eh && fa === ea) {
        oddsMap.set(fid, ev);
        break;
      }
    }
  }

  const candidates: BetCandidate[] = [];
  
  for (const f of fixtures) {
    const fid = String(f.fixtureId);
    const prediction = predictionMap.get(fid);
    const odds = oddsMap.get(fid);
    
    if (!prediction || !odds) continue;
    
    // Extract predictions for each market
    const markets = [
      { key: 'goals', market: 'GOALS' as SupportedMarketGroup, line: 'O2.5' },
      { key: 'btts', market: 'BTTS' as SupportedMarketGroup, line: 'BTTS_YES' },
      { key: 'corners', market: 'CORNERS' as SupportedMarketGroup, line: 'O9.5' },
      { key: 'cards', market: 'CARDS' as SupportedMarketGroup, line: 'O3.5' }
    ];
    
    for (const m of markets) {
      const prob = prediction[m.key]?.probability || prediction[`${m.key}_probability`];
      const marketOdds = odds[m.key]?.odds || odds[`${m.key}_odds`];
      
      if (prob && marketOdds && marketOdds > 1.0) {
        candidates.push({
          fixtureId: Number(f.fixtureId),
          league: f.league || 'Unknown',
          market: m.market,
          line: m.line,
          odds: marketOdds,
          modelProbability: prob
        });
      }
    }
  }

  if (!candidates.length) {
    console.warn("⚠️ Oracle ran but no candidates matched.");
  }

  return runOracleSelectionEngine(candidates);
}