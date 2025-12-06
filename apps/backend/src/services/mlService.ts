import fs from "fs";
import path from "path";

/** Simple Types **/
export interface MLPrediction {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  confidence: number;
}

export interface GoldenBet extends MLPrediction {
  odds?: number;
  aiExplanation?: string;
  result?: string;
  profitLoss?: number;
}

export interface ValueBet extends MLPrediction {
  odds?: number;
  expectedValue?: number;
  aiExplanation?: string;
  result?: string;
  profitLoss?: number;
}

/** LOAD ML JSON LOCALLY **/
const ML_OUTPUTS_PATH = path.join(process.cwd(), "public", "ml_outputs");

function loadLocalJSON(filename: string): any {
  try {
    const filePath = path.join(ML_OUTPUTS_PATH, filename);

    if (!fs.existsSync(filePath)) {
      console.error("ML JSON missing:", filePath);
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", filename, e);
    return null;
  }
}

/** MAP OUTCOMES **/
function mapOutcome(raw: string) {
  const k = (raw || "").toLowerCase();

  if (k.includes("home")) return { market: "Match Winner", prediction: "Home Win" };
  if (k.includes("away")) return { market: "Match Winner", prediction: "Away Win" };
  if (k.includes("draw")) return { market: "Match Winner", prediction: "Draw" };

  if (k.includes("btts")) return { market: "BTTS", prediction: "Yes" };
  if (k.includes("over_2_5") || k.includes("over25"))
    return { market: "Over/Under 2.5", prediction: "Over 2.5" };
  if (k.includes("over_9_5"))
    return { market: "Total Corners", prediction: "Over 9.5" };
  if (k.includes("over_3_5"))
    return { market: "Total Cards", prediction: "Over 3.5" };

  return { market: "Match Winner", prediction: "Home Win" };
}

/** LOAD PREDICTIONS **/
export function loadMLPredictions(): MLPrediction[] {
  const json =
    loadLocalJSON("ai_predictions.json") ||
    loadLocalJSON("predictions_today.json") ||
    loadLocalJSON("predictions.json");

  if (!json) return [];

  const raw = Array.isArray(json)
    ? json
    : json.predictions || [];

  return raw.map((x: any, i: number) => {
    const predicted = x.predicted_outcome || x.prediction || "home_win";
    const mp = mapOutcome(predicted);

    const conf =
      typeof x.confidence === "number"
        ? x.confidence
        : x.probabilities
        ? Math.max(
            x.probabilities.home_win || 0,
            x.probabilities.draw || 0,
            x.probabilities.away_win || 0
          )
        : 0.5;

    return {
      fixtureId: Number(x.fixture_id || i + 1),
      homeTeam: x.home_team || "",
      awayTeam: x.away_team || "",
      league: x.league || "",
      market: mp.market,
      prediction: mp.prediction,
      confidence: conf <= 1 ? conf * 100 : conf
    };
  });
}

/** LOAD GOLDEN BETS **/
export function loadGoldenBets(): GoldenBet[] {
  const json = loadLocalJSON("golden_bets.json");
  if (!json) return [];

  const raw = Array.isArray(json)
    ? json
    : json.golden_bets || [];

  return raw.map((x: any, i: number) => {
    const predicted = x.bet_type || x.prediction || "home_win";
    const mp = mapOutcome(predicted);

    const conf =
      typeof x.confidence === "number"
        ? x.confidence
        : 0.7;

    return {
      fixtureId: Number(x.fixture_id || i + 1),
      homeTeam: x.home_team || "",
      awayTeam: x.away_team || "",
      league: x.league || "",
      market: mp.market,
      prediction: mp.prediction,
      confidence: conf <= 1 ? conf * 100 : conf,
      odds: x.odds || x.bookmaker_odds || 0,
      aiExplanation: x.ai_explanation || "",
      result: x.result,
      profitLoss: x.profit_loss
    };
  });
}

/** LOAD VALUE BETS **/
export function loadValueBets(): ValueBet[] {
  const json = loadLocalJSON("value_bets.json");
  if (!json) return [];

  const raw = Array.isArray(json)
    ? json
    : json.value_bets || [];

  return raw.map((x: any, i: number) => {
    const predicted = x.bet_type || x.prediction || "";
    const mp = mapOutcome(predicted);

    const prob =
      typeof x.model_probability === "number"
        ? x.model_probability
        : typeof x.confidence === "number"
        ? x.confidence
        : 0.5;

    return {
      fixtureId: Number(x.fixture_id || i + 1),
      homeTeam: x.home_team || "",
      awayTeam: x.away_team || "",
      league: x.league || "",
      market: mp.market,
      prediction: mp.prediction,
      confidence: prob <= 1 ? prob * 100 : prob,
      odds: x.odds || 0,
      expectedValue: x.expected_value || 0,
      aiExplanation: x.ai_explanation || "",
      result: x.result,
      profitLoss: x.profit_loss
    };
  });
}
