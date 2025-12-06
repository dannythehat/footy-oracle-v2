import { Prediction } from '../models/Prediction.js';

/**
 * Treble Calculator Service
 * Manages daily trebles (3-bet accumulators) from Golden Bets
 */

export interface TrebleBet {
  fixtureId: number;
  match: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  market: string;
  odds: number;
  confidence: number;
  aiReasoning?: string;
  result?: 'win' | 'loss' | 'pending';
}

export interface Treble {
  date: string;
  bets: TrebleBet[];
  trebleOdds: number;
  stake: number;
  potentialReturn: number;
  potentialProfit: number;
  status: 'pending' | 'won' | 'lost';
  actualReturn?: number;
  actualProfit?: number;
}

const TREBLE_STAKE = 10; // £10 per treble

/**
 * Get today's treble from top 3 Golden Bets
 */
export async function getTodaysTreble(): Promise<Treble | null> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get top 3 Golden Bets for today
    const goldenBets = await Prediction.find({
      isGoldenBet: true,
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ confidence: -1 })
      .limit(3);
    
    if (goldenBets.length < 3) {
      console.log(`⚠️  Only ${goldenBets.length} Golden Bets available for treble`);
      return null;
    }
    
    const bets: TrebleBet[] = goldenBets.map(bet => ({
      fixtureId: bet.fixtureId,
      match: `${bet.homeTeam} vs ${bet.awayTeam}`,
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      prediction: bet.prediction,
      market: bet.market,
      odds: bet.odds,
      confidence: bet.confidence,
      aiReasoning: bet.aiReasoning,
      result: bet.result,
    }));
    
    // Calculate treble odds (multiply all odds)
    const trebleOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
    const potentialReturn = TREBLE_STAKE * trebleOdds;
    const potentialProfit = potentialReturn - TREBLE_STAKE;
    
    // Determine status
    const allSettled = bets.every(bet => bet.result !== 'pending');
    const allWon = bets.every(bet => bet.result === 'win');
    const anyLost = bets.some(bet => bet.result === 'loss');
    
    let status: 'pending' | 'won' | 'lost' = 'pending';
    let actualReturn = 0;
    let actualProfit = 0;
    
    if (allSettled) {
      if (allWon) {
        status = 'won';
        actualReturn = potentialReturn;
        actualProfit = potentialProfit;
      } else if (anyLost) {
        status = 'lost';
        actualReturn = 0;
        actualProfit = -TREBLE_STAKE;
      }
    }
    
    return {
      date: today.toISOString().split('T')[0],
      bets,
      trebleOdds: parseFloat(trebleOdds.toFixed(2)),
      stake: TREBLE_STAKE,
      potentialReturn: parseFloat(potentialReturn.toFixed(2)),
      potentialProfit: parseFloat(potentialProfit.toFixed(2)),
      status,
      actualReturn: actualReturn > 0 ? parseFloat(actualReturn.toFixed(2)) : undefined,
      actualProfit: actualProfit !== 0 ? parseFloat(actualProfit.toFixed(2)) : undefined,
    };
  } catch (error) {
    console.error('Error getting today\'s treble:', error);
    throw error;
  }
}

/**
 * Get historical trebles with date range
 */
