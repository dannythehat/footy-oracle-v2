import { Prediction } from '../models/Prediction.js';
import { Fixture } from '../models/Fixture.js';
import { fetchFixtureResult } from './apiFootballService.js';

/**
 * Result Settlement Service
 * Automatically checks and updates bet results after matches finish
 */

const STAKE_PER_BET = 10; // £10 per bet

export interface SettlementResult {
  fixtureId: number;
  match: string;
  prediction: string;
  result: 'win' | 'loss';
  profit: number;
  odds: number;
}

/**
 * Settle all pending predictions for finished fixtures
 */
export async function settlePendingPredictions(): Promise<SettlementResult[]> {
  try {
    console.log('🔄 Starting result settlement...');
    
    // Get all pending predictions
    const pendingPredictions = await Prediction.find({ result: 'pending' });
    
    if (pendingPredictions.length === 0) {
      console.log('ℹ️  No pending predictions to settle');
      return [];
    }
    
    console.log(`📊 Found ${pendingPredictions.length} pending predictions`);
    
    const settlements: SettlementResult[] = [];
    
    for (const prediction of pendingPredictions) {
      try {
        // Check if fixture is finished
        const fixture = await Fixture.findOne({ fixtureId: prediction.fixtureId });
        
        if (!fixture || fixture.status !== 'FT') {
          continue; // Skip if not finished
        }
        
        // Fetch actual result from API
        const actualResult = await fetchFixtureResult(prediction.fixtureId);
        
        if (!actualResult) {
          console.warn(`⚠️  Could not fetch result for fixture ${prediction.fixtureId}`);
          continue;
        }
        
        // Determine if prediction was correct
        const isWin = checkPredictionResult(prediction, actualResult);
        
        // Calculate profit/loss
        const profit = isWin 
          ? (prediction.odds - 1) * STAKE_PER_BET 
          : -STAKE_PER_BET;
        
        // Update prediction
        prediction.result = isWin ? 'win' : 'loss';
        prediction.profit = profit;
        await prediction.save();
        
        settlements.push({
          fixtureId: prediction.fixtureId,
          match: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
          prediction: prediction.prediction,
          result: prediction.result,
          profit,
          odds: prediction.odds,
        });
        
        console.log(`✅ Settled: ${prediction.homeTeam} vs ${prediction.awayTeam} - ${prediction.result.toUpperCase()}`);
      } catch (error) {
        console.error(`❌ Error settling prediction ${prediction.fixtureId}:`, error);
      }
    }
    
    console.log(`✅ Settlement complete: ${settlements.length} predictions settled`);
    return settlements;
  } catch (error) {
    console.error('❌ Error in settlement process:', error);
    throw error;
  }
}

/**
 * Check if a prediction was correct based on actual result
 */
function checkPredictionResult(prediction: any, actualResult: any): boolean {
  const market = prediction.market.toLowerCase();
  const pred = prediction.prediction.toLowerCase();
  
  switch (market) {
    case 'match winner':
    case 'winner':
      return checkMatchWinner(pred, actualResult);
      
    case 'both teams to score':
    case 'btts':
      return checkBTTS(pred, actualResult);
      
    case 'over/under 2.5':
    case 'over/under 2.5 goals':
      return checkOverUnder25(pred, actualResult);
      
    case 'over 9.5 corners':
      return checkCorners(pred, actualResult);
      
    case 'over 3.5 cards':
      return checkCards(pred, actualResult);
      
    default:
      console.warn(`⚠️  Unknown market type: ${market}`);
      return false;
  }
}

function checkMatchWinner(prediction: string, result: any): boolean {
  const { homeScore, awayScore } = result;
  
  if (prediction.includes('home') || prediction.includes('1')) {
    return homeScore > awayScore;
  } else if (prediction.includes('away') || prediction.includes('2')) {
    return awayScore > homeScore;
  } else if (prediction.includes('draw') || prediction.includes('x')) {
    return homeScore === awayScore;
  }
  
  return false;
}

function checkBTTS(prediction: string, result: any): boolean {
  const { homeScore, awayScore } = result;
  const bothScored = homeScore > 0 && awayScore > 0;
  
  if (prediction.includes('yes')) {
    return bothScored;
  } else if (prediction.includes('no')) {
    return !bothScored;
  }
  
  return false;
}

function checkOverUnder25(prediction: string, result: any): boolean {
  const { homeScore, awayScore } = result;
  const totalGoals = homeScore + awayScore;
  
  if (prediction.includes('over')) {
    return totalGoals > 2.5;
  } else if (prediction.includes('under')) {
    return totalGoals < 2.5;
  }
  
  return false;
}

function checkCorners(prediction: string, result: any): boolean {
  const totalCorners = (result.homeCorners || 0) + (result.awayCorners || 0);
  
  if (prediction.includes('over')) {
    return totalCorners > 9.5;
  } else if (prediction.includes('under')) {
    return totalCorners < 9.5;
  }
  
  return false;
}

function checkCards(prediction: string, result: any): boolean {
  const totalCards = (result.homeCards || 0) + (result.awayCards || 0);
  
  if (prediction.includes('over')) {
    return totalCards > 3.5;
  } else if (prediction.includes('under')) {
    return totalCards < 3.5;
  }
  
  return false;
}

/**
 * Settle a specific prediction by fixture ID
 */
export async function settlePredictionByFixture(fixtureId: number): Promise<SettlementResult | null> {
  try {
    const prediction = await Prediction.findOne({ fixtureId, result: 'pending' });
    
    if (!prediction) {
      return null;
    }
    
    const actualResult = await fetchFixtureResult(fixtureId);
    
    if (!actualResult) {
      return null;
    }
    
    const isWin = checkPredictionResult(prediction, actualResult);
    const profit = isWin 
      ? (prediction.odds - 1) * STAKE_PER_BET 
      : -STAKE_PER_BET;
    
    prediction.result = isWin ? 'win' : 'loss';
    prediction.profit = profit;
    await prediction.save();
    
    return {
      fixtureId: prediction.fixtureId,
      match: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
      prediction: prediction.prediction,
      result: prediction.result,
      profit,
      odds: prediction.odds,
    };
  } catch (error) {
    console.error(`Error settling prediction for fixture ${fixtureId}:`, error);
    return null;
  }
}

/**
 * Get settlement statistics
 */
export async function getSettlementStats() {
  const [total, settled, pending, wins, losses] = await Promise.all([
    Prediction.countDocuments({ isGoldenBet: true }),
    Prediction.countDocuments({ isGoldenBet: true, result: { $in: ['win', 'loss'] } }),
    Prediction.countDocuments({ isGoldenBet: true, result: 'pending' }),
    Prediction.countDocuments({ isGoldenBet: true, result: 'win' }),
    Prediction.countDocuments({ isGoldenBet: true, result: 'loss' }),
  ]);
  
  const winRate = settled > 0 ? (wins / settled) * 100 : 0;
  
  return {
    total,
    settled,
    pending,
    wins,
    losses,
    winRate: parseFloat(winRate.toFixed(2)),
  };
}
