import { FeaturedSelection, IFeaturedSelection } from '../models/FeaturedSelection.js';
import { Prediction } from '../models/Prediction.js';
import { BetBuilder } from '../models/BetBuilder.js';

/**
 * P&L Tracking Service
 * 
 * Manages historical tracking and P&L calculations for:
 * - Golden Bets (3 per day)
 * - Bet Builder of the Day (1 per day)
 * - Value Bets (3 per day)
 */

export interface PnLStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  voids: number;
  totalStaked: number;
  totalProfit: number;
  winRate: number;
  roi: number;
  averageOdds: number;
}

export interface PnLBreakdown {
  overall: PnLStats;
  goldenBets: PnLStats;
  betBuilders: PnLStats;
  valueBets: PnLStats;
}

/**
 * Sync featured selections from existing models
 * This should be run daily to ensure all featured bets are tracked
 */
export async function syncFeaturedSelections(): Promise<void> {
  try {
    // Sync Golden Bets (top 3 with highest confidence)
    const goldenBets = await Prediction.find({ isGoldenBet: true })
      .sort({ date: -1, confidence: -1 });
    
    for (const bet of goldenBets) {
      await FeaturedSelection.findOneAndUpdate(
        { 
          fixtureId: bet.fixtureId,
          selectionType: 'golden-bet',
          market: bet.market 
        },
        {
          selectionType: 'golden-bet',
          fixtureId: bet.fixtureId,
          date: bet.date,
          kickoff: bet.date,
          homeTeam: bet.homeTeam,
          awayTeam: bet.awayTeam,
          league: bet.league,
          market: bet.market,
          prediction: bet.prediction,
          odds: bet.odds,
          confidence: bet.confidence,
          value: bet.value,
          aiReasoning: bet.aiReasoning,
          result: bet.result || 'pending',
          profit: bet.profit || 0,
          stake: 10,
          featured: true,
          featuredAt: bet.createdAt,
        },
        { upsert: true, new: true }
      );
    }

    // Sync Bet Builders
    const betBuilders = await BetBuilder.find()
      .sort({ date: -1, combinedConfidence: -1 });
    
    for (const bb of betBuilders) {
      await FeaturedSelection.findOneAndUpdate(
        { 
          fixtureId: bb.fixtureId,
          selectionType: 'bet-builder'
        },
        {
          selectionType: 'bet-builder',
          fixtureId: bb.fixtureId,
          date: bb.date,
          kickoff: bb.kickoff,
          homeTeam: bb.homeTeam,
          awayTeam: bb.awayTeam,
          league: bb.league,
          market: 'Bet Builder',
          prediction: `${bb.markets.length} Market Combo`,
          odds: bb.estimatedCombinedOdds,
          confidence: bb.combinedConfidence,
          markets: bb.markets,
          combinedOdds: bb.estimatedCombinedOdds,
          aiReasoning: bb.aiReasoning,
          result: bb.result || 'pending',
          profit: bb.profit || 0,
          stake: 10,
          featured: true,
          featuredAt: bb.createdAt,
        },
        { upsert: true, new: true }
      );
    }

    // Sync Value Bets (top 3 by value percentage)
    const valueBets = await Prediction.find({ 
      value: { $exists: true, $gt: 0 } 
    })
      .sort({ date: -1, value: -1 });
    
    // Group by date and take top 3 per day
    const valueBetsByDate = valueBets.reduce((acc: any, bet) => {
      const dateKey = bet.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      if (acc[dateKey].length < 3) {
        acc[dateKey].push(bet);
      }
      return acc;
    }, {});

    for (const dateKey in valueBetsByDate) {
      for (const bet of valueBetsByDate[dateKey]) {
        await FeaturedSelection.findOneAndUpdate(
          { 
            fixtureId: bet.fixtureId,
            selectionType: 'value-bet',
            market: bet.market 
          },
          {
            selectionType: 'value-bet',
            fixtureId: bet.fixtureId,
            date: bet.date,
            kickoff: bet.date,
            homeTeam: bet.homeTeam,
            awayTeam: bet.awayTeam,
            league: bet.league,
            market: bet.market,
            prediction: bet.prediction,
            odds: bet.odds,
            confidence: bet.confidence,
            value: bet.value,
            aiReasoning: bet.aiReasoning,
            result: bet.result || 'pending',
            profit: bet.profit || 0,
            stake: 10,
            featured: true,
            featuredAt: bet.createdAt,
          },
          { upsert: true, new: true }
        );
      }
    }

    console.log('✅ Featured selections synced successfully');
  } catch (error) {
    console.error('❌ Error syncing featured selections:', error);
    throw error;
  }
}

/**
 * Calculate P&L statistics for a given period
 */
