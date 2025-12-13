import express from "express";
import { getBetBuilderOfTheDay } from "../services/betBuilderOfTheDayService.js";

const router = express.Router();

// Get today's Bet Builder of the Day
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

// Manual trigger endpoint for testing
router.post("/generate", async (req, res) => {
  try {
    console.log("🎯 Manual trigger: Generating Bet Builder of the Day...");
    
    const result = await getBetBuilderOfTheDay();
    
    if (!result.betBuilder) {
      return res.json({
        success: true,
        betBuilder: null,
        message: "No bet builder could be generated. Check if fixtures are available."
      });
    }

    return res.json({
      success: true,
      message: "Bet Builder of the Day generated successfully",
      betBuilder: result.betBuilder,
      reasoning: result.reasoning,
      compositeScore: result.compositeScore
    });
  } catch (error: any) {
    console.error("Manual bet builder generation error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
