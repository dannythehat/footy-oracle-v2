import { Router } from 'express';
import { importBetBuilders, importBetBuildersFromAPI } from '../services/betBuilderImporter.js';
import { runBetBuilderImportNow } from '../cron/betBuilderCron.js';
import { exportFixturesForML, getExportStatus } from '../services/fixtureExportService.js';
import { updateLiveScores, updateRecentlyFinishedFixtures } from '../services/liveScoresService.js';
import { runMLPredictionsNow } from '../cron/mlPredictionsCron.js';

const router = Router();

/**
 * POST /api/admin/generate-predictions
 * Manually trigger ML predictions generation (Golden Bets + Value Bets)
 */
router.post('/generate-predictions', async (req, res) => {
  try {
    console.log('🤖 Manual ML predictions generation triggered');
    
    await runMLPredictionsNow();
    
    res.json({
      success: true,
      message: 'ML predictions generated successfully',
      note: 'Golden Bets and Value Bets have been generated for today\'s fixtures',
    });
  } catch (error: any) {
    console.error('Error generating predictions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/update-live-scores
 * Manually trigger live score updates (bypasses cron)
 */
router.post('/update-live-scores', async (req, res) => {
  try {
    console.log('🔴 Manual live score update triggered');
    
    // Update both live and recently finished fixtures
    const liveResult = await updateLiveScores();
    const finishedResult = await updateRecentlyFinishedFixtures();
    
    res.json({
      success: true,
      message: 'Live score update completed',
      results: {
        live_fixtures: {
          updated: liveResult.updated,
          total: liveResult.total,
        },
        recently_finished: {
          updated: finishedResult.updated,
          total: finishedResult.total,
        },
        total_updated: liveResult.updated + finishedResult.updated,
      },
    });
  } catch (error: any) {
    console.error('Error updating live scores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/export-fixtures-ml
 * Export today's fixtures for ML processing
 */
router.post('/export-fixtures-ml', async (req, res) => {
  try {
    console.log('📤 Manual ML fixture export triggered');
    
    await exportFixturesForML();
    
    res.json({
      success: true,
      message: 'Fixtures exported successfully for ML processing',
      next_steps: [
        '1. Run ML prediction scripts in football-betting-ai-system repo',
        '2. ML will generate predictions for 4 markets (BTTS, Over 2.5, Corners, Cards)',
        '3. Outputs will be written to shared/ml_outputs/',
        '4. Frontend will display Golden Bets, Value Bets, and Bet Builders',
      ],
    });
  } catch (error: any) {
    console.error('Error exporting fixtures:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/ml-status
 * Check ML integration status
 */
router.get('/ml-status', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Check ML input file
    const inputPath = path.join(__dirname, '../../../../shared/ml_inputs/fixtures_today.json');
    const inputExists = fs.existsSync(inputPath);
    let inputData = null;
    if (inputExists) {
      const content = fs.readFileSync(inputPath, 'utf-8');
      inputData = JSON.parse(content);
    }
    
    // Check ML output files
    const outputDir = path.join(__dirname, '../../../../shared/ml_outputs');
    const predictionsPath = path.join(outputDir, 'predictions.json');
    const goldenBetsPath = path.join(outputDir, 'golden_bets.json');
    const valueBetsPath = path.join(outputDir, 'value_bets.json');
    const betBuilderPath = path.join(outputDir, 'bet_builder.json');
    
    const predictionsExists = fs.existsSync(predictionsPath);
    const goldenBetsExists = fs.existsSync(goldenBetsPath);
    const valueBetsExists = fs.existsSync(valueBetsPath);
    const betBuilderExists = fs.existsSync(betBuilderPath);
    
    let predictionsData = null;
    let goldenBetsData = null;
    let valueBetsData = null;
    let betBuilderData = null;
    
    if (predictionsExists) {
      const content = fs.readFileSync(predictionsPath, 'utf-8');
      predictionsData = JSON.parse(content);
    }
    if (goldenBetsExists) {
      const content = fs.readFileSync(goldenBetsPath, 'utf-8');
      goldenBetsData = JSON.parse(content);
    }
    if (valueBetsExists) {
      const content = fs.readFileSync(valueBetsPath, 'utf-8');
      valueBetsData = JSON.parse(content);
    }
    if (betBuilderExists) {
      const content = fs.readFileSync(betBuilderPath, 'utf-8');
      betBuilderData = JSON.parse(content);
    }
    
    // Get export status
    const exportStatus = await getExportStatus();
    
    res.json({
      success: true,
      ml_integration: {
        input: {
          file_exists: inputExists,
          path: inputPath,
          fixtures_count: inputData?.length || 0,
          status: inputExists && inputData?.length > 0 ? '✅ Ready' : '❌ Missing',
        },
        outputs: {
          predictions: {
            file_exists: predictionsExists,
            count: Array.isArray(predictionsData) ? predictionsData.length : 0,
            has_data: predictionsData && predictionsData.length > 0 && predictionsData[0]?.predictions?.over25 !== null,
            status: predictionsExists && predictionsData?.length > 0 ? '✅ Generated' : '❌ Empty',
          },
          golden_bets: {
            file_exists: goldenBetsExists,
            count: Array.isArray(goldenBetsData) ? goldenBetsData.length : 0,
            status: goldenBetsExists && goldenBetsData?.length > 0 ? '✅ Generated' : '❌ Empty',
          },
          value_bets: {
            file_exists: valueBetsExists,
            count: Array.isArray(valueBetsData) ? valueBetsData.length : 0,
            status: valueBetsExists && valueBetsData?.length > 0 ? '✅ Generated' : '❌ Empty',
          },
          bet_builder: {
            file_exists: betBuilderExists,
            count: Array.isArray(betBuilderData) ? betBuilderData.length : 0,
            status: betBuilderExists && betBuilderData?.length > 0 ? '✅ Generated' : '❌ Empty',
          },
        },
        export_status: exportStatus,
      },
      instructions: {
        step_1: 'POST /api/admin/export-fixtures-ml to export fixtures',
        step_2: 'Run ML scripts in football-betting-ai-system repo',
        step_3: 'Check this endpoint again to verify outputs',
      },
    });
  } catch (error: any) {
    console.error('Error checking ML status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

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
