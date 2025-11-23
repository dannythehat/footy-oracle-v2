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
  const prompt = `You are an expert sports betting analyst. Provide a concise, professional explanation for this Golden Bet prediction:

Match: ${input.homeTeam} vs ${input.awayTeam}
League: ${input.league}
Market: ${input.market}
Prediction: ${input.prediction}
Odds: ${input.odds}
Confidence: ${input.confidence}%

Provide a 2-3 sentence explanation covering:
1. Key factors supporting this prediction
2. Why the odds represent value
3. Risk assessment

Keep it professional, data-driven, and concise.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional sports betting analyst providing expert insights.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
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
