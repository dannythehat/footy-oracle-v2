import fetch from "node-fetch";

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

/** Top leagues only **/
const TOP_LEAGUES = new Set<string>([
  "Premier League",
  "Championship",
  "League One",
  "League Two",
  "La Liga",
  "Segunda División",
  "Serie A",
  "Serie B",
  "Bundesliga",
  "2. Bundesliga",
  "3. Liga",
  "Ligue 1",
  "Ligue 2",
  "Eredivisie",
  "Primeira Liga",
  "Süper Lig",
  "Belgian Pro League",
  "Scottish Premiership",
  "Major League Soccer",
  "Liga MX",
  "Argentina Liga Profesional",
  "Brasileirão Serie A",
  "J1 League",
  "K League 1",
  "Saudi Pro League",
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Europa Conference League",
  "Swiss Super League",
  "Austrian Bundesliga",
  "Polish Ekstraklasa",
  "Danish Superliga",
  "Allsvenskan",
  "Eliteserien",
  "Greek Super League",
  "Croatian HNL",
  "Czech First League",
  "Serbian SuperLiga"
]);

const BASE =
  (process.env.ML_OUTPUTS_BASE_URL || 
  "https://raw.githubusercontent.com/dannythehat/footy-oracle-v2/main/public/ml_outputs");

async function fetchJSON(filename: string): Promise<any> {
  try {
    const url = BASE + "/" + filename;
    console.log("ML fetch:", url);

    const res = await fetch(url);
    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error("ML fetch error:", e);
    return null;
  }
}

function mapOutcome(raw: string) {
  const k = (raw || "").toLowerCase();

  if (k.includes("home")) return { market: "Match Winner", prediction: "Home Win" };
  if (k.includes("away")) return { market: "Match Winner", prediction: "Away Win" };
  if (k.includes("draw")) return { market: "Match Winner", prediction: "Draw" };

  if (k.includes("btts")) return { market: "BTTS", prediction: "Yes" };
  if (k.includes("over_2_5")) return { market: "Over/Under 2.5", prediction: "Over 2.5" };
  if (k.includes("over25")) return { market: "Over/Under 2.5", prediction: "Over 2.5" };
  if (k.includes("over_9_5")) return { market: "Total Corners", prediction: "Over 9.5" };
  if (k.includes("over_3_5")) return { market: "Total Cards", prediction: "Over 3.5" };

  return { market: "Match Winner", prediction: "Home Win" };
}

function filterTopLeagues<T extends { league: string }>(rows: T[]): T[] {
  return rows.filter((x) => x.league && TOP_LEAGUES.has(x.league));
}

/** LOAD PREDICTIONS **/
export async function loadMLPredictions(): Promise<MLPrediction[]> {
  const body =
    (await fetchJSON("ai_predictions.json")) ||
    (await fetchJSON("predictions.json"));

  if (!body) return [];

  const raw = Array.isArray(body)
    ? body
    : Array.isArray(body.predictions)
    ? body.predictions
    : [];

  const mapped = raw.map((x: any, i: number) => {
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
      homeTeam: x.home_team || "Home",
      awayTeam: x.away_team || "Away",
      league: x.league || "Unknown League",
      market: mp.market,
      prediction: mp.prediction,
      confidence: conf <= 1 ? conf * 100 : conf,
    };
  });

  return filterTopLeagues(mapped);
}

/** LOAD GOLDEN BETS **/
export async function loadGoldenBets(): Promise<GoldenBet[]> {
  const body = await fetchJSON("golden_bets.json");
  if (!body) return [];

  const raw = Array.isArray(body)
    ? body
    : Array.isArray(body.golden_bets)
    ? body.golden_bets
    : [];

  const mapped = raw.map((x: any, i: number) => {
    const predicted = x.bet_type || x.prediction || "home_win";
    const mp = mapOutcome(predicted);

    const conf =
      typeof x.confidence === "number" ? x.confidence : 0.7;

    return {
      fixtureId: Number(x.fixture_id || x.match_id || i + 1),
      homeTeam: x.home_team || "",
      awayTeam: x.away_team || "",
      league: x.league || "",
      market: mp.market,
      prediction: mp.prediction,
      confidence: conf <= 1 ? conf * 100 : conf,
      odds: x.odds || x.bookmaker_odds || 0,
      aiExplanation: x.ai_explanation || x.reasoning || "",
      result: x.result,
      profitLoss: x.profit_loss,
    };
  });

  return filterTopLeagues(mapped);
}

/** LOAD VALUE BETS **/
export async function loadValueBets(): Promise<ValueBet[]> {
  const body = await fetchJSON("value_bets.json");
  if (!body) return [];

  const raw = Array.isArray(body)
    ? body
    : Array.isArray(body.value_bets)
    ? body.value_bets
    : [];

  const mapped = raw.map((x: any, i: number) => {
    const predicted = x.bet_type || x.prediction || "";
    const mp = mapOutcome(predicted);

    const prob =
      typeof x.model_probability === "number"
        ? x.model_probability
        : typeof x.confidence === "number"
        ? x.confidence
        : 0.5;

    return {
      fixtureId: Number(x.fixture_id || x.match_id || i + 1),
      homeTeam: x.home_team || "",
      awayTeam: x.away_team || "",
      league: x.league || "",
      market: mp.market,
      prediction: mp.prediction,
      confidence: prob <= 1 ? prob * 100 : prob,
      odds: x.odds || x.bookmaker_odds || 0,
      expectedValue: x.expected_value || 0,
      aiExplanation: x.ai_explanation || x.reasoning || "",
      result: x.result,
      profitLoss: x.profit_loss,
    };
  });

  return filterTopLeagues(mapped);
}
