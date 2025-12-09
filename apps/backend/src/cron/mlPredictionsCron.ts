import cron from 'node-cron';
import axios from 'axios';
import { Fixture } from '../models/Fixture.js';
import { loadGoldenBets, loadValueBets } from '../services/mlService.js';
import { predictionCache } from '../services/predictionCache.js';

const ML_API_URL = process.env.ML_API_URL || 'https://football-ml-api.onrender.com';

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

  // Keep ML API awake - ping every 10 minutes during business hours (6 AM - 11 PM UTC)
  // This prevents Render free tier from sleeping
  cron.schedule('*/10 6-23 * * *', async () => {
    try {
      await axios.get(`${ML_API_URL}/api/health`, { timeout: 5000 });
      console.log('💓 ML API keep-alive ping successful');
    } catch (error) {
      console.warn('⚠️ ML API keep-alive ping failed (API may be sleeping)');
    }
  });

  console.log('✅ ML predictions cron job scheduled: 6:00 AM UTC daily');
  console.log('   Runs after odds update (5 AM) and before bet builder (6:30 AM)');
  console.log('   Predictions cached for 24 hours');
  console.log('💓 ML API keep-alive: Every 10 minutes (6 AM - 11 PM UTC)');
}

/**
 * Generate ML predictions for today's fixtures and cache them for 24 hours
 * This pre-generates predictions so they're cached when users visit the site
 */
export async function generateDailyPredictions() {
  try {
    // First, wake up ML API if it's sleeping
    console.log('💓 Waking up ML API...');
    try {
      await axios.get(`${ML_API_URL}/api/health`, { timeout: 30000 });
      console.log('✅ ML API is awake');
    } catch (error) {
      console.warn('⚠️ ML API health check failed, but continuing anyway...');
    }

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
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Run ML predictions generation immediately (for testing/manual trigger)
 */
export async function runMLPredictionsNow(): Promise<void> {
  console.log('🤖 Running immediate ML predictions generation...');
  await generateDailyPredictions();
}
