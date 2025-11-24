import { Fixture, IFixture } from '../models/Fixture';
import { aiService } from './aiService';

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

class BettingInsightsService {
  /**
   * Calculate AI betting insights for a fixture
   * This runs 48 hours before kickoff
   */
  async calculateBettingInsights(fixture: IFixture): Promise<BettingInsightData> {
    try {
      // Fetch historical data, team stats, head-to-head
      const context = await this.gatherFixtureContext(fixture);
      
      // Calculate percentages for each bet type using AI
      const btsInsight = await this.calculateBTS(context);
      const over25Insight = await this.calculateOver25(context);
      const over35CardsInsight = await this.calculateOver35Cards(context);
      const over95CornersInsight = await this.calculateOver95Corners(context);

      // Determine golden bet (highest percentage)
      const goldenBet = this.determineGoldenBet({
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
   * Gather context data for AI analysis
   */
  private async gatherFixtureContext(fixture: IFixture) {
    // TODO: Integrate with API-Football to fetch:
    // - Team form (last 5 matches)
    // - Head-to-head history
    // - Goals scored/conceded averages
    // - Cards and corners statistics
    // - Home/away performance
    // - Injury news
    // - Weather conditions

    return {
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      date: fixture.date,
      // Mock data for now - replace with actual API calls
      homeForm: 'WWDWL',
      awayForm: 'WLWDW',
      h2hGoals: { avg: 3.2, over25: 0.75 },
      homeGoalsAvg: { scored: 2.1, conceded: 1.2 },
      awayGoalsAvg: { scored: 1.8, conceded: 1.5 },
      homeCardsAvg: 2.3,
      awayCardsAvg: 2.1,
      homeCornersAvg: 5.8,
      awayCornersAvg: 5.2
    };
  }

  /**
   * Calculate Both Teams to Score probability
   */
  private async calculateBTS(context: any): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    // Use AI model or statistical analysis
    // For now, using mock calculation based on goals averages
    const homeScoring = context.homeGoalsAvg.scored > 1.0;
    const awayScoring = context.awayGoalsAvg.scored > 1.0;
    
    let percentage = 50;
    if (homeScoring && awayScoring) {
      percentage = 65 + Math.random() * 20; // 65-85%
    } else if (homeScoring || awayScoring) {
      percentage = 45 + Math.random() * 20; // 45-65%
    } else {
      percentage = 30 + Math.random() * 20; // 30-50%
    }

    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Calculate Over 2.5 Goals probability
   */
  private async calculateOver25(context: any): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    const totalGoalsAvg = context.homeGoalsAvg.scored + context.awayGoalsAvg.scored;
    const h2hOver25Rate = context.h2hGoals.over25;
    
    let percentage = (totalGoalsAvg / 5) * 100; // Base on combined averages
    percentage = (percentage + h2hOver25Rate * 100) / 2; // Average with H2H rate
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Calculate Over 3.5 Cards probability
   */
  private async calculateOver35Cards(context: any): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
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
  private async calculateOver95Corners(context: any): Promise<{ percentage: number; confidence: 'high' | 'medium' | 'low' }> {
    const totalCornersAvg = context.homeCornersAvg + context.awayCornersAvg;
    
    let percentage = (totalCornersAvg / 12) * 100; // Base on 12 corners threshold
    
    const confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
    
    return { percentage: Math.round(percentage), confidence };
  }

  /**
   * Determine the golden bet (highest percentage)
   */
  private determineGoldenBet(
    insights: {
      bts: { percentage: number };
      over25: { percentage: number };
      over35cards: { percentage: number };
      over95corners: { percentage: number };
    },
    context: any
  ): { type: 'bts' | 'over25' | 'over35cards' | 'over95corners'; percentage: number; reasoning: string } {
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

    // Generate AI reasoning using GPT-4
    const reasoning = this.generateGoldenBetReasoning(golden.type, context);

    return {
      type: golden.type,
      percentage: golden.percentage,
      reasoning
    };
  }

  /**
   * Generate AI reasoning for golden bet
   */
  private generateGoldenBetReasoning(betType: string, context: any): string {
    // TODO: Use OpenAI GPT-4 to generate detailed reasoning
    // For now, using template-based reasoning
    
    const reasoningTemplates = {
      bts: `Both teams have strong attacking records. ${context.homeTeam} averaging ${context.homeGoalsAvg.scored} goals at home, while ${context.awayTeam} scoring ${context.awayGoalsAvg.scored} away. Historical H2H shows both teams scoring in majority of meetings.`,
      over25: `High-scoring fixture expected. Combined goals average of ${(context.homeGoalsAvg.scored + context.awayGoalsAvg.scored).toFixed(1)} per game. H2H history shows ${(context.h2hGoals.over25 * 100).toFixed(0)}% of matches going over 2.5 goals.`,
      over35cards: `Physical encounter anticipated. Both teams averaging ${((context.homeCardsAvg + context.awayCardsAvg) / 2).toFixed(1)} cards per game. Referee's strict approach in big matches typically results in 4+ cards.`,
      over95corners: `Attacking styles guarantee corners. ${context.homeTeam} averaging ${context.homeCornersAvg} corners at home, ${context.awayTeam} ${context.awayCornersAvg} away. Combined average of ${(context.homeCornersAvg + context.awayCornersAvg).toFixed(1)} corners per match.`
    };

    return reasoningTemplates[betType as keyof typeof reasoningTemplates] || 'Strong statistical indicators support this selection.';
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

    console.log(`Processing ${fixtures.length} fixtures for AI betting insights...`);

    for (const fixture of fixtures) {
      try {
        const insights = await this.calculateBettingInsights(fixture);
        await this.updateFixtureWithInsights(fixture.fixtureId, insights);
        console.log(`✓ Generated insights for ${fixture.homeTeam} vs ${fixture.awayTeam}`);
      } catch (error) {
        console.error(`✗ Failed to generate insights for fixture ${fixture.fixtureId}:`, error);
      }
    }

    console.log(`Completed processing ${fixtures.length} fixtures`);
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
