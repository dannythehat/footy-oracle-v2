import cron from 'node-cron';
import { importBetBuilders } from '../services/betBuilderImporter.js';

/**
 * Schedule daily bet builder import
 * Runs at 6:30 AM UTC (after LM System generates predictions at 6:00 AM)
 */
export function scheduleBetBuilderImport(): void {
  const schedule = process.env.BET_BUILDER_CRON_SCHEDULE || '30 6 * * *';
  
  cron.schedule(schedule, async () => {
    console.log('🧠 Running scheduled bet builder import...');
    console.log(`Time: ${new Date().toISOString()}`);
    
    try {
      const stats = await importBetBuilders();
      
      if (stats.success) {
        console.log('✅ Bet builder import completed successfully');
        console.log(`📊 Stats: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.errors} errors`);
      } else {
        console.error('❌ Bet builder import failed');
      }
    } catch (error) {
      console.error('❌ Bet builder import error:', error);
    }
  });

  console.log(`✅ Bet builder cron job scheduled: ${schedule}`);
  console.log('   Default: 6:30 AM UTC daily (after LM System generates at 6:00 AM)');
}

/**
 * Run bet builder import immediately (for testing)
 */
export async function runBetBuilderImportNow(): Promise<void> {
  console.log('🧠 Running immediate bet builder import...');
  
  try {
    const stats = await importBetBuilders();
    
    if (stats.success) {
      console.log('✅ Immediate import completed successfully');
      console.log(`📊 Stats: ${stats.imported} imported, ${stats.skipped} skipped, ${stats.errors} errors`);
    } else {
      console.error('❌ Immediate import failed');
    }
  } catch (error) {
    console.error('❌ Immediate import error:', error);
    throw error;
  }
}
