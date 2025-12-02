import { Router } from "express";
import Fixture from "../models/Fixture";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const date = req.query.date as string;

    console.log("?? /api/fixtures hit", { date });

    if (!date) {
      return res.status(400).json({ success: false, error: "Missing date" });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: start, $lt: end },
    }).lean();

    console.log("?? Fixtures found:", fixtures.length);

    return res.json({
      success: true,
      data: fixtures,
      count: fixtures.length,
    });
  } catch (err: any) {
    console.error("?? Fixtures ERROR:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

export default router;
