import cron from 'node-cron';
import { updateLiveScores, updateRecentlyFinishedFixtures } from '../services/liveScoresService.js';

/**
 * Cron job to update live scores
 * Runs every minute during match times to keep scores fresh
 */
export function startLiveScoresCron() {
  // Update live scores every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('🔴 Running live scores update...');
      const result = await updateLiveScores();
      
      if (result.total > 0) {
        console.log(`✅ Live scores updated: ${result.updated}/${result.total} fixtures`);
      }
    } catch (error) {
      console.error('❌ Error in live scores cron:', error);
    }
  });

  // Update recently finished fixtures every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🏁 Checking recently finished fixtures...');
      const result = await updateRecentlyFinishedFixtures();
      
      if (result.total > 0) {
        console.log(`✅ Recently finished fixtures updated: ${result.updated}/${result.total}`);
      }
    } catch (error) {
      console.error('❌ Error in recently finished fixtures cron:', error);
    }
  });

  // Run initial update on startup
  console.log('🚀 Live scores cron initialized - running initial update...');
  updateLiveScores()
    .then(result => {
      if (result.total > 0) {
        console.log(`✅ Initial live scores update: ${result.updated}/${result.total} fixtures`);
      } else {
        console.log('ℹ️  No live fixtures at startup');
      }
    })
    .catch(error => {
      console.error('❌ Error in initial live scores update:', error);
    });
}
