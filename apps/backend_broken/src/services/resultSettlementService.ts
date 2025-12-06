import { Prediction } from '../models/Prediction.js';
import { Fixture } from '../models/Fixture.js';

/**
 * Result Settlement Service
 * Uses stored Fixture + Prediction data only (no external API calls)
 */

const STAKE_PER_BET = 10; // stake per bet unit

export interface SettlementResult {
  fixtureId: number;
  match: string;
  prediction: string;
  result: 'win' | 'loss';
  profit: number;
  odds: number;
}

/**
 * Helper: get simple match result + stats from Fixture
 */
function buildResultFromFixture(fixture: any) {
  if (!fixture || !fixture.score) return null;

  const homeScore = fixture.score.home;
  const awayScore = fixture.score.away;

  if (homeScore == null || awayScore == null) return null;

  const stats = fixture.statistics || {};

  // Try to derive cards & corners from stored stats (if present)
  const homeStats = stats.home || {};
  const awayStats = stats.away || {};

  const homeCorners = homeStats.corners ?? homeStats.cornerKicks ?? 0;
  const awayCorners = awayStats.corners ?? awayStats.cornerKicks ?? 0;

  const homeCards =
    (homeStats.yellowCards ?? 0) + (homeStats.redCards ?? 0);
  const awayCards =
    (awayStats.yellowCards ?? 0) + (awayStats.redCards ?? 0);

  return {
    homeScore,
    awayScore,
    homeCorners,
    awayCorners,
    homeCards,
    awayCards,
  };
}

/**
 * Core result check, simplified but matching your markets
 */
function checkPredictionResult(prediction: any, result: any): boolean {
  const market = (prediction.market || '').toLowerCase();
  const pred = (prediction.prediction || '').toLowerCase();

  if (!result) return false;

  switch (market) {
    case 'match winner':
    case 'winner':
      return checkMatchWinner(pred, result);

    case 'both teams to score':
    case 'btts':
      return checkBTTS(pred, result);

    case 'over/under 2.5':
    case 'over/under 2.5 goals':
      return checkOverUnder25(pred, result);

    case 'cards':
    case 'over/under cards':
      return checkCards(pred, result);

    case 'corners':
    case 'over/under corners':
      return checkCorners(pred, result);

    default:
      console.warn(`⚠️ Unknown market type: ${market}`);
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

  if (prediction.includes('yes')) return bothScored;
  if (prediction.includes('no')) return !bothScored;

  return false;
}

function checkOverUnder25(prediction: string, result: any): boolean {
  const { homeScore, awayScore } = result;
  const totalGoals = homeScore + awayScore;

  if (prediction.includes('over')) return totalGoals > 2.5;
  if (prediction.includes('under')) return totalGoals < 2.5;

  return false;
}

function checkCorners(prediction: string, result: any): boolean {
  const totalCorners = (result.homeCorners || 0) + (result.awayCorners || 0);

  if (prediction.includes('over')) return totalCorners > 9.5;
  if (prediction.includes('under')) return totalCorners < 9.5;

  return false;
}

function checkCards(prediction: string, result: any): boolean {
  const totalCards = (result.homeCards || 0) + (result.awayCards || 0);

  if (prediction.includes('over')) return totalCards > 3.5;
  if (prediction.includes('under')) return totalCards < 3.5;

  return false;
}

/**
 * Settle all pending predictions for finished fixtures
 */
export async function settlePendingPredictions(): Promise<SettlementResult[]> {
  try {
    console.log('🔄 Starting result settlement (pending predictions)...');

    const pendingPredictions = await Prediction.find({ result: 'pending' });

    if (pendingPredictions.length === 0) {
      console.log('ℹ️ No pending predictions to settle');
      return [];
    }

    console.log(`📊 Found ${pendingPredictions.length} pending predictions`);

    const settlements: SettlementResult[] = [];

    for (const prediction of pendingPredictions) {
      try {
        const fixture = await Fixture.findOne({
          fixtureId: prediction.fixtureId,
        }).lean();

        if (!fixture || fixture.status !== 'finished') {
          continue; // Skip if not finished
        }

        const actualResult = buildResultFromFixture(fixture);
        if (!actualResult) {
          console.warn(
            `⚠️ Could not build result for fixture ${prediction.fixtureId}`
          );
          continue;
        }

        const isWin = checkPredictionResult(prediction, actualResult);

        const profit = isWin
          ? (prediction.odds - 1) * STAKE_PER_BET
          : -STAKE_PER_BET;

        prediction.result = isWin ? 'win' : 'loss';
        prediction.profit = profit;
        await prediction.save();

        settlements.push({
          fixtureId: prediction.fixtureId,
          match: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
          prediction: prediction.prediction,
          result: prediction.result!,
          profit,
          odds: prediction.odds,
        });

        console.log(
          `✅ Settled: ${prediction.homeTeam} vs ${prediction.awayTeam} - ${prediction.result!.toUpperCase()}`
        );
      } catch (err) {
        console.error(
          `❌ Error settling prediction ${prediction.fixtureId}:`,
          err
        );
      }
    }

    console.log(
      `✅ Settlement complete: ${settlements.length} predictions settled`
    );
    return settlements;
  } catch (err) {
    console.error('❌ Error in settlement process:', err);
    throw err;
  }
}

/**
 * Settle a specific prediction by fixture ID
 */
export async function settlePredictionByFixture(
  fixtureId: number
): Promise<SettlementResult | null> {
  try {
    const prediction = await Prediction.findOne({ fixtureId });

    if (!prediction) {
      console.log(`ℹ️ No prediction found for fixture ${fixtureId}`);
      return null;
    }

    if (prediction.result && prediction.result !== 'pending') {
      console.log(
        `ℹ️ Prediction for fixture ${fixtureId} already settled (${prediction.result})`
      );
      return null;
    }

    const fixture = await Fixture.findOne({ fixtureId }).lean();

    if (!fixture || fixture.status !== 'finished') {
      console.log(
        `ℹ️ Fixture ${fixtureId} not finished yet (status: ${
          fixture?.status || 'unknown'
        })`
      );
      return null;
    }

    const actualResult = buildResultFromFixture(fixture);
    if (!actualResult) {
      console.warn(`⚠️ Could not build result for fixture ${fixtureId}`);
      return null;
    }

    const isWin = checkPredictionResult(prediction, actualResult);

    const profit = isWin
      ? (prediction.odds - 1) * STAKE_PER_BET
      : -STAKE_PER_BET;

    prediction.result = isWin ? 'win' : 'loss';
    prediction.profit = profit;
    await prediction.save();

    const settlement: SettlementResult = {
      fixtureId,
      match: `${prediction.homeTeam} vs ${prediction.awayTeam}`,
      prediction: prediction.prediction,
      result: prediction.result!,
      profit,
      odds: prediction.odds,
    };

    console.log(
      `✅ Settled single fixture ${fixtureId}: ${settlement.result.toUpperCase()}`
    );

    return settlement;
  } catch (err) {
    console.error(
      `❌ Error settling prediction for fixture ${fixtureId}:`,
      err
    );
    throw err;
  }
}

/**
 * Summary stats for Golden Bets – used by /api/stats
 */
export async function getSettlementStats() {
  const [total, settled, pending, wins, losses] = await Promise.all([
    Prediction.countDocuments({ isGoldenBet: true }),
    Prediction.countDocuments({
      isGoldenBet: true,
      result: { $in: ['win', 'loss'] },
    }),
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
