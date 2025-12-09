import fetch from "node-fetch";

// ===========================================================
// OPTION A — GitHub Raw ML Source
// ===========================================================

const BASE =
  "https://raw.githubusercontent.com/dannythehat/football-betting-ai-system/main/shared/ml_outputs_v2_v2";

async function loadJsonFile(filename: string) {
  const url = `${BASE}/${filename}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${filename} from GitHub Raw: ${res.status}`);
  }

  return res.json();
}

// -----------------------------------------------
// TOP 50 LEAGUES LIST
// -----------------------------------------------
const TOP_LEAGUES = new Set<string>([
  "Premier League",
  "Championship",
  "League One",
  "League Two",
  "La Liga",
  "Serie A",
  "Serie B",
  "Bundesliga",
  "2. Bundesliga",
  "Ligue 1",
  "Ligue 2",
  "Primeira Liga",
  "Eredivisie",
  "Belgian Pro League",
  "Scottish Premiership",
  "Super Lig",
  "Major League Soccer",
  "Brasileirao",
  "Argentine Primera Division",
  "A-League",
  "J1 League"
]);

function filterTopLeagues(data: any[]) {
  return data.filter(
    (x) => x.league && TOP_LEAGUES.has(x.league)
  );
}

// -----------------------------------------------
// PUBLIC LOADERS (Golden, Value, Predictions)
// -----------------------------------------------

export async function loadGoldenBets() {
  const data = await loadJsonFile("golden_bets.json");
  return filterTopLeagues(data);
}

export async function loadValueBets() {
  const data = await loadJsonFile("value_bets.json");
  return filterTopLeagues(data);
}

export async function loadMLPredictions() {
  const data = await loadJsonFile("ai_predictions.json");
  return filterTopLeagues(data);
}
