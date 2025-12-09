import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface ValueBet {
  bet_id: string;
  fixture_id: string;
  league: string;
  home_team: string;
  away_team: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  value: number;
  ai_explanation: string;
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

const mapValueBet = (raw: any, index: number): ValueBet => {
  const fixtureId =
    raw.fixture_id ??
    raw.fixtureId ??
    raw.match_id ??
    raw.matchId ??
    null;

  const homeTeam = raw.home_team ?? raw.homeTeam ?? "";
  const awayTeam = raw.away_team ?? raw.awayTeam ?? "";

  const market = raw.market ?? raw.bet_type ?? "";
  const selection = raw.selection ?? raw.bet_type ?? market;

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
      : 0;

  const value =
    typeof raw.value === "number"
      ? raw.value
      : typeof raw.expected_value === "number"
      ? raw.expected_value
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
    (fixtureId != null ? String(fixtureId) : "value-" + index);

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
    value,
    ai_explanation: explanation,
    result,
    profit_loss: profitLoss,
  };
};

const fetchValueBets = async (): Promise<ValueBet[]> => {
  const response = await api.get("/api/value-bets/today");

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

  const mapped = raw.map(mapValueBet);
  return mapped.filter((b) => b.league && TOP_LEAGUES.has(b.league));
};

export const useValueBets = () =>
  useQuery({
    queryKey: ["value-bets-today"],
    queryFn: fetchValueBets,
    staleTime: 30000,
  });
