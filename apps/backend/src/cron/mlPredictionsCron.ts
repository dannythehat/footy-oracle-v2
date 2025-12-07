import cron from 'node-cron';
import { Fixture } from '../models/Fixture.js';
import { loadGoldenBets, loadValueBets } from '../services/mlService.js';
import { predictionCache } from '../services/predictionCache.js';

/**
 * Start ML predictions cron job
 * Runs daily at 6:00 AM UTC (after odds update at 5 AM, before bet builder at 6:30 AM)
 */
export function startMLPredictionsCron() {
  // Run daily at 6:00 AM UTC
  cron.schedule('0 6 * * *', async () => {
    console.log('🤖 Running daily ML predictions generation (6:00 AM UTC)...');
    await generateDailyPredictions();
  });

  console.log('✅ ML predictions cron job scheduled: 6:00 AM UTC daily');
  console.log('   Runs after odds update (5 AM) and before bet builder (6:30 AM)');
  console.log('   Predictions cached for 24 hours');
}

/**
 * Generate ML predictions for today's fixtures and cache them for 24 hours
 * This pre-generates predictions so they're cached when users visit the site
 */
export async function generateDailyPredictions() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Fetch today's fixtures
    const fixtures = await Fixture.find({
      date: { $gte: today, $lte: endOfDay },
      status: { $in: ['scheduled', 'live'] }
    });
    
    console.log(`📊 Found ${fixtures.length} fixtures for today`);
    
    if (fixtures.length === 0) {
      console.log('⚠️ No fixtures found for today - skipping ML predictions');
      return;
    }
    
    // Generate Golden Bets and cache for 24 hours
    console.log('🏆 Generating Golden Bets...');
    const goldenBets = await loadGoldenBets(fixtures);
    predictionCache.setGoldenBets(goldenBets);
    console.log(`✅ Generated and cached ${goldenBets.length} Golden Bets`);
    
    // Generate Value Bets and cache for 24 hours
    console.log('💰 Generating Value Bets...');
    const valueBets = await loadValueBets(fixtures);
    predictionCache.setValueBets(valueBets);
    console.log(`✅ Generated and cached ${valueBets.length} Value Bets`);
    
    console.log('🎉 Daily ML predictions generation complete!');
    console.log(`   Golden Bets: ${goldenBets.length} (cached for 24h)`);
    console.log(`   Value Bets: ${valueBets.length} (cached for 24h)`);
    console.log(`   Fixtures analyzed: ${fixtures.length}`);
    
    // Log cache status
    const cacheStatus = predictionCache.getStatus();
    console.log('📊 Cache status:', JSON.stringify(cacheStatus, null, 2));
    
  } catch (error: any) {
    console.error('❌ ML predictions generation failed:', error.message);
  }
}

/**
 * Run ML predictions generation immediately (for testing/manual trigger)
 */
export async function runMLPredictionsNow(): Promise<void> {
  console.log('🤖 Running immediate ML predictions generation...');
  await generateDailyPredictions();
}
