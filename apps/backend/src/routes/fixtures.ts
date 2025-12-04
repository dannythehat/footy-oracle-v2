import { Router } from "express";
import { Fixture } from "../models/Fixture.js";
import { updateLiveScores } from "../services/liveScoresService.js";

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

// Refresh scores from API-Football
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

export default router;
