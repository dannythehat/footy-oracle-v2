/**
 * ORACLE SELECTION ENGINE
 * ----------------------
 * Pure decision engine. No IO. No side effects.
 */

import { SupportedMarketGroup } from "../config/supportedMarkets";

export interface BetCandidate {
  fixtureId: number;
  league: string;

  market: SupportedMarketGroup;
  line: string;              // e.g. "O2.5", "O9.5", "BTTS_YES"
  odds: number;              // decimal odds
  modelProbability: number;  // 0–1
}

export interface EvaluatedBet extends BetCandidate {
  impliedProbability: number;
  edge: number;
  expectedValue: number;
  goldenScore: number;
}

export interface FixtureOracleResult {
  fixtureId: number;
  goldenBet: EvaluatedBet | null;
}

export interface DailyOracleResult {
  fixtures: FixtureOracleResult[];

  topGoldenBets: EvaluatedBet[];
  topValueBets: EvaluatedBet[];

  betBuilder: {
    legs: EvaluatedBet[];
    combinedOdds: number;
    displayedOdds: number;
    combinedProbability: number;
  } | null;
}

/**
 * Tunable constants (LOCKED FOR V1)
 */
const MIN_ODDS = 1.6;
const MIN_PROB = 0.62;
const MIN_EDGE = 0.03;

// Bet Builder rules (V1)
const BUILDER_LEGS = 3;
const BUILDER_MIN_PROB = 0.70;
const BUILDER_MIN_ODDS = 1.40;
const BUILDER_MAX_ODDS = 2.10;
const BUILDER_REALISM_FACTOR = 0.75;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function evaluateCandidate(c: BetCandidate): EvaluatedBet {
  const impliedProbability = 1 / c.odds;
  const edge = c.modelProbability - impliedProbability;
  const expectedValue = (c.modelProbability * c.odds) - 1;

  const goldenScore =
    (0.55 * c.modelProbability) +
    (0.35 * edge) +
    (0.10 * clamp(expectedValue, 0, 0.2));

  return {
    ...c,
    impliedProbability,
    edge,
    expectedValue,
    goldenScore,
  };
}

function passesGoldenGate(bet: EvaluatedBet): boolean {
  return (
    bet.odds >= MIN_ODDS &&
    bet.modelProbability >= MIN_PROB &&
    bet.edge >= MIN_EDGE
  );
}

function buildBetBuilder(evaluated: EvaluatedBet[]) {
  // High-confidence leg pool
  const pool = evaluated
    .filter(b =>
      b.modelProbability >= BUILDER_MIN_PROB &&
      b.odds >= BUILDER_MIN_ODDS &&
      b.odds <= BUILDER_MAX_ODDS
    )
    // Prefer high prob, then value/edge
    .sort((a, b) => {
      if (b.modelProbability !== a.modelProbability) {
        return b.modelProbability - a.modelProbability;
      }
      return b.edge - a.edge;
    });

  const legs: EvaluatedBet[] = [];
  const usedFixtures = new Set<number>();

  for (const bet of pool) {
    if (legs.length >= BUILDER_LEGS) break;
    if (usedFixtures.has(bet.fixtureId)) continue; // V1: one leg per fixture
    legs.push(bet);
    usedFixtures.add(bet.fixtureId);
  }

  if (legs.length < BUILDER_LEGS) return null;

  const combinedOdds = legs.reduce((acc, b) => acc * b.odds, 1);
  const displayedOdds = combinedOdds * BUILDER_REALISM_FACTOR;
  const combinedProbability = legs.reduce((acc, b) => acc * b.modelProbability, 1);

  return {
    legs,
    combinedOdds,
    displayedOdds,
    combinedProbability,
  };
}

export function runOracleSelectionEngine(
  candidates: BetCandidate[]
): DailyOracleResult {

  const evaluated = candidates.map(evaluateCandidate);

  // Golden (per fixture + top 3)
  const goldenCandidates = evaluated.filter(passesGoldenGate);

  const fixturesMap = new Map<number, EvaluatedBet[]>();
  for (const bet of goldenCandidates) {
    if (!fixturesMap.has(bet.fixtureId)) fixturesMap.set(bet.fixtureId, []);
    fixturesMap.get(bet.fixtureId)!.push(bet);
  }

  const fixtures: FixtureOracleResult[] = [];
  const fixtureGoldenBets: EvaluatedBet[] = [];

  for (const [fixtureId, bets] of fixturesMap.entries()) {
    bets.sort((a, b) => b.goldenScore - a.goldenScore);
    const goldenBet = bets[0] ?? null;
    fixtures.push({ fixtureId, goldenBet });
    if (goldenBet) fixtureGoldenBets.push(goldenBet);
  }

  const topGoldenBets = [...fixtureGoldenBets]
    .sort((a, b) => b.goldenScore - a.goldenScore)
    .slice(0, 3);

  // Value (top 3)
  const topValueBets = [...evaluated]
    .filter(b => b.odds >= MIN_ODDS && b.edge >= 0.05)
    .sort((a, b) => b.edge - a.edge)
    .slice(0, 3);

  // Bet Builder of the Day
  const betBuilder = buildBetBuilder(evaluated);

  return {
    fixtures,
    topGoldenBets,
    topValueBets,
    betBuilder,
  };
}
