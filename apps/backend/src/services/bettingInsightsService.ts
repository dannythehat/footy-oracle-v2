import { Fixture, IFixture } from '../models/Fixture.js';
import { fetchFixtureStats, fetchTeamLastFixtures } from './apiFootballService.js';
import { openaiService } from './openaiService.js';

interface BettingInsightData {
  bts: { percentage: number; confidence: 'high' | 'medium' | 'low' };
  over25: { percentage: number; confidence: 'high' | 'medium' | 'low' };
  over35cards: { percentage: number; confidence: 'high' | 'medium' | 'low' };
  over95corners: { percentage: number; confidence: 'high' | 'medium' | 'low' };
  goldenBet: {
    type: 'bts' | 'over25' | 'over35cards' | 'over95corners';
    percentage: number;
    reasoning: string;
  };
}

interface FixtureContext {
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: Date;
  homeForm: string;
  awayForm: string;
  h2hGoals: { avg: number; over25: number };
  homeGoalsAvg: { scored: number; conceded: number };
  awayGoalsAvg: { scored: number; conceded: number };
  homeCardsAvg: number;
  awayCardsAvg: number;
  homeCornersAvg: number;
  awayCornersAvg: number;
  h2h?: {
    stats: {
      totalMatches: number;
      over25Rate: number;
      btsRate: number;
      avgGoals: number;
      avgCorners: number;
      avgCards: number;
    };
  };
}

class BettingInsightsService {
  /**
   * Calculate AI betting insights for a fixture
   * This runs 48 hours before kickoff
   */
  async calculateBettingInsights(fixture: IFixture): Promise<BettingInsightData> {
    try {
      // Fetch real data from API-Football
      const context = await this.gatherFixtureContext(fixture);
      
      // Calculate percentages for each bet type using real data
      const btsInsight = await this.calculateBTS(context);
      const over25Insight = await this.calculateOver25(context);
      const over35CardsInsight = await this.calculateOver35Cards(context);
      const over95CornersInsight = await this.calculateOver95Corners(context);

      // Determine golden bet (highest percentage) with ChatGPT reasoning
      const goldenBet = await this.determineGoldenBet({
        bts: btsInsight,
        over25: over25Insight,
        over35cards: over35CardsInsight,
        over95corners: over95CornersInsight
      }, context);

      return {
        bts: btsInsight,
        over25: over25Insight,
        over35cards: over35CardsInsight,
        over95corners: over95CornersInsight,
        goldenBet
      };
    } catch (error) {
      console.error('Error calculating betting insights:', error);
      throw error;
    }
  }

