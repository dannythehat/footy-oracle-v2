import express from "express";
import { getValueBetsForToday } from "../services/mlIntegrationService.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    console.log('📡 Value bets endpoint called');
    
    // Get value bets from ML API
    const result = await getValueBetsForToday(0.05);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch value bets from ML API'
      });
    }
    
    const valueBets = result.data || [];
    
    // Sort by expected value (highest first)
    const sorted = valueBets.sort((a: any, b: any) => 
      (b.expected_value || 0) - (a.expected_value || 0)
    );
    
    console.log(`✅ Returning ${sorted.length} value bets`);
    
    return res.json({
      success: true,
      total: sorted.length,
      valueBets: sorted
    });
  } catch (error: any) {
    console.error('❌ Error in value bets route:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
