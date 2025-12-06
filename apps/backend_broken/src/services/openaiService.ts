import OpenAI from 'openai';

interface BettingContext {
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
  homeInjuries?: any[];
  awayInjuries?: any[];
  homeStanding?: { rank: number; points: number };
  awayStanding?: { rank: number; points: number };
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

class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  /**
   * Generate engaging, fact-driven betting reasoning with human touch
   */
  async generateBettingReasoning(
    betType: 'bts' | 'over25' | 'over35cards' | 'over95corners',
    percentage: number,
    context: BettingContext
  ): Promise<string> {
    const prompt = this.buildReasoningPrompt(betType, percentage, context);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(percentage)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // Higher for more personality
        max_tokens: 150
      });
      
      return completion.choices[0].message.content?.trim() || 'Analysis unavailable';
    } catch (error) {
      console.error('Error generating AI reasoning:', error);
      throw error;
    }
  }
  
  /**
   * System prompt with personality and confidence tiers
   */
  private getSystemPrompt(percentage: number): string {
    const confidenceLevel = this.getConfidenceLevel(percentage);
    
    return `You are a sharp football betting analyst with personality. You're knowledgeable, engaging, and occasionally witty.

CONFIDENCE TIERS:
- Below 60%: LOW 🔵 (cautious, mention risks)
- 60-75%: WARM 🟡 (solid pick, good value)
- 75%+: HOT 🔥 (strong conviction, back it confidently)

Current prediction: ${percentage}% (${confidenceLevel})

YOUR STYLE:
✅ Engaging and conversational (like talking to a mate who knows their stuff)
✅ Fact-driven - ALWAYS include specific numbers from the data
✅ Human touch - show personality, can be humorous when appropriate
✅ Lead with the strongest stat that supports the bet
✅ Reference actual form strings (WWDWL), goal averages, H2H rates
✅ 40-60 words MAXIMUM - be punchy and impactful

❌ Don't be boring or robotic
❌ Don't hedge excessively ("might", "could", "possibly")
❌ Don't ignore the data - numbers are your credibility
❌ Don't go over 60 words

EXAMPLES:

HOT (78%): "Both teams are leaking goals like sieves. Arsenal conceding 1.8/game at home, Liverpool 1.6 away, and both averaging 2+ goals scored. Their last 5 H2H meetings? All had BTS. This one's a banker. 🔥"

WARM (68%): "Solid value here. Combined 3.9 goals/game average between these two, and their H2H shows 70% over 2.5 rate. Not a guarantee, but the numbers are singing. 🟡"

LOW (52%): "Bit of a coin flip, honestly. Home form suggests it (WWDWL, 2.1 goals/game) but away team's defensive record (0.9 conceded) makes this risky. Proceed with caution. 🔵"

Remember: Show your research with REAL NUMBERS from the data. That's what separates us from guesswork.`;
  }
  
  /**
   * Build detailed prompt with all context data
   */
  private buildReasoningPrompt(
    betType: 'bts' | 'over25' | 'over35cards' | 'over95corners',
    percentage: number,
    context: BettingContext
  ): string {
    const betDescriptions = {
      bts: 'Both Teams to Score (BTS)',
      over25: 'Over 2.5 Goals',
      over35cards: 'Over 3.5 Cards',
      over95corners: 'Over 9.5 Corners'
    };
    
    const confidenceLevel = this.getConfidenceLevel(percentage);
    
    return `Generate betting reasoning for: ${betDescriptions[betType]}

MATCH: ${context.homeTeam} vs ${context.awayTeam}
LEAGUE: ${context.league}
PREDICTION: ${percentage}% (${confidenceLevel})

HOME TEAM (${context.homeTeam}):
- Recent Form: ${context.homeForm}
- Goals Scored: ${context.homeGoalsAvg.scored}/game (home)
- Goals Conceded: ${context.homeGoalsAvg.conceded}/game (home)
- Cards Average: ${context.homeCardsAvg}/game
- Corners Average: ${context.homeCornersAvg}/game
${context.homeStanding ? `- League Position: ${context.homeStanding.rank}` : ''}
${context.homeInjuries ? `- Key Injuries: ${context.homeInjuries.length}` : ''}

AWAY TEAM (${context.awayTeam}):
- Recent Form: ${context.awayForm}
- Goals Scored: ${context.awayGoalsAvg.scored}/game (away)
- Goals Conceded: ${context.awayGoalsAvg.conceded}/game (away)
- Cards Average: ${context.awayCardsAvg}/game
- Corners Average: ${context.awayCornersAvg}/game
${context.awayStanding ? `- League Position: ${context.awayStanding.rank}` : ''}
${context.awayInjuries ? `- Key Injuries: ${context.awayInjuries.length}` : ''}

HEAD-TO-HEAD:
${context.h2h ? `- Last ${context.h2h.stats.totalMatches} meetings
- Average Goals: ${context.h2h.stats.avgGoals}
- Over 2.5 Rate: ${(context.h2h.stats.over25Rate * 100).toFixed(0)}%
- BTS Rate: ${(context.h2h.stats.btsRate * 100).toFixed(0)}%
- Average Corners: ${context.h2h.stats.avgCorners}
- Average Cards: ${context.h2h.stats.avgCards}` : '- Limited H2H data available'}

Write an engaging, fact-driven analysis (40-60 words) that:
1. Leads with the strongest stat supporting this ${percentage}% prediction
2. Includes 2-3 specific numbers from the data above
3. Matches the ${confidenceLevel} confidence level in tone
4. Has personality - be conversational, can add humor if it fits
5. Shows we did our research with real data

Remember: ${confidenceLevel === 'HOT 🔥' ? 'Be confident and punchy!' : confidenceLevel === 'WARM 🟡' ? 'Solid pick, show the value!' : 'Be cautious, mention the risks!'}`;
  }
  
  /**
   * Determine confidence level based on percentage
   */
  private getConfidenceLevel(percentage: number): string {
    if (percentage >= 75) return 'HOT 🔥';
    if (percentage >= 60) return 'WARM 🟡';
    return 'LOW 🔵';
  }
  
  /**
   * Get confidence emoji for display
   */
  getConfidenceEmoji(percentage: number): string {
    if (percentage >= 75) return '🔥';
    if (percentage >= 60) return '🟡';
    return '🔵';
  }
  
  /**
   * Get confidence label for display
   */
  getConfidenceLabel(percentage: number): string {
    if (percentage >= 75) return 'HOT';
    if (percentage >= 60) return 'WARM';
    return 'LOW';
  }
}

export const openaiService = new OpenAIService();
