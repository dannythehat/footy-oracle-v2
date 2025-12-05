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
      limit = '1000',  // ✅ High default to handle busy days with 600+ games
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

    // Date filtering with SIMPLIFIED timezone support
    if (date) {
      const offsetMinutes = timezoneOffset ? parseInt(timezoneOffset as string) : 0;
      
      // SIMPLIFIED APPROACH:
      // 1. Parse the date string as UTC midnight
      // 2. Subtract the timezone offset to get user's local midnight in UTC
      // 3. Add 24 hours minus 1ms to get end of day
      //
      // Example: User in GMT+2 (offset = -120) selects "2025-12-05"
      // - Start: 2025-12-05 00:00:00 UTC - (-120 min) = 2025-12-04 22:00:00 UTC
      // - End: 2025-12-05 00:00:00 UTC - (-120 min) + 24h - 1ms = 2025-12-05 21:59:59.999 UTC
      // - This captures all fixtures from Dec 5 00:00:00 to 23:59:59.999 in GMT+2
      
      const dateStr = date as string;
      const baseDate = new Date(dateStr + 'T00:00:00.000Z'); // Parse as UTC midnight
      
      // Calculate start of day in user's timezone (converted to UTC)
      const start = new Date(baseDate.getTime() - (offsetMinutes * 60 * 1000));
      
      // Calculate end of day in user's timezone (converted to UTC)
      // Add 24 hours minus 1 millisecond to get 23:59:59.999
      const end = new Date(start.getTime() + (24 * 60 * 60 * 1000) - 1);
      
      query.date = { $gte: start, $lte: end };
      
      console.log(`🌍 Timezone-adjusted query (offset: ${offsetMinutes}min):`);
      console.log(`   User's date: ${dateStr}`);
      console.log(`   UTC Start: ${start.toISOString()} (user's 00:00:00)`);
      console.log(`   UTC End:   ${end.toISOString()} (user's 23:59:59.999)`);
      console.log(`   Range: ${(end.getTime() - start.getTime()) / 1000 / 60 / 60} hours`);
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

    // Pagination - NO CAP, allow any limit
    const limitNum = parseInt(limit as string) || 1000;
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
    
    // Debug: Log first and last fixture times if any exist
    if (fixtures.length > 0) {
      const firstFixture = fixtures[0] as any;
      const lastFixture = fixtures[fixtures.length - 1] as any;
      console.log(`   First fixture: ${new Date(firstFixture.date).toISOString()}`);
      console.log(`   Last fixture:  ${new Date(lastFixture.date).toISOString()}`);
    }

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