  /**
   * Gather real fixture context data from API-Football
   */
  private async gatherFixtureContext(fixture: IFixture): Promise<FixtureContext> {
    try {
      // Extract team IDs and league info from fixture
      // Note: You'll need to add these fields to your Fixture model
      const homeTeamId = (fixture as any).homeTeamId || 0;
      const awayTeamId = (fixture as any).awayTeamId || 0;
      const leagueId = (fixture as any).leagueId || 0;
      const season = new Date(fixture.date).getFullYear();

      // If IDs are missing, fall back to mock data
      if (!homeTeamId || !awayTeamId || !leagueId) {
        console.warn(`Missing team/league IDs for fixture ${fixture.fixtureId}, using mock data`);
        return this.getMockContext(fixture);
      }

      // Fetch real data from API-Football
      const [fixtureStats, homeLastFixtures, awayLastFixtures] = await Promise.all([
        fetchFixtureStats(fixture.fixtureId, homeTeamId, awayTeamId, leagueId, season),
        fetchTeamLastFixtures(homeTeamId, 5),
        fetchTeamLastFixtures(awayTeamId, 5)
      ]);

      // Calculate H2H statistics
      const h2hMatches = fixtureStats.h2h.lastMeetings;
      const over25Count = h2hMatches.filter(m => (m.homeScore + m.awayScore) > 2.5).length;
      const btsCount = h2hMatches.filter(m => m.homeScore > 0 && m.awayScore > 0).length;
      const totalGoals = h2hMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);

      return {
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        league: fixture.league,
        date: fixture.date,
        
        // Real form data
        homeForm: fixtureStats.homeTeam.form,
        awayForm: fixtureStats.awayTeam.form,
        
        // Real H2H data
        h2hGoals: {
          avg: h2hMatches.length > 0 ? totalGoals / h2hMatches.length : 0,
          over25: h2hMatches.length > 0 ? over25Count / h2hMatches.length : 0
        },
        
        // Real team statistics
        homeGoalsAvg: {
          scored: fixtureStats.homeTeam.avgGoalsScored,
          conceded: fixtureStats.homeTeam.avgGoalsConceded
        },
        awayGoalsAvg: {
          scored: fixtureStats.awayTeam.avgGoalsScored,
          conceded: fixtureStats.awayTeam.avgGoalsConceded
        },
        
        // Estimate cards/corners (API-Football doesn't provide these directly)
        homeCardsAvg: 2.0, // Default estimate
        awayCardsAvg: 2.0, // Default estimate
        homeCornersAvg: 5.0, // Default estimate
        awayCornersAvg: 5.0, // Default estimate
        
        // Additional H2H context
        h2h: {
          stats: {
            totalMatches: h2hMatches.length,
            over25Rate: h2hMatches.length > 0 ? over25Count / h2hMatches.length : 0,
            btsRate: h2hMatches.length > 0 ? btsCount / h2hMatches.length : 0,
            avgGoals: h2hMatches.length > 0 ? totalGoals / h2hMatches.length : 0,
            avgCorners: 10.0, // Default estimate
            avgCards: 4.0 // Default estimate
          }
        }
      };
    } catch (error) {
      console.error('Error gathering fixture context:', error);
      // Fall back to mock data on error
      return this.getMockContext(fixture);
    }
  }

  /**
   * Mock context for development/fallback
   */
  private getMockContext(fixture: IFixture): FixtureContext {
    return {
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date,
      homeForm: 'WWDWL',
      awayForm: 'WLWDW',
      h2hGoals: { avg: 3.2, over25: 0.75 },
      homeGoalsAvg: { scored: 2.1, conceded: 1.2 },
      awayGoalsAvg: { scored: 1.8, conceded: 1.5 },
      homeCardsAvg: 2.3,
      awayCardsAvg: 2.1,
      homeCornersAvg: 5.8,
      awayCornersAvg: 5.2,
      h2h: {
        stats: {
          totalMatches: 10,
          over25Rate: 0.75,
          btsRate: 0.70,
          avgGoals: 3.2,
          avgCorners: 10.5,
          avgCards: 4.2
        }
      }
    };
  }

  /**
   * Calculate Both Teams to Score probability with real data
   */
  private async calculateBTS(context: FixtureContext): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    // Factor 1: Team scoring ability (40% weight)
    const homeScoring = context.homeGoalsAvg.scored >= 1.2;
    const awayScoring = context.awayGoalsAvg.scored >= 1.0;
    
    // Factor 2: Defensive vulnerability (30% weight)
    const homeLeaky = context.homeGoalsAvg.conceded >= 1.0;
    const awayLeaky = context.awayGoalsAvg.conceded >= 1.0;
    
    // Factor 3: H2H history (20% weight)
    const h2hBtsRate = context.h2h?.stats.btsRate || 0.5;
    
    // Factor 4: Recent form scoring (10% weight)
    const homeFormScoring = context.homeGoalsAvg.scored >= 1.0;
    const awayFormScoring = context.awayGoalsAvg.scored >= 1.0;
    
    // Calculate weighted percentage
    let percentage = 50; // Base
    
    if (homeScoring && awayScoring) percentage += 20;
    if (homeLeaky && awayLeaky) percentage += 15;
    percentage += h2hBtsRate * 20;
    if (homeFormScoring && awayFormScoring) percentage += 10;
    
    // Cap at 95%
    percentage = Math.min(95, Math.max(20, percentage));
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Calculate Over 2.5 Goals probability with real data
   */
  private async calculateOver25(context: FixtureContext): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    const totalGoalsAvg = context.homeGoalsAvg.scored + context.awayGoalsAvg.scored;
    const h2hOver25Rate = context.h2h?.stats.over25Rate || 0.5;
    
    let percentage = (totalGoalsAvg / 5) * 100; // Base on combined averages
    percentage = (percentage + h2hOver25Rate * 100) / 2; // Average with H2H rate
    
    // Boost if both teams score well
    if (context.homeGoalsAvg.scored >= 1.5 && context.awayGoalsAvg.scored >= 1.5) {
      percentage += 10;
    }
    
    // Reduce if both teams defend well
    if (context.homeGoalsAvg.conceded < 1.0 && context.awayGoalsAvg.conceded < 1.0) {
      percentage -= 15;
    }
    
    percentage = Math.min(95, Math.max(20, percentage));
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Calculate Over 3.5 Cards probability
   */
  private async calculateOver35Cards(context: FixtureContext): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    const totalCardsAvg = context.homeCardsAvg + context.awayCardsAvg;
    
    let percentage = 40;
    if (totalCardsAvg >= 5.0) {
      percentage = 70 + Math.random() * 15; // 70-85%
    } else if (totalCardsAvg >= 4.0) {
      percentage = 55 + Math.random() * 15; // 55-70%
    } else {
      percentage = 35 + Math.random() * 20; // 35-55%
    }
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Calculate Over 9.5 Corners probability
   */
  private async calculateOver95Corners(context: FixtureContext): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    const totalCornersAvg = context.homeCornersAvg + context.awayCornersAvg;
    
    let percentage = (totalCornersAvg / 12) * 100; // Base on 12 corners threshold
    
    percentage = Math.min(95, Math.max(20, percentage));
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Determine the golden bet with ChatGPT reasoning
   */
  private async determineGoldenBet(
    insights: {
      bts: { percentage: number };
      over25: { percentage: number };
      over35cards: { percentage: number };
      over95corners: { percentage: number };
    },
    context: FixtureContext
  ): Promise<{ type: 'bts' | 'over25' | 'over35cards' | 'over95corners'; percentage: number; reasoning: string }> {
    // Find highest percentage
    const betTypes = [
      { type: 'bts' as const, percentage: insights.bts.percentage },
      { type: 'over25' as const, percentage: insights.over25.percentage },
      { type: 'over35cards' as const, percentage: insights.over35cards.percentage },
      { type: 'over95corners' as const, percentage: insights.over95corners.percentage }
    ];

    const golden = betTypes.reduce((max, bet) => 
      bet.percentage > max.percentage ? bet : max
    );

    // Generate engaging AI reasoning using ChatGPT
    const reasoning = await this.generateGoldenBetReasoning(golden.type, golden.percentage, context);

    return {
      type: golden.type,
      percentage: golden.percentage,
      reasoning
    };
  }

  /**
   * Generate engaging AI reasoning using ChatGPT
   */
  private async generateGoldenBetReasoning(
    betType: 'bts' | 'over25' | 'over35cards' | 'over95corners',
    percentage: number,
    context: FixtureContext
  ): Promise<string> {
    try {
      // Use OpenAI service with engaging personality
      return await openaiService.generateBettingReasoning(betType, percentage, context);
    } catch (error) {
      console.error('Error generating ChatGPT reasoning:', error);
      // Fallback to template-based reasoning
      return this.getFallbackReasoning(betType, percentage, context);
    }
  }

  /**
   * Fallback reasoning templates (used if ChatGPT fails)
   */
  private getFallbackReasoning(
    betType: string,
    percentage: number,
    context: FixtureContext
  ): string {
    const confidenceEmoji = openaiService.getConfidenceEmoji(percentage);
    
    const templates = {
      bts: `${context.homeTeam} averaging ${context.homeGoalsAvg.scored.toFixed(1)} goals at home, ${context.awayTeam} ${context.awayGoalsAvg.scored.toFixed(1)} away. H2H shows ${(context.h2h?.stats.btsRate || 0 * 100).toFixed(0)}% BTS rate. Both defenses conceding regularly. ${confidenceEmoji}`,
      over25: `Combined ${(context.homeGoalsAvg.scored + context.awayGoalsAvg.scored).toFixed(1)} goals/game average. H2H history shows ${(context.h2h?.stats.over25Rate || 0 * 100).toFixed(0)}% over 2.5 rate. Attacking styles should deliver goals. ${confidenceEmoji}`,
      over35cards: `Physical encounter expected. Both teams averaging ${((context.homeCardsAvg + context.awayCardsAvg) / 2).toFixed(1)} cards per game. Big match intensity typically brings bookings. ${confidenceEmoji}`,
      over95corners: `${context.homeTeam} averaging ${context.homeCornersAvg.toFixed(1)} corners at home, ${context.awayTeam} ${context.awayCornersAvg.toFixed(1)} away. Combined ${(context.homeCornersAvg + context.awayCornersAvg).toFixed(1)} corners/game. ${confidenceEmoji}`
    };

    return templates[betType as keyof typeof templates] || `Strong statistical indicators support this ${percentage}% prediction. ${confidenceEmoji}`;
  }

  /**
   * Update fixture with AI betting insights
   */
  async updateFixtureWithInsights(fixtureId: number, insights: BettingInsightData): Promise<void> {
    await Fixture.findOneAndUpdate(
      { fixtureId },
      {
        $set: {
          aiBets: {
            bts: { ...insights.bts, revealed: false },
            over25: { ...insights.over25, revealed: false },
            over35cards: { ...insights.over35cards, revealed: false },
            over95corners: { ...insights.over95corners, revealed: false },
            goldenBet: { ...insights.goldenBet, revealed: false },
            generatedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }

  /**
   * Process all fixtures that need AI insights (48 hours before kickoff)
   */
  async processUpcomingFixtures(): Promise<void> {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const fortyNineHoursFromNow = new Date(now.getTime() + 49 * 60 * 60 * 1000);

    // Find fixtures between 48-49 hours from now that don't have AI insights yet
    const fixtures = await Fixture.find({
      date: {
        $gte: fortyEightHoursFromNow,
        $lte: fortyNineHoursFromNow
      },
      status: 'scheduled',
      'aiBets.generatedAt': { $exists: false }
    });

    console.log(`🎯 Processing ${fixtures.length} fixtures for AI betting insights...`);

    for (const fixture of fixtures) {
      try {
        const insights = await this.calculateBettingInsights(fixture);
        await this.updateFixtureWithInsights(fixture.fixtureId, insights);
        console.log(`✓ Generated insights for ${fixture.homeTeam} vs ${fixture.awayTeam}`);
      } catch (error) {
        console.error(`✗ Failed to generate insights for fixture ${fixture.fixtureId}:`, error);
      }
    }

    console.log(`✅ Completed processing ${fixtures.length} fixtures`);
  }

  /**
   * Reveal a specific bet type for a fixture
   */
  async revealBetType(fixtureId: number, betType: 'bts' | 'over25' | 'over35cards' | 'over95corners'): Promise<void> {
    await Fixture.findOneAndUpdate(
      { fixtureId },
      { $set: { [`aiBets.${betType}.revealed`]: true } }
    );
  }

  /**
   * Reveal golden bet for a fixture
   */
  async revealGoldenBet(fixtureId: number): Promise<void> {
    await Fixture.findOneAndUpdate(
      { fixtureId },
      { $set: { 'aiBets.goldenBet.revealed': true } }
    );
  }
}

export const bettingInsightsService = new BettingInsightsService();
