import cron from 'node-cron';
import { loadMLPredictions, selectGoldenBets } from './mlService.js';
import { fetchFixtures, fetchOdds } from './apiFootballService.js';
import { generateBulkReasoning } from './aiService.js';
import { bettingInsightsService } from './bettingInsightsService.js';
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

  console.log(`✅ Cron jobs scheduled:`);
  console.log(`   - Daily predictions: ${schedule}`);
  console.log(`   - AI betting insights: 0 5 * * * (5am daily)`);
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
export { updateDailyPredictions, generateBettingInsights };
