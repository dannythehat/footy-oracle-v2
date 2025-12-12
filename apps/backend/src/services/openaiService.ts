import OpenAI from 'openai';
import { WeatherData } from './weatherService';
import { TeamAbsences } from './injuryService';
import { TacticalProfile, MatchupAnalysis } from './tacticalService';

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
  
  // NEW: Enhanced context
  weather?: WeatherData;
  weatherImpact?: string;
  homeAbsences?: TeamAbsences;
  awayAbsences?: TeamAbsences;
  homeTactical?: TacticalProfile;
  awayTactical?: TacticalProfile;
  tacticalMatchup?: MatchupAnalysis;
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
        model: process.env.OPENAI_MODEL || 'chatgpt-4o-latest',
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
        max_tokens: 200 // Increased for richer context
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
✅ USE CONTEXTUAL DATA - weather, injuries, tactics when available
✅ 50-70 words MAXIMUM - be punchy and impactful

❌ Don't be boring or robotic
❌ Don't hedge excessively ("might", "could", "possibly")
❌ Don't ignore the data - numbers are your credibility
❌ Don't go over 70 words

EXAMPLES WITH CONTEXT:

HOT (78%) with injuries: "Both teams are leaking goals like sieves. Arsenal conceding 1.8/game at home, Liverpool 1.6 away. Plus Liverpool missing Salah (their top scorer) - that's 0.8 goals/game gone. Their last 5 H2H? All had BTS. This one's a banker. 🔥"

WARM (68%) with weather: "Solid value here. Combined 3.9 goals/game average, and heavy rain expected which favors mistakes. Their H2H shows 70% over 2.5 rate. Not a guarantee, but the numbers are singing. 🟡"

WARM (65%) with tactics: "Home team's high press (4-3-3) vs away's short build-up play? Recipe for turnovers. Add in 2.1 goals/game home average and away's leaky defense (1.4 conceded). Tactical mismatch screams goals. 🟡"

LOW (52%) with context: "Bit of a coin flip. Home form suggests it (WWDWL, 2.1 goals/game) but away team's defensive record (0.9 conceded) is solid. Plus they're missing 3 key players. Proceed with caution. 🔵"

Remember: Show your research with REAL NUMBERS and CONTEXT from the data. That's what separates us from guesswork.`;
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
    
    let prompt = `Generate betting reasoning for: ${betDescriptions[betType]}

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

AWAY TEAM (${context.awayTeam}):
- Recent Form: ${context.awayForm}
- Goals Scored: ${context.awayGoalsAvg.scored}/game (away)
- Goals Conceded: ${context.awayGoalsAvg.conceded}/game (away)
- Cards Average: ${context.awayCardsAvg}/game
- Corners Average: ${context.awayCornersAvg}/game
${context.awayStanding ? `- League Position: ${context.awayStanding.rank}` : ''}

HEAD-TO-HEAD:
${context.h2h ? `- Last ${context.h2h.stats.totalMatches} meetings
- Average Goals: ${context.h2h.stats.avgGoals}
- Over 2.5 Rate: ${(context.h2h.stats.over25Rate * 100).toFixed(0)}%
- BTS Rate: ${(context.h2h.stats.btsRate * 100).toFixed(0)}%
- Average Corners: ${context.h2h.stats.avgCorners}
- Average Cards: ${context.h2h.stats.avgCards}` : '- Limited H2H data available'}`;

    // Add weather context if available
    if (context.weather && context.weatherImpact) {
      prompt += `\n\n🌤️ WEATHER CONDITIONS:
- ${context.weather.description} (${context.weather.temp}°C, feels like ${context.weather.feelsLike}°C)
- Wind: ${context.weather.windSpeed}km/h ${context.weather.windDirection}
- ${context.weather.rain ? `Rain expected (${context.weather.precipitation}mm)` : 'Dry conditions'}
- Impact: ${context.weatherImpact}`;
    }

    // Add injury context if available
    if (context.homeAbsences || context.awayAbsences) {
      prompt += `\n\n🏥 TEAM NEWS:`;
      
      if (context.homeAbsences && context.homeAbsences.totalOut > 0) {
        prompt += `\nHOME: ${context.homeAbsences.totalOut} players out`;
        if (context.homeAbsences.keyPlayersOut.length > 0) {
          prompt += ` (Key: ${context.homeAbsences.keyPlayersOut.slice(0, 3).join(', ')})`;
        }
        prompt += ` - Impact: ${context.homeAbsences.impactLevel}`;
      }
      
      if (context.awayAbsences && context.awayAbsences.totalOut > 0) {
        prompt += `\nAWAY: ${context.awayAbsences.totalOut} players out`;
        if (context.awayAbsences.keyPlayersOut.length > 0) {
          prompt += ` (Key: ${context.awayAbsences.keyPlayersOut.slice(0, 3).join(', ')})`;
        }
        prompt += ` - Impact: ${context.awayAbsences.impactLevel}`;
      }
    }

    // Add tactical context if available
    if (context.homeTactical && context.awayTactical && context.tacticalMatchup) {
      prompt += `\n\n⚔️ TACTICAL SETUP:
HOME: ${context.homeTactical.primaryFormation} | ${context.homeTactical.playingStyle.possession} possession, ${context.homeTactical.playingStyle.pressing} press
AWAY: ${context.awayTactical.primaryFormation} | ${context.awayTactical.playingStyle.possession} possession, ${context.awayTactical.playingStyle.pressing} press
MATCHUP: ${context.tacticalMatchup.prediction}
${context.tacticalMatchup.keyBattles.length > 0 ? `Key Battle: ${context.tacticalMatchup.keyBattles[0]}` : ''}`;
    }

    prompt += `\n\nWrite an engaging, fact-driven analysis (50-70 words) that:
1. Leads with the strongest stat supporting this ${percentage}% prediction
2. Includes 2-3 specific numbers from the data above
3. INCORPORATES contextual factors (weather/injuries/tactics) if they're significant
4. Matches the ${confidenceLevel} confidence level in tone
5. Has personality - be conversational, can add humor if it fits
6. Shows we did our research with real data

Remember: ${confidenceLevel === 'HOT 🔥' ? 'Be confident and punchy!' : confidenceLevel === 'WARM 🟡' ? 'Solid pick, show the value!' : 'Be cautious, mention the risks!'}`;

    return prompt;
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
