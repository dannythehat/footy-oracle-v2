import cron from 'node-cron';
import { loadMLPredictions, selectGoldenBets } from './mlService.js';
import { fetchFixtures, fetchOdds } from './apiFootballService.js';
import { generateBulkReasoning } from './aiService.js';
import { bettingInsightsService } from './bettingInsightsService.js';
import { settlePendingPredictions } from './resultSettlementService.js';
import { syncFeaturedSelections } from './pnlTrackingService.js';
import { findBetBuilders, saveBetBuilders } from './betBuilderService.js';
import { getBetBuilderOfTheDay } from './betBuilderOfTheDayService.js';
import { Prediction } from '../models/Prediction.js';
import { Fixture } from '../models/Fixture.js';

export function startCronJobs() {
  const schedule = process.env.PREDICTION_CRON_SCHEDULE || '0 6 * * *';
  
  // Daily prediction update job (6am)
  cron.schedule(schedule, async () => {
    console.log('🔄 Starting daily prediction update...');
    await updateDailyPredictions();
  });

  // AI Betting Insights generation (5am daily)
  cron.schedule('0 5 * * *', async () => {
    console.log('🎯 Starting AI betting insights generation...');
    await generateBettingInsights();
  });

  // Bet Builder generation (8am daily - after predictions at 6am)
  cron.schedule('0 8 * * *', async () => {
    console.log('🧠 Starting Bet Builder generation...');
    await generateBetBuilders();
  });

  // Result settlement job (runs every 2 hours)
  cron.schedule('0 */2 * * *', async () => {
    console.log('⚖️  Starting result settlement...');
    await settleResults();
  });

  // P&L sync job (runs daily at 7am, after predictions update)
  cron.schedule('0 7 * * *', async () => {
    console.log('📊 Starting P&L sync...');
    await syncPnL();
  });

  console.log(`✅ Cron jobs scheduled:`);
  console.log(`   - Daily predictions: ${schedule}`);
  console.log(`   - AI betting insights: 0 5 * * * (5am daily)`);
  console.log(`   - Bet Builder generation: 0 8 * * * (8am daily)`);
  console.log(`   - Result settlement: 0 */2 * * * (every 2 hours)`);
  console.log(`   - P&L sync: 0 7 * * * (7am daily)`);
}

async function generateBetBuilders() {
  try {
    console.log('🤖 Loading ML predictions for Bet Builder analysis...');
    const mlPredictions = await loadMLPredictions();
    
    if (!mlPredictions || mlPredictions.length === 0) {
      console.log('⚠️  No ML predictions available for Bet Builder generation');
      return;
    }
    
    // Find bet builder candidates
    console.log('🔍 Analyzing fixtures for multi-market convergence...');
    const betBuilderCandidates = findBetBuilders(mlPredictions);
    
    if (betBuilderCandidates.length === 0) {
      console.log('ℹ️  No bet builder opportunities found today');
      return;
    }
    
    console.log(`✅ Found ${betBuilderCandidates.length} bet builder opportunities`);
    
    // Generate AI reasoning for bet builders
    console.log('🧠 Generating AI reasoning for bet builders...');
    const reasoningPromises = betBuilderCandidates.map(async (candidate) => {
      const reasonings = await generateBulkReasoning([
        {
          homeTeam: candidate.fixture.home_team,
          awayTeam: candidate.fixture.away_team,
          league: candidate.fixture.league,
          market: 'Multi-Market Bet Builder',
          prediction: candidate.markets.map(m => m.marketName).join(' + '),
          odds: candidate.estimatedCombinedOdds,
          confidence: candidate.combinedConfidence,
        },
      ]);
      return { fixtureId: candidate.fixture.fixture_id, reasoning: reasonings[0] };
    });
    
    const reasoningResults = await Promise.all(reasoningPromises);
    const reasoningMap = new Map(
      reasoningResults.map(r => [r.fixtureId, r.reasoning])
    );
    
    // Save bet builders to database
    console.log('💾 Saving bet builders to database...');
    const savedBuilders = await saveBetBuilders(betBuilderCandidates, reasoningMap);
    
    console.log(`✅ Saved ${savedBuilders.length} bet builders`);
    
    // Select and log Bet Builder of the Day
    console.log('🎯 Selecting Bet Builder of the Day...');
    const { betBuilder, compositeScore } = await getBetBuilderOfTheDay();
    
    if (betBuilder) {
      console.log(`🏆 BET BUILDER OF THE DAY:`);
      console.log(`   ${betBuilder.homeTeam} vs ${betBuilder.awayTeam}`);
      console.log(`   League: ${betBuilder.league}`);
      console.log(`   Confidence: ${betBuilder.combinedConfidence}%`);
      console.log(`   Odds: ${betBuilder.estimatedCombinedOdds.toFixed(2)}x`);
      console.log(`   Composite Score: ${compositeScore?.toFixed(2)}`);
      console.log(`   Markets: ${betBuilder.markets.map(m => m.marketName).join(', ')}`);
    } else {
      console.log('ℹ️  No Bet Builder of the Day selected');
    }
    
    console.log('✅ Bet Builder generation completed');
  } catch (error) {
    console.error('❌ Error generating bet builders:', error);
  }
}

