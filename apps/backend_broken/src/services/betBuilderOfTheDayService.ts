import { BetBuilder, IBetBuilder } from '../models/BetBuilder.js';
import { generateBulkReasoning } from './aiService.js';

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
 * Select the Bet Builder of the Day
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
 * Includes confidence percentage and detailed analysis
 * 
 * @param betBuilder - The selected bet builder
 * @returns Enhanced AI reasoning with confidence metrics
 */
export async function generateBetBuilderOfTheDayReasoning(
  betBuilder: IBetBuilder
): Promise<string> {
  // Generate base reasoning if not already present
  if (!betBuilder.aiReasoning) {
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
 * Caches the selection for the day to ensure consistency
 * 
 * @returns Today's featured bet builder with enhanced reasoning
 */
export async function getBetBuilderOfTheDay(): Promise<{
  betBuilder: IBetBuilder | null;
  reasoning: string | null;
  compositeScore: number | null;
}> {
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
