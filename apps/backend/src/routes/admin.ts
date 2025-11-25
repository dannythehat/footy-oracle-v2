import { Router } from 'express';
import { importBetBuilders, importBetBuildersFromAPI } from '../services/betBuilderImporter.js';
import { runBetBuilderImportNow } from '../cron/betBuilderCron.js';

const router = Router();

/**
 * POST /api/admin/import-bet-builders
 * Manually trigger bet builder import from file
 */
router.post('/import-bet-builders', async (req, res) => {
  try {
    console.log('🧠 Manual bet builder import triggered');
    
    const stats = await importBetBuilders();
    
    res.json({
      success: stats.success,
      message: stats.success 
        ? 'Bet builder import completed successfully' 
        : 'Bet builder import failed',
      stats: {
        imported: stats.imported,
        skipped: stats.skipped,
        errors: stats.errors,
      },
    });
  } catch (error: any) {
    console.error('Error in manual import:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/import-bet-builders-api
 * Manually trigger bet builder import from API
 */
router.post('/import-bet-builders-api', async (req, res) => {
  try {
    const { apiUrl } = req.body;
    console.log('🧠 Manual bet builder API import triggered');
    
    const stats = await importBetBuildersFromAPI(apiUrl);
    
    res.json({
      success: stats.success,
      message: stats.success 
        ? 'Bet builder API import completed successfully' 
        : 'Bet builder API import failed',
      stats: {
        imported: stats.imported,
        skipped: stats.skipped,
        errors: stats.errors,
      },
    });
  } catch (error: any) {
    console.error('Error in manual API import:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/run-bet-builder-cron
 * Manually trigger the cron job logic
 */
router.post('/run-bet-builder-cron', async (req, res) => {
  try {
    console.log('🧠 Manual cron job execution triggered');
    
    await runBetBuilderImportNow();
    
    res.json({
      success: true,
      message: 'Bet builder cron job executed successfully',
    });
  } catch (error: any) {
    console.error('Error running cron job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/bet-builder-status
 * Check bet builder import status
 */
router.get('/bet-builder-status', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../../../shared/ml_outputs/bet_builders.json');
    
    const fileExists = fs.existsSync(filePath);
    let fileData = null;
    
    if (fileExists) {
      const content = fs.readFileSync(filePath, 'utf-8');
      fileData = JSON.parse(content);
    }
    
    res.json({
      success: true,
      status: {
        fileExists,
        filePath,
        lastGenerated: fileData?.generated_at || null,
        betBuildersCount: fileData?.bet_builders_found || 0,
        date: fileData?.date || null,
      },
    });
  } catch (error: any) {
    console.error('Error checking status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
