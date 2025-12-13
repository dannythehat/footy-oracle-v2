import express from "express";
import { getBetBuilderOfTheDay } from "../services/betBuilderOfTheDayService.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const result = await getBetBuilderOfTheDay();
    
    if (!result.betBuilder) {
      return res.json({
        success: true,
        betBuilder: null,
        message: "No bet builder available for today"
      });
    }

    return res.json({
      success: true,
      betBuilder: result.betBuilder,
      reasoning: result.reasoning,
      compositeScore: result.compositeScore
    });
  } catch (error: any) {
    console.error("Bet Builder route error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
