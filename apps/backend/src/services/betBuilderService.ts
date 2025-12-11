import { BetBuilder, IBetBuilder, IMarketPrediction } from "../models/BetBuilder.js";
import { BET_BUILDER_CONFIG, isLeagueSupported } from "../config/betBuilder.js";
import { isPremiumLeague } from "./leagueFilter.js";

/**
 * Fixture prediction structure
 */
interface FixturePrediction {
  fixture_id: number;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
  [key: string]: any; // dynamic fields such as leagueId
}

interface BetBuilderCandidate {
  fixture: FixturePrediction;
  markets: IMarketPrediction[];
  combinedConfidence: number;
  estimatedCombinedOdds: number;
}

/**
 * Combined confidence
 */
function calculateCombinedConfidence(markets: IMarketPrediction[]): number {
  if (markets.length === 0) return 0;
  const sum = markets.reduce((acc, m) => acc + m.confidence, 0);
  return Math.round(sum / markets.length);
}

/**
 * Combined odds
 */
function calculateCombinedOdds(markets: IMarketPrediction[]): number {
  if (markets.length === 0) return 1;
  const combined = markets.reduce((acc, m) => acc * m.estimatedOdds, 1);
  return Math.round(combined * 100) / 100;
}

/**
 * MAIN BET BUILDER FILTERING LOGIC
 * NOW USES leagueId ? PREMIUM LEAGUES
 */
export function findBetBuilders(predictions: FixturePrediction[]): BetBuilderCandidate[] {
  const betBuilders: BetBuilderCandidate[] = [];

  for (const fixture of predictions) {
    const fx: any = fixture;

    // PRIMARY: numeric leagueId filtering
    const leagueId: number | undefined =
      typeof fx.leagueId === "number"
        ? fx.leagueId
        : typeof fx.league_id === "number"
        ? fx.league_id
        : undefined;

    if (typeof leagueId === "number") {
      if (!isPremiumLeague(leagueId)) continue;
    } else {
      // FALLBACK to name-based (only if ID missing)
      if (!isLeagueSupported(fixture.league)) continue;
    }

    // MARKET EXTRACTION
    const highConfidenceMarkets: IMarketPrediction[] = [];

    // BTTS
    if (fixture.predictions.btts) {
      const { yes_probability, confidence } = fixture.predictions.btts;
      if (
        confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
        yes_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY
      ) {
        highConfidenceMarkets.push({
          market: "btts",
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.btts,
          confidence,
          probability: yes_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.btts,
        });
      }
    }

    // Over 2.5 Goals
    if (fixture.predictions.over_2_5_goals) {
      const { over_probability, confidence } = fixture.predictions.over_2_5_goals;
      if (
        confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
        over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY
      ) {
        highConfidenceMarkets.push({
          market: "over_2_5_goals",
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_2_5_goals,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_2_5_goals,
        });
      }
    }

    // Over 9.5 Corners
    if (fixture.predictions.over_9_5_corners) {
      const { over_probability, confidence } = fixture.predictions.over_9_5_corners;
      if (
        confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
        over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY
      ) {
        highConfidenceMarkets.push({
          market: "over_9_5_corners",
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_9_5_corners,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_9_5_corners,
        });
      }
    }

    // Over 3.5 Cards
    if (fixture.predictions.over_3_5_cards) {
      const { over_probability, confidence } = fixture.predictions.over_3_5_cards;
      if (
        confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
        over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY
      ) {
        highConfidenceMarkets.push({
          market: "over_3_5_cards",
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_3_5_cards,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_3_5_cards,
        });
      }
    }

    // **MINIMUM MARKETS**
    if (highConfidenceMarkets.length >= BET_BUILDER_CONFIG.MIN_MARKETS) {
      const combinedConfidence = calculateCombinedConfidence(highConfidenceMarkets);
      const estimatedCombinedOdds = calculateCombinedOdds(highConfidenceMarkets);

      betBuilders.push({
        fixture,
        markets: highConfidenceMarkets,
        combinedConfidence,
        estimatedCombinedOdds,
      });
    }
  }

  // Sort by confidence
  betBuilders.sort((a, b) => b.combinedConfidence - a.combinedConfidence);

  return betBuilders.slice(0, BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}

/**
 * SAVE BET BUILDERS
 */
export async function saveBetBuilders(
  candidates: BetBuilderCandidate[],
  aiReasoningMap?: Map<number, string>
): Promise<IBetBuilder[]> {
  const saved: IBetBuilder[] = [];

  for (const candidate of candidates) {
    const { fixture, markets, combinedConfidence, estimatedCombinedOdds } = candidate;

    const existing = await BetBuilder.findOne({ fixtureId: fixture.fixture_id });

    if (existing) {
      existing.markets = markets;
      existing.combinedConfidence = combinedConfidence;
      existing.estimatedCombinedOdds = estimatedCombinedOdds;

      if (aiReasoningMap?.has(fixture.fixture_id)) {
        existing.aiReasoning = aiReasoningMap.get(fixture.fixture_id);
      }

      await existing.save();
      saved.push(existing);
    } else {
      const doc = new BetBuilder({
        fixtureId: fixture.fixture_id,
        date: new Date(fixture.kickoff),
        homeTeam: fixture.home_team,
        awayTeam: fixture.away_team,
        league: fixture.league,
        kickoff: new Date(fixture.kickoff),
        markets,
        combinedConfidence,
        estimatedCombinedOdds,
        aiReasoning: aiReasoningMap?.get(fixture.fixture_id),
      });

      await doc.save();
      saved.push(doc);
    }
  }

  return saved;
}

/**
 * GET TODAY'S BET BUILDERS
 */
export async function getTodaysBetBuilders(): Promise<IBetBuilder[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await BetBuilder.find({
    date: { $gte: today, $lt: tomorrow },
  })
    .sort({ combinedConfidence: -1 })
    .limit(BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}

/**
 * GET BY DATE
 */
export async function getBetBuildersByDate(date: Date): Promise<IBetBuilder[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return await BetBuilder.find({
    date: { $gte: start, $lt: end },
  })
    .sort({ combinedConfidence: -1 })
    .limit(BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}

/**
 * HISTORICAL
 */
export async function getHistoricalBetBuilders(
  startDate?: Date,
  endDate?: Date,
  page = 1,
  limit = 10
): Promise<{ builders: IBetBuilder[]; total: number; pages: number }> {
  const query: any = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const skip = (page - 1) * limit;

  const [builders, total] = await Promise.all([
    BetBuilder.find(query)
      .sort({ date: -1, combinedConfidence: -1 })
      .skip(skip)
      .limit(limit),
    BetBuilder.countDocuments(query),
  ]);

  return {
    builders,
    total,
    pages: Math.ceil(total / limit),
  };
}
