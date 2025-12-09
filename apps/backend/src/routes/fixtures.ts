import { Router } from "express";
import { Fixture } from "../models/Fixture.js";
import { updateLiveScores } from "../services/liveScoresService.js";
import { updateTodayOdds, updateFixtureOdds } from "../services/oddsUpdateService.js";

const router = Router();

// ? ADD THIS: /today endpoint (fixes 404)
router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const start = new Date(today + "T00:00:00.000Z");
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

    const fixtures = await Fixture.find({
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .lean();

    return res.json({
      success: true,
      data: fixtures,
      date: today,
    });
  } catch (err: any) {
    console.error("Fixtures /today ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ? ORIGINAL ROUTE BELOW (leave untouched)
router.get("/", async (req, res) => {
  try {
    const {
      date,
      startDate,
      endDate,
      league,
      leagueId,
      status,
      limit = "1000",
      page = "1",
      sort = "date",
      timezoneOffset,
    } = req.query;

    const query: any = {};

    if (date) {
      const offsetMinutes = timezoneOffset
        ? parseInt(timezoneOffset as string)
        : 0;

      const dateStr = date as string;
      const baseDate = new Date(dateStr + "T00:00:00.000Z");
      const start = new Date(
        baseDate.getTime() - offsetMinutes * 60 * 1000
      );
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

      query.date = { $gte: start, $lte: end };
    }

    if (league) query.league = { $regex: league as string, $options: "i" };
    if (leagueId) query.leagueId = parseInt(leagueId as string);
    if (status) query.status = status;

    const limitNum = parseInt(limit as string) || 1000;
    const pageNum = parseInt(page as string) || 1;
    const skip = (pageNum - 1) * limitNum;

    const [fixtures, total] = await Promise.all([
      Fixture.find(query).sort({ date: 1 }).skip(skip).limit(limitNum).lean(),
      Fixture.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: fixtures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    console.error("Fixtures ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

// refresh endpoints preserved…
router.post("/refresh-scores", async (req, res) => {
  try {
    const result = await updateLiveScores();
    return res.json({
      success: true,
      message: `Updated ${result.updated} live fixtures`,
      ...result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/update-odds", async (req, res) => {
  try {
    const result = await updateTodayOdds();
    return res.json({
      success: true,
      updated: result.updated,
      total: result.total,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/:fixtureId/update-odds", async (req, res) => {
  try {
    const fixtureId = parseInt(req.params.fixtureId);
    const success = await updateFixtureOdds(fixtureId);
    return res.json({
      success,
      message: success
        ? `Updated odds for fixture ${fixtureId}`
        : `No odds for fixture ${fixtureId}`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
 // Legacy /today endpoint
router.get("/today", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  return res.redirect(`/api/fixtures?date=${today}`);
});

// Legacy wildcard date endpoint
router.get("/:dateParam", async (req, res) => {
  const { dateParam } = req.params;

  const date =
    dateParam.toLowerCase() === "today"
      ? new Date().toISOString().split("T")[0]
      : dateParam;

  return res.redirect(`/api/fixtures?date=${date}`);
});
