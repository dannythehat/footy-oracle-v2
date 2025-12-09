import { Router } from "express";
import { Fixture } from "../models/Fixture.js";

const router = Router();

// -----------------------------------------
// SIMPLE, RELIABLE FIXTURES QUERY
// -----------------------------------------
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Missing ?date=YYYY-MM-DD"
      });
    }

    // Build clean date boundaries
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const fixtures = await Fixture.find({
      date: { $gte: start, $lt: end }
    })
      .sort({ date: 1 })
      .lean();

    return res.json({
      success: true,
      data: fixtures
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// -----------------------------------------
// LEGACY SUPPORT (falls back to main route)
// -----------------------------------------
router.get("/today", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  return res.redirect(`/api/fixtures?date=${today}`);
});

router.get("/:dateParam", (req, res) => {
  const d = req.params.dateParam;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return res.redirect(`/api/fixtures?date=${d}`);
  }
  return res.status(404).json({ success: false, error: "Invalid date" });
});

export default router;
