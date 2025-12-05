import { Router } from "express";
import { Fixture } from "../models/Fixture.js";
import { updateLiveScores } from "../services/liveScoresService.js";
import { updateTodayOdds, updateFixtureOdds } from "../services/oddsUpdateService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { 
      date, 
      startDate, 
      endDate, 
      league, 
      leagueId,
      status, 
      limit = '50', 
      page = '1',
      sort = 'date',
      timezoneOffset // in minutes, e.g., -120 for GMT+2
    } = req.query;

    console.log("📥 /api/fixtures hit", { 
      date, 
      startDate, 
      endDate, 
      league, 
      leagueId,
      status, 
      limit, 
      page,
      sort,
      timezoneOffset
    });

    // Build query
    const query: any = {};

    // Date filtering with timezone support
    if (date) {
      const offsetMinutes = timezoneOffset ? parseInt(timezoneOffset as string) : 0;
      
      // User's local midnight converted to UTC
      // For GMT+2 (offsetMinutes = -120):
      // Local: 2025-12-04 00:00:00 GMT+2
      // UTC: 2025-12-03 22:00:00 UTC (subtract the offset)
      const start = new Date(date as string);
      start.setMinutes(start.getMinutes() - offsetMinutes);
      
      // User's local 23:59:59 converted to UTC
      // For GMT+2 (offsetMinutes = -120):
      // Local: 2025-12-04 23:59:59 GMT+2
      // UTC: 2025-12-04 21:59:59 UTC (subtract the offset)
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      end.setMinutes(end.getMinutes() - offsetMinutes);
      
      query.date = { $gte: start, $lt: end };
      
      console.log(`🌍 Timezone-adjusted query (offset: ${offsetMinutes}min):`);
      console.log(`   Start: ${start.toISOString()} (user's 00:00:00)`);
      console.log(`   End:   ${end.toISOString()} (user's 23:59:59)`);
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setDate(end.getDate() + 1);
        query.date.$lt = end;
      }
    }

    // League filtering
    if (league) {
      query.league = { $regex: league as string, $options: 'i' };
    }
    if (leagueId) {
      query.leagueId = parseInt(leagueId as string);
    }

    // Status filtering
    if (status) {
      query.status = status;
    }

    // Pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const pageNum = parseInt(page as string) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption: any = { date: 1 };
    if (sort === 'date') sortOption = { date: 1 };
    if (sort === '-date') sortOption = { date: -1 };
    if (sort === 'league') sortOption = { league: 1, date: 1 };

    // Execute query
    const [fixtures, total] = await Promise.all([
      Fixture.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Fixture.countDocuments(query)
    ]);

    console.log(`✅ Found ${fixtures.length} fixtures (${total} total)`);

    return res.json({
      success: true,
      data: fixtures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error("❌ Fixtures ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Refresh scores from API-Football (primary endpoint)
router.post("/refresh-scores", async (req, res) => {
  try {
    const { date } = req.body;
    
    console.log(`📥 /api/fixtures/refresh-scores hit for date: ${date}`);
    
    // Trigger live scores update
    const result = await updateLiveScores();
    
    return res.json({
      success: true,
      message: `Updated ${result.updated} of ${result.total} live fixtures`,
      updated: result.updated,
      total: result.total,
      date
    });
  } catch (err: any) {
    console.error("❌ Refresh scores ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Refresh scores alias (for frontend compatibility)
router.post("/refresh", async (req, res) => {
  try {
    const { date } = req.body;
    
    console.log(`📥 /api/fixtures/refresh hit for date: ${date}`);
    
    // Trigger live scores update
    const result = await updateLiveScores();
    
    return res.json({
      success: true,
      message: `Updated ${result.updated} of ${result.total} live fixtures`,
      updated: result.updated,
      total: result.total,
      date
    });
  } catch (err: any) {
    console.error("❌ Refresh ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Update odds for today's fixtures
router.post("/update-odds", async (req, res) => {
  try {
    console.log(`📥 /api/fixtures/update-odds hit`);
    
    // Trigger odds update for today's fixtures
    const result = await updateTodayOdds();
    
    return res.json({
      success: true,
      message: `Updated odds for ${result.updated} of ${result.total} fixtures`,
      updated: result.updated,
      total: result.total,
      errors: result.errors
    });
  } catch (err: any) {
    console.error("❌ Update odds ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Update odds for a specific fixture
router.post("/:fixtureId/update-odds", async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId);
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: "Invalid fixture ID"
      });
    }
    
    console.log(`📥 /api/fixtures/${fixtureId}/update-odds hit`);
    
    // Trigger odds update for specific fixture
    const success = await updateFixtureOdds(fixtureId);
    
    if (success) {
      return res.json({
        success: true,
        message: `Updated odds for fixture ${fixtureId}`
      });
    } else {
      return res.json({
        success: false,
        message: `No odds available for fixture ${fixtureId}`
      });
    }
  } catch (err: any) {
    console.error("❌ Update fixture odds ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

export default router;
