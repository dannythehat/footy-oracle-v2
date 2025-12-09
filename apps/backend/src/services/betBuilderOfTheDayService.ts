import { BetBuilder, IBetBuilder } from '../models/BetBuilder.js';
import { Fixture } from '../models/Fixture.js';
import { generateBulkReasoning } from './aiService.js';
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'https://football-ml-api.onrender.com';
const ML_API_TIMEOUT = 30000; // 30 seconds

/**
 * Format fixtures for ML API consumption
 */
function formatFixturesForML(fixtures: any[]) {
  return {
    matches: fixtures.map(f => ({
      id: f.fixtureId?.toString() || f._id?.toString(),
      home_team: f.homeTeam,
      away_team: f.awayTeam,
      date: f.date.toISOString(),
      league: f.league || 'Unknown',
      datetime: f.date.toISOString(),
      stats: {
        home_goals_avg: f.statistics?.home?.totalShots ? f.statistics.home.totalShots / 10 : 1.5,
        away_goals_avg: f.statistics?.away?.totalShots ? f.statistics.away.totalShots / 10 : 1.5,
        home_cards_avg: (f.statistics?.home?.yellowCards || 0) + (f.statistics?.home?.redCards || 0) * 2,
        away_cards_avg: (f.statistics?.away?.yellowCards || 0) + (f.statistics?.away?.redCards || 0) * 2,
        home_corners_avg: f.statistics?.home?.cornerKicks || 5.0,
        away_corners_avg: f.statistics?.away?.cornerKicks || 5.0
      },
      odds: {
        btts: f.odds?.btts || 1.70,
        goals: f.odds?.over25 || 1.85,
        corners: f.odds?.over95corners || 1.95,
        cards: f.odds?.over35cards || 2.20
      }
    }))
  };
}

/**
 * Calculate a composite score for bet builder selection
 * Balances confidence and odds for optimal value
 * 
 * Formula: (confidence * 0.6) + (normalized_odds * 0.4)
 * - Confidence weighted 60% (reliability)
 * - Odds weighted 40% (value)
 */
function calculateCompositeScore(betBuilder: IBetBuilder): number {
  const confidence = betBuilder.combinedConfidence;
  
  // Normalize odds to 0-100 scale (odds 1-10 -> 0-100)
  // Higher odds = higher score, but capped at 10x
  const normalizedOdds = Math.min((betBuilder.estimatedCombinedOdds - 1) * 11.11, 100);
  
  // Weighted composite score
  const score = (confidence * 0.6) + (normalizedOdds * 0.4);
  
  return Math.round(score * 100) / 100;
}

/**
 * Get Bet Builder of the Day from ML API
 * Fetches today's fixtures and calls ML API for analysis
 */
async function getBetBuilderFromMLAPI(): Promise<{
  betBuilder: IBetBuilder | null;
  reasoning: string | null;
  compositeScore: number | null;
}> {
  try {
    // Get today's fixtures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const fixtures = await Fixture.find({
      date: { $gte: today, $lte: endOfDay },
      status: { $in: ['scheduled', 'live'] }
    });
    
    if (fixtures.length === 0) {
      console.log('No fixtures available for Bet Builder of the Day');
      return { betBuilder: null, reasoning: null, compositeScore: null };
    }
    
    console.log(`🎯 Calling ML API for Bet Builder (${fixtures.length} fixtures)...`);
    
    const payload = formatFixturesForML(fixtures);
    
    const response = await axios.post(
      `${ML_API_URL}/api/v1/predictions/bet-builder-of-the-day`,
      payload,
      { timeout: ML_API_TIMEOUT }
    );
    
    if (!response.data || !response.data.bet_builder) {
      console.log('⚠️ ML API returned no bet builder');
      return { betBuilder: null, reasoning: null, compositeScore: null };
    }
    
    const mlBetBuilder = response.data.bet_builder;
    
    // Map ML response to our bet builder format
    const markets = mlBetBuilder.markets.map((m: any) => ({
      market: m.market,
      marketName: m.prediction,
      confidence: m.confidence,
      probability: m.confidence / 100,
      estimatedOdds: m.odds || 1.85
    }));
    
    // Create or update bet builder in database
    const betBuilderData = {
      fixtureId: parseInt(mlBetBuilder.match_id),
      date: new Date(mlBetBuilder.datetime || today),
      homeTeam: mlBetBuilder.home_team,
      awayTeam: mlBetBuilder.away_team,
      league: mlBetBuilder.league,
      kickoff: new Date(mlBetBuilder.datetime || today),
      markets,
      combinedConfidence: mlBetBuilder.combined_confidence,
      estimatedCombinedOdds: mlBetBuilder.combined_odds || 1.0,
      aiReasoning: mlBetBuilder.reasoning || ''
    };
    
    let betBuilder = await BetBuilder.findOne({ fixtureId: betBuilderData.fixtureId });
    
    if (betBuilder) {
      Object.assign(betBuilder, betBuilderData);
      await betBuilder.save();
    } else {
      betBuilder = new BetBuilder(betBuilderData);
      await betBuilder.save();
    }
    
    // Generate enhanced AI reasoning with GPT-4o-latest
    const reasoning = await generateBetBuilderOfTheDayReasoning(betBuilder);
    const compositeScore = calculateCompositeScore(betBuilder);
    
    console.log(`✅ Got Bet Builder of the Day from ML API: ${betBuilder.homeTeam} vs ${betBuilder.awayTeam}`);
    
    return {
      betBuilder,
      reasoning,
      compositeScore
    };
    
  } catch (error: any) {
    console.error('ML API error for Bet Builder:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('⚠️ ML API unavailable for Bet Builder');
    }
    
    return { betBuilder: null, reasoning: null, compositeScore: null };
  }
}

