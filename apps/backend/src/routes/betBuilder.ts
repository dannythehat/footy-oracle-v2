import express from "express";


const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const bb = await null;

    return res.json({
      success: true,
      betBuilder: bb || null
    });
  } catch {
    return res.status(500).json({ success: false });
  }
});

export default router;

