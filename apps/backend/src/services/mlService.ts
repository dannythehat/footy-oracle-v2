import axios from 'axios';

// ML API URL from environment or default to localhost
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

console.log(`🤖 ML API URL: ${ML_API_URL}`);

// HTTP client with timeout
const mlClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

interface MLPrediction {
  fixture_id: number;
  home_team: string;
  away_team: string;
  league_id?: number;
  league_name?: string;
  date?: string;
  predictions: {
    over_25_goals: {
      probability: number;
      prediction: boolean;
      confidence: number;
    };
    btts: {
      probability: number;
      prediction: boolean;
      confidence: number;
    };
    corners_over_95: {
      probability: number;
      prediction: boolean;
      confidence: number;
    };
    cards_over_35: {
      probability: number;
      prediction: boolean;
      confidence: number;
    };
  };
  odds?: any;
}

interface GoldenBet extends MLPrediction {
  golden_score: number;
}

interface ValueBet {
  fixture_id: number;
  home_team: string;
  away_team: string;
  league_name?: string;
  date?: string;
  market: string;
  prediction: any;
  odd: number;
  expected_value: number;
  edge: number;
}

/**
 * Get predictions for today's fixtures
 * Calls ML API /predictions endpoint
 */
export async function getPredictionsToday(): Promise<MLPrediction[]> {
  try {
    console.log('📡 Fetching predictions from ML API...');
    
    const response = await mlClient.post('/predictions', {
      fixtures: [] // Backend should prepare fixture data with features
    });
    
    if (response.data.success) {
      console.log(`✅ Received ${response.data.count} predictions from ML API`);
      return response.data.predictions || [];
    }
    
    console.warn('⚠️  ML API returned unsuccessful response');
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching predictions from ML API:', error.message);
    
    // Check if ML API is unreachable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('🔴 ML API is not reachable. Please ensure it is running.');
      console.error(`   Expected URL: ${ML_API_URL}`);
      console.error('   Set ML_API_URL environment variable if needed.');
    }
    
    return [];
  }
}

/**
 * Get golden bets (high confidence predictions)
 * Calls ML API /golden-bets endpoint
 */
export async function getGoldenBetsToday(): Promise<GoldenBet[]> {
  try {
    console.log('🏆 Fetching golden bets from ML API...');
    
    const response = await mlClient.post('/golden-bets', {
      fixtures: [], // Backend should prepare fixture data with features
      min_confidence: 0.75
    });
    
    if (response.data.success) {
      console.log(`✅ Received ${response.data.count} golden bets from ML API`);
      return response.data.data || [];
    }
    
    console.warn('⚠️  ML API returned unsuccessful response for golden bets');
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching golden bets from ML API:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('🔴 ML API is not reachable. Please ensure it is running.');
    }
    
    return [];
  }
}

/**
 * Get value bets (predictions with positive expected value)
 * Calls ML API /value-bets endpoint
 */
export async function getValueBetsToday(): Promise<ValueBet[]> {
  try {
    console.log('💎 Fetching value bets from ML API...');
    
    const response = await mlClient.post('/value-bets', {
      fixtures: [], // Backend should prepare fixture data with features
      min_edge: 0.05
    });
    
    if (response.data.success) {
      console.log(`✅ Received ${response.data.count} value bets from ML API`);
      return response.data.data || [];
    }
    
    console.warn('⚠️  ML API returned unsuccessful response for value bets');
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching value bets from ML API:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('🔴 ML API is not reachable. Please ensure it is running.');
    }
    
    return [];
  }
}

/**
 * Health check for ML API
 */
export async function checkMLAPIHealth(): Promise<boolean> {
  try {
    const response = await mlClient.get('/health');
    return response.data.status === 'ok' && response.data.models_loaded === true;
  } catch (error) {
    return false;
  }
}