export async function getHistoricalTrebles(
  startDate?: string,
  endDate?: string,
  status?: 'pending' | 'won' | 'lost'
): Promise<Treble[]> {
  try {
    const query: any = { isGoldenBet: true };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Get all Golden Bets in date range
    const predictions = await Prediction.find(query).sort({ date: -1 });
    
    // Group by date (3 per day)
    const treblesByDate = new Map<string, Prediction[]>();
    
    for (const pred of predictions) {
      const dateKey = pred.date.toISOString().split('T')[0];
      if (!treblesByDate.has(dateKey)) {
        treblesByDate.set(dateKey, []);
      }
      const dayBets = treblesByDate.get(dateKey)!;
      if (dayBets.length < 3) {
        dayBets.push(pred);
      }
    }
    
    // Convert to Treble objects
    const trebles: Treble[] = [];
    
    for (const [date, bets] of treblesByDate.entries()) {
      if (bets.length !== 3) continue; // Skip incomplete trebles
      
      const trebleBets: TrebleBet[] = bets.map(bet => ({
        fixtureId: bet.fixtureId,
        match: `${bet.homeTeam} vs ${bet.awayTeam}`,
        homeTeam: bet.homeTeam,
        awayTeam: bet.awayTeam,
        prediction: bet.prediction,
        market: bet.market,
        odds: bet.odds,
        confidence: bet.confidence,
        aiReasoning: bet.aiReasoning,
        result: bet.result,
      }));
      
      const trebleOdds = trebleBets.reduce((acc, bet) => acc * bet.odds, 1);
      const potentialReturn = TREBLE_STAKE * trebleOdds;
      const potentialProfit = potentialReturn - TREBLE_STAKE;
      
      const allSettled = trebleBets.every(bet => bet.result !== 'pending');
      const allWon = trebleBets.every(bet => bet.result === 'win');
      const anyLost = trebleBets.some(bet => bet.result === 'loss');
      
      let trebleStatus: 'pending' | 'won' | 'lost' = 'pending';
      let actualReturn = 0;
      let actualProfit = 0;
      
      if (allSettled) {
        if (allWon) {
          trebleStatus = 'won';
          actualReturn = potentialReturn;
          actualProfit = potentialProfit;
        } else if (anyLost) {
          trebleStatus = 'lost';
          actualReturn = 0;
          actualProfit = -TREBLE_STAKE;
        }
      }
      
      // Filter by status if specified
      if (status && trebleStatus !== status) {
        continue;
      }
      
      trebles.push({
        date,
        bets: trebleBets,
        trebleOdds: parseFloat(trebleOdds.toFixed(2)),
        stake: TREBLE_STAKE,
        potentialReturn: parseFloat(potentialReturn.toFixed(2)),
        potentialProfit: parseFloat(potentialProfit.toFixed(2)),
        status: trebleStatus,
        actualReturn: actualReturn > 0 ? parseFloat(actualReturn.toFixed(2)) : undefined,
        actualProfit: actualProfit !== 0 ? parseFloat(actualProfit.toFixed(2)) : undefined,
      });
    }
    
    return trebles;
  } catch (error) {
    console.error('Error getting historical trebles:', error);
    throw error;
  }
}

/**
 * Get treble statistics
 */
export async function getTrebleStats(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all') {
  try {
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
    }
    
    const trebles = await getHistoricalTrebles(
      startDate?.toISOString().split('T')[0],
      undefined
    );
    
    const totalTrebles = trebles.length;
    const wonTrebles = trebles.filter(t => t.status === 'won').length;
    const lostTrebles = trebles.filter(t => t.status === 'lost').length;
    const pendingTrebles = trebles.filter(t => t.status === 'pending').length;
    
    const totalProfit = trebles.reduce((sum, t) => sum + (t.actualProfit || 0), 0);
    const totalStaked = (wonTrebles + lostTrebles) * TREBLE_STAKE;
    
    const winRate = (wonTrebles + lostTrebles) > 0 
      ? (wonTrebles / (wonTrebles + lostTrebles)) * 100 
      : 0;
    
    const roi = totalStaked > 0 
      ? (totalProfit / totalStaked) * 100 
      : 0;
    
    return {
      period,
      totalTrebles,
      wonTrebles,
      lostTrebles,
      pendingTrebles,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalStaked: parseFloat(totalStaked.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
      averageOdds: trebles.length > 0 
        ? parseFloat((trebles.reduce((sum, t) => sum + t.trebleOdds, 0) / trebles.length).toFixed(2))
        : 0,
    };
  } catch (error) {
    console.error('Error getting treble stats:', error);
    throw error;
  }
}
