import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  venue?: string;
  homeForm?: string[];
  awayForm?: string[];
  headToHead?: any[];
}

export interface FixturePrediction {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  prediction: {
    winner: 'home' | 'away' | 'draw';
    confidence: number;
    scorePrediction: string;
  };
  markets: {
    market: string;
    prediction: string;
    odds: number;
    confidence: number;
  }[];
  reasoning: string;
  goldenBet?: {
    market: string;
    prediction: string;
    odds: number;
    confidence: number;
    reasoning: string;
  };
}

export async function analyzeFixture(fixture: Fixture): Promise<FixturePrediction> {
  const prompt = `Analyze this football fixture and provide detailed predictions:

Match: ${fixture.homeTeam} vs ${fixture.awayTeam}
League: ${fixture.league}
Date: ${fixture.date}
${fixture.venue ? `Venue: ${fixture.venue}` : ''}
${fixture.homeForm ? `Home Form: ${fixture.homeForm.join(', ')}` : ''}
${fixture.awayForm ? `Away Form: ${fixture.awayForm.join(', ')}` : ''}

Provide predictions for:
1. Match winner (home/away/draw) with confidence %
2. Predicted score
3. Key betting markets (Over/Under 2.5, BTTS, etc.)
4. Identify the best "Golden Bet" opportunity

Format as JSON with structure:
{
  "winner": "home|away|draw",
  "confidence": 75,
  "scorePrediction": "2-1",
  "markets": [
    {"market": "Over 2.5 Goals", "prediction": "Yes", "odds": 1.85, "confidence": 70}
  ],
  "reasoning": "Brief analysis",
  "goldenBet": {"market": "...", "prediction": "...", "odds": 0, "confidence": 0, "reasoning": "..."}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert football analyst and betting strategist. Provide data-driven predictions with realistic confidence levels.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    return {
      fixtureId: fixture.id,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      prediction: {
        winner: analysis.winner || 'draw',
        confidence: analysis.confidence || 50,
        scorePrediction: analysis.scorePrediction || '1-1'
      },
      markets: analysis.markets || [],
      reasoning: analysis.reasoning || 'Analysis unavailable',
      goldenBet: analysis.goldenBet
    };
  } catch (error) {
    console.error('Error analyzing fixture:', error);
    throw new Error('Failed to analyze fixture');
  }
}

export async function analyzeBulkFixtures(fixtures: Fixture[]): Promise<FixturePrediction[]> {
  const batchSize = 5; // Process 5 at a time to avoid rate limits
  const results: FixturePrediction[] = [];

  for (let i = 0; i < fixtures.length; i += batchSize) {
    const batch = fixtures.slice(i, i + batchSize);
    const batchPromises = batch.map(fixture => analyzeFixture(fixture));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Failed to analyze fixture ${batch[index].id}:`, result.reason);
      }
    });

    // Small delay between batches
    if (i + batchSize < fixtures.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export async function findGoldenBets(predictions: FixturePrediction[]): Promise<FixturePrediction[]> {
  return predictions.filter(p => 
    p.goldenBet && 
    p.goldenBet.confidence >= 75 && 
    p.goldenBet.odds >= 1.5
  );
}

export async function findValueBets(predictions: FixturePrediction[]): Promise<any[]> {
  const valueBets: any[] = [];

  predictions.forEach(prediction => {
    prediction.markets.forEach(market => {
      // Simple value calculation: if confidence > implied probability
      const impliedProbability = 1 / market.odds;
      const ourProbability = market.confidence / 100;
      
      if (ourProbability > impliedProbability * 1.1) { // 10% edge
        valueBets.push({
          fixture: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
          market: market.market,
          prediction: market.prediction,
          odds: market.odds,
          confidence: market.confidence,
          edge: ((ourProbability - impliedProbability) * 100).toFixed(2) + '%'
        });
      }
    });
  });

  return valueBets.sort((a, b) => parseFloat(b.edge) - parseFloat(a.edge));
}