async function syncPnL() {
  try {
    await syncFeaturedSelections();
    console.log('✅ P&L sync completed - all featured selections tracked');
  } catch (error) {
    console.error('❌ Error syncing P&L:', error);
  }
}

async function generateBettingInsights() {
  try {
    console.log('🤖 Processing fixtures for AI betting insights (48 hours before kickoff)...');
    await bettingInsightsService.processUpcomingFixtures();
    console.log('✅ AI betting insights generation completed');
  } catch (error) {
    console.error('❌ Error generating betting insights:', error);
  }
}

async function settleResults() {
  try {
    const settlements = await settlePendingPredictions();
    console.log(`✅ Settled ${settlements.length} predictions`);
    
    if (settlements.length > 0) {
      const wins = settlements.filter(s => s.result === 'win').length;
      const losses = settlements.filter(s => s.result === 'loss').length;
      const totalProfit = settlements.reduce((sum, s) => sum + s.profit, 0);
      
      console.log(`   - Wins: ${wins}, Losses: ${losses}`);
      console.log(`   - Total P&L: £${totalProfit.toFixed(2)}`);
      
      // Trigger P&L sync after settlements
      await syncPnL();
    }
  } catch (error) {
    console.error('❌ Error settling results:', error);
  }
}

async function updateDailyPredictions() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Fetch today's fixtures from API-Football
    console.log('📥 Fetching fixtures...');
    const fixtures = await fetchFixtures(today);
    
    // 2. Save fixtures to database
    for (const fixture of fixtures) {
      await Fixture.findOneAndUpdate(
        { fixtureId: fixture.fixtureId },
        fixture,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Saved ${fixtures.length} fixtures`);
    
    // 3. Load ML predictions
    console.log('🤖 Loading ML predictions...');
    const mlPredictions = await loadMLPredictions();
    
    // 4. Select Golden Bets (top 3 high confidence)
    const goldenBets = selectGoldenBets(mlPredictions, 3);
    console.log(`⭐ Selected ${goldenBets.length} Golden Bets`);
    
    // 5. Fetch odds for Golden Bets
    const goldenBetsWithOdds = await Promise.all(
      goldenBets.map(async (bet) => {
        const odds = await fetchOdds(bet.fixtureId);
        const fixture = fixtures.find(f => f.fixtureId === bet.fixtureId);
        
        return {
          ...bet,
          odds: getOddsForMarket(odds, bet.market),
          date: fixture?.date || new Date().toISOString(),
          homeTeam: fixture?.homeTeam || bet.homeTeam,
          awayTeam: fixture?.awayTeam || bet.awayTeam,
        };
      })
    );
    
    // 6. Generate AI reasoning for Golden Bets
    console.log('🧠 Generating AI reasoning...');
    const reasonings = await generateBulkReasoning(
      goldenBetsWithOdds.map(bet => ({
        homeTeam: bet.homeTeam,
        awayTeam: bet.awayTeam,
        league: bet.league,
        market: bet.market,
        prediction: bet.prediction,
        odds: bet.odds,
        confidence: bet.confidence,
      }))
    );
    
    // 7. Save Golden Bets with AI reasoning
    for (let i = 0; i < goldenBetsWithOdds.length; i++) {
      const bet = goldenBetsWithOdds[i];
      await Prediction.findOneAndUpdate(
        { fixtureId: bet.fixtureId },
        {
          ...bet,
          aiReasoning: reasonings[i],
          isGoldenBet: true,
          result: 'pending',
        },
        { upsert: true, new: true }
      );
    }
    
    console.log('✅ Daily predictions updated successfully');
    
    // Sync P&L after updating predictions
    await syncPnL();
  } catch (error) {
    console.error('❌ Error updating daily predictions:', error);
  }
}

function getOddsForMarket(odds: any, market: string): number {
  if (!odds) return 2.0; // Default odds
  
  switch (market.toLowerCase()) {
    case 'match winner':
      return odds.homeWin || odds.awayWin || 2.0;
    case 'both teams to score':
      return odds.btts || 2.0;
    case 'over/under 2.5':
      return odds.over25 || odds.under25 || 2.0;
    default:
      return 2.0;
  }
}

// Export for manual trigger
export { 
  updateDailyPredictions, 
  generateBettingInsights, 
  settleResults, 
  syncPnL,
  generateBetBuilders 
};
