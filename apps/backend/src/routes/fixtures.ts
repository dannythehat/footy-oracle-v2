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

export default router;