/**
 * Select the Bet Builder of the Day from database (fallback)
 * Uses ML-driven composite scoring to find the optimal balance
 * between confidence and value
 * 
 * @returns The best bet builder for today, or null if none available
 */
export async function selectBetBuilderOfTheDay(): Promise<IBetBuilder | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get all today's bet builders
  const betBuilders = await BetBuilder.find({
    date: { $gte: today, $lt: tomorrow },
  });
  
  if (betBuilders.length === 0) {
    return null;
  }
  
  // Calculate composite scores for all bet builders
  const scoredBuilders = betBuilders.map(bb => ({
    betBuilder: bb,
    score: calculateCompositeScore(bb),
  }));
  
  // Sort by composite score (highest first)
  scoredBuilders.sort((a, b) => b.score - a.score);
  
  // Return the top bet builder
  return scoredBuilders[0].betBuilder;
}

/**
 * Generate enhanced AI reasoning for Bet Builder of the Day
 * Uses GPT-4o-latest for friendly, detailed, humorous analysis
 * 
 * @param betBuilder - The selected bet builder
 * @returns Enhanced AI reasoning with confidence metrics
 */
export async function generateBetBuilderOfTheDayReasoning(
  betBuilder: IBetBuilder
): Promise<string> {
  // Generate base reasoning if not already present or enhance existing
  if (!betBuilder.aiReasoning || betBuilder.aiReasoning.length < 50) {
    const reasonings = await generateBulkReasoning([
      {
        homeTeam: betBuilder.homeTeam,
        awayTeam: betBuilder.awayTeam,
        league: betBuilder.league,
        market: 'Multi-Market Bet Builder',
        prediction: `${betBuilder.markets.map(m => m.marketName).join(' + ')}`,
        odds: betBuilder.estimatedCombinedOdds,
        confidence: betBuilder.combinedConfidence,
      },
    ]);
    
    betBuilder.aiReasoning = reasonings[0];
    await betBuilder.save();
  }
  
  // Enhance with confidence breakdown
  const marketBreakdown = betBuilder.markets
    .map(m => `${m.marketName}: ${m.confidence}%`)
    .join(', ');
  
  const enhancedReasoning = `
🎯 **BET BUILDER OF THE DAY** - ${betBuilder.combinedConfidence}% Confidence

**Market Convergence:**
${marketBreakdown}

**Combined Odds:** ${betBuilder.estimatedCombinedOdds.toFixed(2)}x
**Potential Return:** €10 → €${(10 * betBuilder.estimatedCombinedOdds).toFixed(2)}

**AI Analysis:**
${betBuilder.aiReasoning}

**Why This is Today's Top Pick:**
This bet builder represents the optimal balance between high confidence (${betBuilder.combinedConfidence}%) and strong value (${betBuilder.estimatedCombinedOdds.toFixed(2)}x odds). Our ML models show exceptional convergence across ${betBuilder.markets.length} markets, indicating a rare high-probability, high-value opportunity.
  `.trim();
  
  return enhancedReasoning;
}

/**
 * Get or create today's Bet Builder of the Day
 * Tries ML API first, falls back to database if unavailable
 * 
 * @returns Today's featured bet builder with enhanced reasoning
 */
export async function getBetBuilderOfTheDay(): Promise<{
  betBuilder: IBetBuilder | null;
  reasoning: string | null;
  compositeScore: number | null;
}> {
  // Try ML API first
  const mlResult = await getBetBuilderFromMLAPI();
  
  if (mlResult.betBuilder) {
    return mlResult;
  }
  
  // Fallback to database
  console.log('⚠️ Falling back to database for Bet Builder of the Day');
  const betBuilder = await selectBetBuilderOfTheDay();
  
  if (!betBuilder) {
    return {
      betBuilder: null,
      reasoning: null,
      compositeScore: null,
    };
  }
  
  const reasoning = await generateBetBuilderOfTheDayReasoning(betBuilder);
  const compositeScore = calculateCompositeScore(betBuilder);
  
  return {
    betBuilder,
    reasoning,
    compositeScore,
  };
}
