import OpenAI from 'openai';

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
}

export async function generateAIReasoning(input: AIReasoningInput): Promise<string> {
  const confidenceLevel = input.confidence >= 75 ? 'HOT 🔥' : input.confidence >= 60 ? 'SOLID 🟡' : 'RISKY 🔵';
  
  const prompt = `You're a sharp football betting analyst who knows their stuff AND has personality. You're like that mate down the pub who actually does their research but keeps it fun.

Match: ${input.homeTeam} vs ${input.awayTeam}
League: ${input.league}
Market: ${input.market}
Prediction: ${input.prediction}
Odds: ${input.odds}
Confidence: ${input.confidence}% (${confidenceLevel})

Write a 3-4 sentence analysis that:
1. Leads with the strongest stat/reason for this bet
2. Includes specific numbers and data points
3. Has personality - be conversational, can add humor if it fits naturally
4. Shows confidence matching the ${confidenceLevel} level
5. Talks like you're explaining to a friend, not writing a textbook

Style guide:
- ${input.confidence >= 75 ? 'Be confident and punchy! This is a banker.' : input.confidence >= 60 ? 'Solid pick, show the value!' : 'Be honest about the risks, but still engaging.'}
- Use phrases like "Look at...", "Here's the thing...", "Honestly...", "Let's be real..."
- Can use emojis sparingly (🔥, 💰, 👀, etc.)
- Keep it detailed with stats but make it flow naturally
- NO corporate speak or robotic language

Remember: You're knowledgeable AND fun to listen to. Stats + personality = perfect combo.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'chatgpt-4o-latest',
      messages: [
        { 
          role: 'system', 
          content: 'You are a knowledgeable football betting analyst with personality. You combine sharp analysis with conversational, friendly tone. Think "expert mate at the pub" not "corporate analyst".' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.8, // Higher for more personality
    });

    return response.choices[0].message.content || 'AI reasoning unavailable';
  } catch (error) {
    console.error('Error generating AI reasoning:', error);
    return 'AI reasoning temporarily unavailable';
  }
}

export async function generateBulkReasoning(inputs: AIReasoningInput[]): Promise<string[]> {
  const promises = inputs.map(input => generateAIReasoning(input));
  return Promise.all(promises);
}
