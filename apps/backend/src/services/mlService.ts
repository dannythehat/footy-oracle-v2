import fs from 'fs/promises';
import path from 'path';

export interface MLPrediction {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  confidence: number;
}

export async function loadMLPredictions(): Promise<MLPrediction[]> {
  try {
    const mlPath = process.env.ML_MODEL_PATH || '../../shared/ml_outputs/predictions.json';
    const fullPath = path.resolve(process.cwd(), mlPath);
    
    const data = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading ML predictions:', error);
    // Return mock data for development
    return generateMockPredictions();
  }
}

export function selectGoldenBets(predictions: MLPrediction[], count: number = 3): MLPrediction[] {
  // Filter high confidence predictions (80%+)
  const highConfidence = predictions.filter(p => p.confidence >= 80);
  
  // Sort by confidence descending
  const sorted = highConfidence.sort((a, b) => b.confidence - a.confidence);
  
  // Return top N
  return sorted.slice(0, count);
}

export function filterByLeague(predictions: MLPrediction[], league: string): MLPrediction[] {
  return predictions.filter(p => p.league === league);
}

export function filterByConfidence(predictions: MLPrediction[], minConfidence: number): MLPrediction[] {
  return predictions.filter(p => p.confidence >= minConfidence);
}

// Mock data generator for development
function generateMockPredictions(): MLPrediction[] {
  return [
    {
      fixtureId: 1001,
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      league: 'Premier League',
      market: 'Match Winner',
      prediction: 'Home Win',
      confidence: 85
    },
    {
      fixtureId: 1002,
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      league: 'La Liga',
      market: 'Both Teams to Score',
      prediction: 'Yes',
      confidence: 82
    },
    {
      fixtureId: 1003,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      market: 'Over/Under 2.5',
      prediction: 'Over 2.5',
      confidence: 88
    }
  ];
}
