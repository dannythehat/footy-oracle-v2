import { BetBuilder, IBetBuilder, IMarketPrediction } from '../models/BetBuilder.js';
import { BET_BUILDER_CONFIG, isLeagueSupported } from '../config/betBuilder.js';

/**
 * Fixture prediction data structure from ML output
 */
interface FixturePrediction {
  fixture_id: number;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
  predictions: {
    btts?: {
      yes_probability: number;
      confidence: number;
    };
    over_2_5_goals?: {
      over_probability: number;
      confidence: number;
    };
    over_9_5_corners?: {
      over_probability: number;
      confidence: number;
    };
    over_3_5_cards?: {
      over_probability: number;
      confidence: number;
    };
  };
}

/**
 * Bet Builder candidate with market details
 */
interface BetBuilderCandidate {
  fixture: FixturePrediction;
  markets: IMarketPrediction[];
  combinedConfidence: number;
  estimatedCombinedOdds: number;
}

/**
 * Calculate combined confidence from multiple markets
 * Uses weighted average based on individual confidences
 */
function calculateCombinedConfidence(markets: IMarketPrediction[]): number {
  if (markets.length === 0) return 0;
  
  // Simple average for now - can be enhanced with weighted formula
  const sum = markets.reduce((acc, m) => acc + m.confidence, 0);
  return Math.round(sum / markets.length);
}

/**
 * Calculate combined odds by multiplying individual market odds
 */
function calculateCombinedOdds(markets: IMarketPrediction[]): number {
  if (markets.length === 0) return 1;
  
  const combined = markets.reduce((acc, m) => acc * m.estimatedOdds, 1);
  return Math.round(combined * 100) / 100; // Round to 2 decimals
}

/**
 * Find bet builders from fixture predictions
 * 
 * @param predictions - Array of fixture predictions from ML output
 * @returns Array of bet builder candidates sorted by combined confidence
 */
export function findBetBuilders(predictions: FixturePrediction[]): BetBuilderCandidate[] {
  const betBuilders: BetBuilderCandidate[] = [];
  
  for (const fixture of predictions) {
    // Filter: Only top-tier leagues
    if (!isLeagueSupported(fixture.league)) {
      continue;
    }
    
    // Check each market for high confidence
    const highConfidenceMarkets: IMarketPrediction[] = [];
    
    // Check BTTS
    if (fixture.predictions.btts) {
      const { yes_probability, confidence } = fixture.predictions.btts;
      if (confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE && 
          yes_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY) {
        highConfidenceMarkets.push({
          market: 'btts',
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.btts,
          confidence,
          probability: yes_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.btts,
        });
      }
    }
    
    // Check Over 2.5 Goals
    if (fixture.predictions.over_2_5_goals) {
      const { over_probability, confidence } = fixture.predictions.over_2_5_goals;
      if (confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE && 
          over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY) {
        highConfidenceMarkets.push({
          market: 'over_2_5_goals',
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_2_5_goals,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_2_5_goals,
        });
      }
    }
    
    // Check Over 9.5 Corners
    if (fixture.predictions.over_9_5_corners) {
      const { over_probability, confidence } = fixture.predictions.over_9_5_corners;
      if (confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE && 
          over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY) {
        highConfidenceMarkets.push({
          market: 'over_9_5_corners',
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_9_5_corners,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_9_5_corners,
        });
      }
    }
    
    // Check Over 3.5 Cards
    if (fixture.predictions.over_3_5_cards) {
      const { over_probability, confidence } = fixture.predictions.over_3_5_cards;
      if (confidence >= BET_BUILDER_CONFIG.MIN_CONFIDENCE && 
          over_probability >= BET_BUILDER_CONFIG.MIN_PROBABILITY) {
        highConfidenceMarkets.push({
          market: 'over_3_5_cards',
          marketName: BET_BUILDER_CONFIG.MARKET_NAMES.over_3_5_cards,
          confidence,
          probability: over_probability,
          estimatedOdds: BET_BUILDER_CONFIG.MARKET_ODDS.over_3_5_cards,
        });
      }
    }
    
    // Bet Builder requires minimum number of markets
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
  
  // Sort by combined confidence (highest first)
  betBuilders.sort((a, b) => b.combinedConfidence - a.combinedConfidence);
  
  // Return top N bet builders
  return betBuilders.slice(0, BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}

/**
 * Save bet builders to database
 * 
 * @param candidates - Bet builder candidates to save
 * @param aiReasoningMap - Optional map of fixture IDs to AI reasoning
 * @returns Array of saved bet builder documents
 */
export async function saveBetBuilders(
  candidates: BetBuilderCandidate[],
  aiReasoningMap?: Map<number, string>
): Promise<IBetBuilder[]> {
  const savedBuilders: IBetBuilder[] = [];
  
  for (const candidate of candidates) {
    const { fixture, markets, combinedConfidence, estimatedCombinedOdds } = candidate;
    
    // Check if bet builder already exists for this fixture
    const existing = await BetBuilder.findOne({ fixtureId: fixture.fixture_id });
    
    if (existing) {
      // Update existing
      existing.markets = markets;
      existing.combinedConfidence = combinedConfidence;
      existing.estimatedCombinedOdds = estimatedCombinedOdds;
      
      if (aiReasoningMap?.has(fixture.fixture_id)) {
        existing.aiReasoning = aiReasoningMap.get(fixture.fixture_id);
      }
      
      await existing.save();
      savedBuilders.push(existing);
    } else {
      // Create new
      const betBuilder = new BetBuilder({
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
      
      await betBuilder.save();
      savedBuilders.push(betBuilder);
    }
  }
  
  return savedBuilders;
}

/**
 * Get today's bet builders from database
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
 * Get bet builders for a specific date
 */
export async function getBetBuildersByDate(date: Date): Promise<IBetBuilder[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  return await BetBuilder.find({
    date: { $gte: startOfDay, $lt: endOfDay },
  })
    .sort({ combinedConfidence: -1 })
    .limit(BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}

/**
 * Get historical bet builders with pagination
 */
export async function getHistoricalBetBuilders(
  startDate?: Date,
  endDate?: Date,
  page: number = 1,
  limit: number = 10
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