function calculateStats(selections: IFeaturedSelection[]): PnLStats {
  const settled = selections.filter(s => ['win', 'loss', 'void'].includes(s.result));
  const wins = selections.filter(s => s.result === 'win');
  const losses = selections.filter(s => s.result === 'loss');
  const pending = selections.filter(s => s.result === 'pending');
  const voids = selections.filter(s => s.result === 'void');

  const totalStaked = selections.reduce((sum, s) => sum + s.stake, 0);
  const totalProfit = selections.reduce((sum, s) => sum + s.profit, 0);
  const totalOdds = selections.reduce((sum, s) => sum + s.odds, 0);

  return {
    totalBets: selections.length,
    wins: wins.length,
    losses: losses.length,
    pending: pending.length,
    voids: voids.length,
    totalStaked: parseFloat(totalStaked.toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    winRate: settled.length > 0 ? parseFloat(((wins.length / settled.length) * 100).toFixed(2)) : 0,
    roi: totalStaked > 0 ? parseFloat(((totalProfit / totalStaked) * 100).toFixed(2)) : 0,
    averageOdds: selections.length > 0 ? parseFloat((totalOdds / selections.length).toFixed(2)) : 0,
  };
}

/**
 * Get P&L breakdown by selection type
 */
export async function getPnLBreakdown(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all' = 'all'
): Promise<PnLBreakdown> {
  try {
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = new Date(now.setHours(0, 0, 0, 0));
        dateFilter = { date: { $gte: today } };
        break;
      case 'weekly':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { date: { $gte: weekAgo } };
        break;
      case 'monthly':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { date: { $gte: monthAgo } };
        break;
      case 'yearly':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        dateFilter = { date: { $gte: yearAgo } };
        break;
    }

    const [allSelections, goldenBets, betBuilders, valueBets] = await Promise.all([
      FeaturedSelection.find({ featured: true, ...dateFilter }),
      FeaturedSelection.find({ featured: true, selectionType: 'golden-bet', ...dateFilter }),
      FeaturedSelection.find({ featured: true, selectionType: 'bet-builder', ...dateFilter }),
      FeaturedSelection.find({ featured: true, selectionType: 'value-bet', ...dateFilter }),
    ]);

    return {
      overall: calculateStats(allSelections),
      goldenBets: calculateStats(goldenBets),
      betBuilders: calculateStats(betBuilders),
      valueBets: calculateStats(valueBets),
    };
  } catch (error) {
    console.error('Error calculating P&L breakdown:', error);
    throw error;
  }
}

/**
 * Get historical selections with filtering
 */
export async function getHistoricalSelections(options: {
  selectionType?: 'golden-bet' | 'bet-builder' | 'value-bet';
  result?: 'win' | 'loss' | 'pending' | 'void';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) {
  try {
    const filter: any = { featured: true };
    
    if (options.selectionType) filter.selectionType = options.selectionType;
    if (options.result) filter.result = options.result;
    if (options.startDate || options.endDate) {
      filter.date = {};
      if (options.startDate) filter.date.$gte = options.startDate;
      if (options.endDate) filter.date.$lte = options.endDate;
    }

    const selections = await FeaturedSelection.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(options.limit || 100)
      .skip(options.skip || 0);

    const total = await FeaturedSelection.countDocuments(filter);

    return {
      selections,
      total,
      page: Math.floor((options.skip || 0) / (options.limit || 100)) + 1,
      totalPages: Math.ceil(total / (options.limit || 100)),
    };
  } catch (error) {
    console.error('Error fetching historical selections:', error);
    throw error;
  }
}

/**
 * Update selection result and calculate profit
 */
export async function updateSelectionResult(
  fixtureId: number,
  selectionType: 'golden-bet' | 'bet-builder' | 'value-bet',
  result: 'win' | 'loss' | 'void'
): Promise<IFeaturedSelection | null> {
  try {
    const selection = await FeaturedSelection.findOne({ fixtureId, selectionType });
    
    if (!selection) {
      console.warn(`Selection not found: ${fixtureId} - ${selectionType}`);
      return null;
    }

    selection.result = result;
    selection.settledAt = new Date();
    selection.calculateProfit();
    
    await selection.save();

    // Also update the original model
    if (selectionType === 'golden-bet' || selectionType === 'value-bet') {
      await Prediction.findOneAndUpdate(
        { fixtureId, isGoldenBet: selectionType === 'golden-bet' },
        { result, profit: selection.profit }
      );
    } else if (selectionType === 'bet-builder') {
      await BetBuilder.findOneAndUpdate(
        { fixtureId },
        { result, profit: selection.profit }
      );
    }

    return selection;
  } catch (error) {
    console.error('Error updating selection result:', error);
    throw error;
  }
}
