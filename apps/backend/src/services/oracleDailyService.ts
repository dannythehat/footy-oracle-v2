import fs from "fs";
import path from "path";
import { getTodayFixturesFromDB } from "./fixtureReadService";
import { runOracleSelectionEngine } from "./oracleSelectionEngine";

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

  const candidates = fixtures
    .map(f => {
      const fid = String(f.fixtureId);
      return {
        fixture: f,
        prediction: predictionMap.get(fid),
        odds: oddsMap.get(fid),
      };
    })
    .filter(c => c.prediction && c.odds);

  if (!candidates.length) {
    console.warn("⚠️ Oracle ran but no candidates matched.");
  }

  return runOracleSelectionEngine(candidates);
}