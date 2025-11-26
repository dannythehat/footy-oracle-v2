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

// GitHub raw URLs for ML outputs
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/dannythehat/footy-oracle-v2/main/shared/ml_outputs';

async function fetchFromGitHub(filename: string): Promise<any[]> {
  try {
    const url = `${GITHUB_RAW_BASE}/${filename}`;
    console.log(`📡 Fetching ${filename} from GitHub:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.length} items from ${filename}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${filename} from GitHub:`, error);
    return [];
  }
}

export async function loadMLPredictions(): Promise<MLPrediction[]> {
  try {
    const predictions = await fetchFromGitHub('predictions.json');
    
    if (predictions.length === 0) {
      console.log('⚠️ No predictions found, returning mock data');
      return generateMockPredictions();
    }
    
    return predictions;
  } catch (error) {
    console.error('❌ Error loading ML predictions:', error);
    return generateMockPredictions();
  }
}

export async function loadGoldenBets(): Promise<GoldenBet[]> {
  try {
    const goldenBets = await fetchFromGitHub('golden_bets.json');
    
    if (goldenBets.length === 0) {
      console.log('⚠️ No golden bets available yet');
    }
    
    return goldenBets;
  } catch (error) {
    console.error('❌ Error loading Golden Bets:', error);
    return [];
  }
}

export async function loadValueBets(): Promise<ValueBet[]> {
  try {
    const valueBets = await fetchFromGitHub('value_bets.json');
    
    if (valueBets.length === 0) {
      console.log('⚠️ No value bets available yet');
    }
    
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
