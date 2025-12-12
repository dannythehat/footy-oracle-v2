import OpenAI from 'openai';
import { WeatherData } from './weatherService';
import { TeamAbsences } from './injuryService';
import { TacticalProfile } from './tacticalService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIReasoningInput {
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  odds: number;
  confidence: number;
  
  // Enhanced context
  weather?: WeatherData;
  weatherImpact?: string;
  homeAbsences?: TeamAbsences;
  awayAbsences?: TeamAbsences;
  homeTactical?: TacticalProfile;
  awayTactical?: TacticalProfile;
  
  // Statistical context
  homeForm?: string;
  awayForm?: string;
  homeGoalsAvg?: { scored: number; conceded: number };
  awayGoalsAvg?: { scored: number; conceded: number };
}

export async function generateAIReasoning(input: AIReasoningInput): Promise<string> {
  const confidenceLevel = input.confidence >= 75 ? 'HOT 🔥' : input.confidence >= 60 ? 'SOLID 🟡' : 'RISKY 🔵';
  
  const prompt = buildEnhancedPrompt(input, confidenceLevel);

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'chatgpt-4o-latest',
      messages: [
        { 
          role: 'system', 
          content: getSystemPrompt(confidenceLevel)
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.8, // Higher for more personality
    });

    return response.choices[0].message.content || 'AI reasoning unavailable';
  } catch (error) {
    console.error('Error generating AI reasoning:', error);
    return 'AI reasoning temporarily unavailable';
  }
}

function getSystemPrompt(confidenceLevel: string): string {
  return `You are a knowledgeable football betting analyst with personality. You combine sharp analysis with conversational, friendly tone. Think "expert mate at the pub" not "corporate analyst".

CONFIDENCE LEVEL: ${confidenceLevel}

YOUR STYLE:
✅ Lead with the strongest stat/reason
✅ Include specific numbers and data
✅ Use contextual factors (weather, injuries, tactics) when available
✅ Be conversational and engaging
✅ Show confidence matching the ${confidenceLevel} level
✅ 50-70 words maximum

❌ Don't be robotic or boring
❌ Don't ignore available context
❌ Don't exceed word limit

EXAMPLES:

HOT with context: "Arsenal's high press (4-3-3) vs Chelsea's short build-up? Turnovers guaranteed. Add in heavy rain (slippery conditions) and both teams averaging 2+ goals/game. Chelsea missing their top defender too. This screams goals. 🔥"

SOLID with injuries: "Liverpool's attack (2.3 goals/game) looks tasty, but they're missing Salah and Jota - that's 40% of their goals gone. Still, Everton's defense is leaking (1.8/game). Decent value at these odds. 🟡"

Remember: Use ALL available context to build a compelling case!`;
}

function buildEnhancedPrompt(input: AIReasoningInput, confidenceLevel: string): string {
  let prompt = `Match: ${input.homeTeam} vs ${input.awayTeam}
League: ${input.league}
Market: ${input.market}
Prediction: ${input.prediction}
Odds: ${input.odds}
Confidence: ${input.confidence}% (${confidenceLevel})`;

  // Add statistical context
  if (input.homeForm || input.awayForm) {
    prompt += `\n\nFORM:`;
    if (input.homeForm) prompt += `\nHome: ${input.homeForm}`;
    if (input.awayForm) prompt += `\nAway: ${input.awayForm}`;
  }

  if (input.homeGoalsAvg || input.awayGoalsAvg) {
    prompt += `\n\nGOALS AVERAGE:`;
    if (input.homeGoalsAvg) {
      prompt += `\nHome: ${input.homeGoalsAvg.scored} scored, ${input.homeGoalsAvg.conceded} conceded`;
    }
    if (input.awayGoalsAvg) {
      prompt += `\nAway: ${input.awayGoalsAvg.scored} scored, ${input.awayGoalsAvg.conceded} conceded`;
    }
  }

  // Add weather context
  if (input.weather && input.weatherImpact) {
    prompt += `\n\n🌤️ WEATHER:
${input.weather.description} (${input.weather.temp}°C)
Wind: ${input.weather.windSpeed}km/h
${input.weather.rain ? `Rain: ${input.weather.precipitation}mm expected` : 'Dry conditions'}
Impact: ${input.weatherImpact}`;
  }

  // Add injury context
  if (input.homeAbsences || input.awayAbsences) {
    prompt += `\n\n🏥 TEAM NEWS:`;
    
    if (input.homeAbsences && input.homeAbsences.totalOut > 0) {
      prompt += `\nHome: ${input.homeAbsences.totalOut} out`;
      if (input.homeAbsences.keyPlayersOut.length > 0) {
        prompt += ` (${input.homeAbsences.keyPlayersOut.slice(0, 2).join(', ')})`;
      }
    }
    
    if (input.awayAbsences && input.awayAbsences.totalOut > 0) {
      prompt += `\nAway: ${input.awayAbsences.totalOut} out`;
      if (input.awayAbsences.keyPlayersOut.length > 0) {
        prompt += ` (${input.awayAbsences.keyPlayersOut.slice(0, 2).join(', ')})`;
      }
    }
  }

  // Add tactical context
  if (input.homeTactical && input.awayTactical) {
    prompt += `\n\n⚔️ TACTICS:
Home: ${input.homeTactical.primaryFormation} (${input.homeTactical.playingStyle.possession} possession, ${input.homeTactical.playingStyle.pressing} press)
Away: ${input.awayTactical.primaryFormation} (${input.awayTactical.playingStyle.possession} possession, ${input.awayTactical.playingStyle.pressing} press)`;
  }

  prompt += `\n\nWrite a 50-70 word analysis that:
1. Leads with the strongest stat/reason for this bet
2. Incorporates contextual factors (weather/injuries/tactics) if significant
3. Includes specific numbers
4. Has personality - conversational, can add humor
5. Shows confidence matching ${confidenceLevel}

Style: ${input.confidence >= 75 ? 'Be confident and punchy! This is a banker.' : input.confidence >= 60 ? 'Solid pick, show the value!' : 'Be honest about the risks, but still engaging.'}`;

  return prompt;
}

export async function generateBulkReasoning(inputs: AIReasoningInput[]): Promise<string[]> {
  const promises = inputs.map(input => generateAIReasoning(input));
  return Promise.all(promises);
}
