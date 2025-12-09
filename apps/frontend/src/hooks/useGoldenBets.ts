import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface GoldenBet {
  bet_id: string;
  fixture_id: string;
  league: string;
  home_team: string;
  away_team: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  ai_explanation: string;
  confidence: number;
  result: "win" | "loss" | "pending";
  profit_loss: number;
}

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

const mapGoldenBet = (raw: any, index: number): GoldenBet => {
  const fixtureId =
    raw.fixture_id ??
    raw.fixtureId ??
    raw.match_id ??
    raw.matchId ??
    null;

  const homeTeam = raw.home_team ?? raw.homeTeam ?? "";
  const awayTeam = raw.away_team ?? raw.awayTeam ?? "";

  const market = raw.market ?? raw.bet_type ?? raw.prediction ?? "";
  const selection = raw.selection ?? raw.prediction ?? raw.bet_type ?? market;

  const odds =
    typeof raw.odds === "number"
      ? raw.odds
      : typeof raw.bookmaker_odds === "number"
      ? raw.bookmaker_odds
      : 0;

  const aiProbability =
    typeof raw.ai_probability === "number"
      ? raw.ai_probability
      : typeof raw.model_probability === "number"
      ? raw.model_probability
      : typeof raw.confidence === "number"
      ? raw.confidence
      : 0;

  const explanation =
    raw.ai_explanation ??
    raw.reasoning ??
    "";

  const result: "win" | "loss" | "pending" =
    raw.result === "win" || raw.result === "loss" || raw.result === "pending"
      ? raw.result
      : "pending";

  const profitLoss =
    typeof raw.profit_loss === "number"
      ? raw.profit_loss
      : 0;

  const betId =
    raw.bet_id ??
    raw.id ??
    (fixtureId != null ? String(fixtureId) : "golden-" + index);

  return {
    bet_id: String(betId),
    fixture_id: fixtureId != null ? String(fixtureId) : String(betId),
    league: raw.league ?? "",
    home_team: homeTeam,
    away_team: awayTeam,
    market,
    selection,
    odds,
    ai_probability: aiProbability,
    ai_explanation: explanation,
    confidence: typeof raw.confidence === "number" ? raw.confidence : aiProbability,
    result,
    profit_loss: profitLoss,
  };
};

const fetchGoldenBets = async (): Promise<GoldenBet[]> => {
  const response = await api.get("/api/golden-bets/today");

  const body = response.data;

  const raw =
    Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : [];

  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const mapped = raw.map(mapGoldenBet);
  return mapped.filter((b) => b.league && TOP_LEAGUES.has(b.league));
};

export const useGoldenBets = () =>
  useQuery({
    queryKey: ["golden-bets-today"],
    queryFn: fetchGoldenBets,
    staleTime: 30000,
  });
