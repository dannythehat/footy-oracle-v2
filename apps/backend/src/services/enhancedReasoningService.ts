import { contextAggregationService, FixtureContext } from './contextAggregationService';
import { generateAIReasoning, AIReasoningInput } from './aiService';
import { openaiService } from './openaiService';

interface BetPrediction {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  odds: number;
  confidence: number;
}

interface EnhancedReasoningResult {
  reasoning: string;
  contextHighlights: string[];
  hasSignificantContext: boolean;
  contextSummary: string;
}

class EnhancedReasoningService {
  /**
   * Generate AI reasoning with full contextual awareness
   */
  async generateEnhancedReasoning(
    bet: BetPrediction,
    fixture: FixtureContext,
    statisticalContext?: {
      homeForm?: string;
      awayForm?: string;
      homeGoalsAvg?: { scored: number; conceded: number };
      awayGoalsAvg?: { scored: number; conceded: number };
      homeCardsAvg?: number;
      awayCardsAvg?: number;
      homeCornersAvg?: number;
      awayCornersAvg?: number;
      h2h?: any;
    }
  ): Promise<EnhancedReasoningResult> {
    // Gather all contextual data
    const fullContext = await contextAggregationService.gatherFullContext(fixture);

    // Build AI reasoning input with all available context
    const aiInput: AIReasoningInput = {
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      league: bet.league,
      market: bet.market,
      prediction: bet.prediction,
      odds: bet.odds,
      confidence: bet.confidence,
      
      // Enhanced context
      weather: fullContext.weather,
      weatherImpact: fullContext.weatherImpact,
      homeAbsences: fullContext.homeAbsences,
      awayAbsences: fullContext.awayAbsences,
      homeTactical: fullContext.homeTactical,
      awayTactical: fullContext.awayTactical,
      
      // Statistical context
      homeForm: statisticalContext?.homeForm,
      awayForm: statisticalContext?.awayForm,
      homeGoalsAvg: statisticalContext?.homeGoalsAvg,
      awayGoalsAvg: statisticalContext?.awayGoalsAvg,
    };

    // Generate reasoning
    const reasoning = await generateAIReasoning(aiInput);

    // Get context highlights
    const contextHighlights = contextAggregationService.getContextHighlights(fullContext);

    return {
      reasoning,
      contextHighlights,
      hasSignificantContext: contextAggregationService.hasSignificantContext(fullContext),
      contextSummary: fullContext.contextSummary
    };
  }

  /**
   * Generate reasoning for specific bet types (BTS, Over 2.5, etc.)
   */
  async generateBetTypeReasoning(
    betType: 'bts' | 'over25' | 'over35cards' | 'over95corners',
    percentage: number,
    fixture: FixtureContext,
    statisticalContext: {
      homeTeam: string;
      awayTeam: string;
      league: string;
      homeForm: string;
      awayForm: string;
      h2hGoals: { avg: number; over25: number };
      homeGoalsAvg: { scored: number; conceded: number };
      awayGoalsAvg: { scored: number; conceded: number };
      homeCardsAvg: number;
      awayCardsAvg: number;
      homeCornersAvg: number;
      awayCornersAvg: number;
      homeStanding?: { rank: number; points: number };
      awayStanding?: { rank: number; points: number };
      h2h?: any;
    }
  ): Promise<EnhancedReasoningResult> {
    // Gather contextual data
    const fullContext = await contextAggregationService.gatherFullContext(fixture);

    // Build context for OpenAI service
    const bettingContext = {
      ...statisticalContext,
      weather: fullContext.weather,
      weatherImpact: fullContext.weatherImpact,
      homeAbsences: fullContext.homeAbsences,
      awayAbsences: fullContext.awayAbsences,
      homeTactical: fullContext.homeTactical,
      awayTactical: fullContext.awayTactical,
      tacticalMatchup: fullContext.tacticalMatchup,
    };

    // Generate reasoning
    const reasoning = await openaiService.generateBettingReasoning(
      betType,
      percentage,
      bettingContext
    );

    // Get context highlights
    const contextHighlights = contextAggregationService.getContextHighlights(fullContext);

    return {
      reasoning,
      contextHighlights,
      hasSignificantContext: contextAggregationService.hasSignificantContext(fullContext),
      contextSummary: fullContext.contextSummary
    };
  }

  /**
   * Generate bulk reasoning for multiple bets
   */
  async generateBulkEnhancedReasoning(
    bets: BetPrediction[],
    fixtures: Map<number, FixtureContext>,
    statisticalContexts?: Map<number, any>
  ): Promise<Map<number, EnhancedReasoningResult>> {
    const results = new Map<number, EnhancedReasoningResult>();

    // Process in parallel for speed
    const promises = bets.map(async (bet) => {
      const fixture = fixtures.get(bet.fixtureId);
      if (!fixture) return null;

      const statContext = statisticalContexts?.get(bet.fixtureId);
      const result = await this.generateEnhancedReasoning(bet, fixture, statContext);
      
      return { fixtureId: bet.fixtureId, result };
    });

    const completed = await Promise.all(promises);

    for (const item of completed) {
      if (item) {
        results.set(item.fixtureId, item.result);
      }
    }

    return results;
  }

  /**
   * Get context preview without generating full reasoning
   * Useful for checking if enhanced context is available
   */
  async getContextPreview(fixture: FixtureContext): Promise<{
    hasWeather: boolean;
    hasInjuries: boolean;
    hasTactical: boolean;
    summary: string;
    highlights: string[];
  }> {
    const fullContext = await contextAggregationService.gatherFullContext(fixture);

    return {
      hasWeather: fullContext.weather !== undefined,
      hasInjuries: fullContext.homeAbsences.totalOut > 0 || fullContext.awayAbsences.totalOut > 0,
      hasTactical: fullContext.tacticalMatchup.tacticalAdvantage !== 'neutral',
      summary: fullContext.contextSummary,
      highlights: contextAggregationService.getContextHighlights(fullContext)
    };
  }
}

export const enhancedReasoningService = new EnhancedReasoningService();
export type { EnhancedReasoningResult };
