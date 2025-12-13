import express from "express";
import { getGoldenBetsForToday } from "../services/mlIntegrationService.js";
import { isPremiumLeague } from "../services/leagueFilter.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    console.log('📡 Golden bets endpoint called');
    
    // Get golden bets from ML API
    const result = await getGoldenBetsForToday(0.75);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch golden bets from ML API'
      });
    }
    
    const goldenBets = result.data || [];
    
    // Filter by premium leagues (already filtered in integration service, but double-check)
    const filtered = goldenBets.filter((bet: any) =>
      bet && bet.league_id && isPremiumLeague(bet.league_id)
    );
    
    // Sort by golden score (highest first)
    const sorted = filtered.sort((a: any, b: any) => 
      (b.golden_score || 0) - (a.golden_score || 0)
    );
    
    // Get top 3
    const top3 = sorted.slice(0, 3);
    
    console.log(`✅ Returning ${filtered.length} golden bets (top 3: ${top3.length})`);
    
    return res.json({
      success: true,
      total: filtered.length,
      top3,
      all: sorted
    });
  } catch (error: any) {
    console.error('❌ Error in golden bets route:', error.message);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;
