import { Router } from "express";
import { Fixture } from "../models/Fixture.js";

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
      sort = 'date'
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
      sort 
    });

    // Build query
    const query: any = {};

    // Date filtering
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
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

// Refresh scores from API-Football (stub for now)
router.post("/refresh-scores", async (req, res) => {
  try {
    const { date } = req.body;
    
    console.log(`📥 /api/fixtures/refresh-scores hit for date: ${date}`);
    
    // TODO: Implement actual API-Football score refresh
    // For now, just return success to prevent frontend errors
    
    return res.json({
      success: true,
      message: "Score refresh queued",
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

// Get head-to-head stats
router.get("/h2h", async (req, res) => {
  try {
    const { homeTeamId, awayTeamId } = req.query;
    
    console.log(`📥 /api/fixtures/h2h hit`, { homeTeamId, awayTeamId });

    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({
        success: false,
        error: "homeTeamId and awayTeamId are required"
      });
    }

    // Find previous matches between these teams
    const h2hFixtures = await Fixture.find({
      $or: [
        { homeTeamId: parseInt(homeTeamId as string), awayTeamId: parseInt(awayTeamId as string) },
        { homeTeamId: parseInt(awayTeamId as string), awayTeamId: parseInt(homeTeamId as string) }
      ],
      status: 'finished'
    })
    .sort({ date: -1 })
    .limit(10)
    .lean();

    console.log(`✅ Found ${h2hFixtures.length} H2H fixtures`);

    return res.json({
      success: true,
      data: h2hFixtures
    });
  } catch (err: any) {
    console.error("❌ H2H ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Get fixture by ID
router.get("/:fixtureId", async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    console.log(`📥 /api/fixtures/${fixtureId} hit`);

    const fixture = await Fixture.findOne({ 
      fixtureId: parseInt(fixtureId) 
    }).lean();

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: "Fixture not found"
      });
    }

    console.log(`✅ Found fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}`);

    return res.json({
      success: true,
      data: fixture
    });
  } catch (err: any) {
    console.error("❌ Fixture by ID ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// Get fixture stats
router.get("/:fixtureId/stats", async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    console.log(`📥 /api/fixtures/${fixtureId}/stats hit`);

    const fixture = await Fixture.findOne({ 
      fixtureId: parseInt(fixtureId) 
    }).lean();

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: "Fixture not found"
      });
    }

    // Return stats if available, otherwise return basic fixture data
    const stats = {
      fixture: {
        id: fixture.fixtureId,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        homeScore: fixture.homeScore || 0,
        awayScore: fixture.awayScore || 0,
        status: fixture.status
      },
      // TODO: Add actual match statistics when available
      statistics: []
    };

    console.log(`✅ Returning stats for: ${fixture.homeTeam} vs ${fixture.awayTeam}`);

    return res.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    console.error("❌ Fixture stats ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

export default router;
