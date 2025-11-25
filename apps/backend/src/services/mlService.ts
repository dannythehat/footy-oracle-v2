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

export interface GoldenBet extends MLPrediction {
  odds?: number;
  stake?: number;
  potentialReturn?: number;
}

export interface ValueBet extends MLPrediction {
  odds?: number;
  expectedValue?: number;
  edge?: number;
}

export async function loadMLPredictions(): Promise<MLPrediction[]> {
  try {
    // Primary path: Local golden-betopia ML outputs (Windows absolute path)
    const localPath = 'C:\\Users\\Danny\\Documents\\GitHub\\golden-betopia\\shared\\ml_outputs\\predictions.json';
    
    // Fallback path: Relative path for deployment
    const relativePath = process.env.ML_MODEL_PATH || '../../shared/ml_outputs/predictions.json';
    
    let fullPath = localPath;
    
    // Try local path first, fallback to relative
    try {
      await fs.access(localPath);
      console.log('✅ Reading ML predictions from local golden-betopia:', localPath);
    } catch {
      fullPath = path.resolve(process.cwd(), relativePath);
      console.log('⚠️ Local path not found, using relative path:', fullPath);
    }
    
    const data = await fs.readFile(fullPath, 'utf-8');
    const predictions = JSON.parse(data);
    
    console.log(`📊 Loaded ${predictions.length} ML predictions`);
    return predictions;
  } catch (error) {
    console.error('❌ Error loading ML predictions:', error);
    console.log('🔄 Returning mock data for development');
    return generateMockPredictions();
  }
}

export async function loadGoldenBets(): Promise<GoldenBet[]> {
  try {
    const localPath = 'C:\\Users\\Danny\\Documents\\GitHub\\golden-betopia\\shared\\ml_outputs\\golden_bets.json';
    const relativePath = '../../shared/ml_outputs/golden_bets.json';
    
    let fullPath = localPath;
    
    try {
      await fs.access(localPath);
      console.log('✅ Reading Golden Bets from local golden-betopia:', localPath);
    } catch {
      fullPath = path.resolve(process.cwd(), relativePath);
      console.log('⚠️ Local path not found, using relative path:', fullPath);
    }
    
    const data = await fs.readFile(fullPath, 'utf-8');
    const goldenBets = JSON.parse(data);
    
    console.log(`⭐ Loaded ${goldenBets.length} Golden Bets`);
    return goldenBets;
  } catch (error) {
    console.error('❌ Error loading Golden Bets:', error);
    return [];
  }
}

export async function loadValueBets(): Promise<ValueBet[]> {
  try {
    const localPath = 'C:\\Users\\Danny\\Documents\\GitHub\\golden-betopia\\shared\\ml_outputs\\value_bets.json';
    const relativePath = '../../shared/ml_outputs/value_bets.json';
    
    let fullPath = localPath;
    
    try {
      await fs.access(localPath);
      console.log('✅ Reading Value Bets from local golden-betopia:', localPath);
    } catch {
      fullPath = path.resolve(process.cwd(), relativePath);
      console.log('⚠️ Local path not found, using relative path:', fullPath);
    }
    
    const data = await fs.readFile(fullPath, 'utf-8');
    const valueBets = JSON.parse(data);
    
    console.log(`💎 Loaded ${valueBets.length} Value Bets`);
    return valueBets;
  } catch (error) {
    console.error('❌ Error loading Value Bets:', error);
    return [];
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
