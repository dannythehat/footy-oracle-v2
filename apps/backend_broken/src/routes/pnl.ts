import { Router } from 'express';
import { 
  getPnLBreakdown, 
  getHistoricalSelections, 
  syncFeaturedSelections,
  updateSelectionResult 
} from '../services/pnlTrackingService.js';

const router = Router();

/**
 * GET /api/pnl/breakdown
 * Get P&L statistics breakdown by selection type
 * Query params: period (daily|weekly|monthly|yearly|all)
 */
router.get('/breakdown', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    const breakdown = await getPnLBreakdown(period as any);
    
    res.json({
      success: true,
      data: breakdown,
      period,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/pnl/history
 * Get historical selections with filtering
 * Query params: 
 *   - selectionType (golden-bet|bet-builder|value-bet)
 *   - result (win|loss|pending|void)
 *   - startDate (ISO date)
 *   - endDate (ISO date)
 *   - page (number)
 *   - limit (number)
 */
router.get('/history', async (req, res) => {
  try {
    const { 
      selectionType, 
      result, 
      startDate, 
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const options: any = {
      limit: limitNum,
      skip,
    };

    if (selectionType) options.selectionType = selectionType;
    if (result) options.result = result;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);

    const data = await getHistoricalSelections(options);
    
    res.json({
      success: true,
      data: data.selections,
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/pnl/sync
 * Manually trigger sync of featured selections
 * (This should also run automatically via cron)
 */
router.post('/sync', async (req, res) => {
  try {
    await syncFeaturedSelections();
    
    res.json({
      success: true,
      message: 'Featured selections synced successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/pnl/result
 * Update a selection result
 * Body: { fixtureId, selectionType, result }
 */
router.put('/result', async (req, res) => {
  try {
    const { fixtureId, selectionType, result } = req.body;

    if (!fixtureId || !selectionType || !result) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fixtureId, selectionType, result',
      });
    }

    if (!['golden-bet', 'bet-builder', 'value-bet'].includes(selectionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid selectionType. Must be: golden-bet, bet-builder, or value-bet',
      });
    }

    if (!['win', 'loss', 'void'].includes(result)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result. Must be: win, loss, or void',
      });
    }

    const selection = await updateSelectionResult(
      parseInt(fixtureId),
      selectionType,
      result
    );

    if (!selection) {
      return res.status(404).json({
        success: false,
        error: 'Selection not found',
      });
    }

    res.json({
      success: true,
      data: selection,
      message: 'Selection result updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/pnl/summary
 * Get quick summary stats for dashboard
 */
router.get('/summary', async (req, res) => {
  try {
    const [daily, weekly, monthly, allTime] = await Promise.all([
      getPnLBreakdown('daily'),
      getPnLBreakdown('weekly'),
      getPnLBreakdown('monthly'),
      getPnLBreakdown('all'),
    ]);

    res.json({
      success: true,
      data: {
        daily: daily.overall,
        weekly: weekly.overall,
        monthly: monthly.overall,
        allTime: allTime.overall,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
