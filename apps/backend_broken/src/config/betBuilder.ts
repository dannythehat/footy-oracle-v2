/**
 * Bet Builder Brain Configuration
 * 
 * Defines thresholds and league tiers for multi-market convergence detection
 */

export const BET_BUILDER_CONFIG = {
  // Top-tier leagues with highest data quality
  TIER_1_LEAGUES: [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
  ],
  
  // Secondary tier leagues with good data quality
  TIER_2_LEAGUES: [
    'Championship',
    '2. Bundesliga',
  ],
  
  // Minimum confidence percentage per market (75% = high confidence)
  MIN_CONFIDENCE: 75,
  
  // Minimum probability for market prediction (0.75 = 75%)
  MIN_PROBABILITY: 0.75,
  
  // Minimum number of markets that must meet thresholds
  MIN_MARKETS: 3,
  
  // Maximum bet builders to return per day (quality over quantity)
  MAX_DAILY_BUILDERS: 5,
  
  // Estimated odds per market (used for combined odds calculation)
  // These are approximate odds for ~2.0 markets
  MARKET_ODDS: {
    'btts': 2.0,
    'over_2_5_goals': 2.0,
    'over_9_5_corners': 2.0,
    'over_3_5_cards': 2.0,
  },
  
  // Market display names
  MARKET_NAMES: {
    'btts': 'Both Teams To Score',
    'over_2_5_goals': 'Over 2.5 Goals',
    'over_9_5_corners': 'Over 9.5 Corners',
    'over_3_5_cards': 'Over 3.5 Cards',
  },
  
  // Ultra-high confidence threshold for special highlighting
  ULTRA_CONFIDENCE_THRESHOLD: 85,
};

/**
 * Get all supported leagues (Tier 1 + Tier 2)
 */
export function getAllSupportedLeagues(): string[] {
  return [
    ...BET_BUILDER_CONFIG.TIER_1_LEAGUES,
    ...BET_BUILDER_CONFIG.TIER_2_LEAGUES,
  ];
}

/**
 * Check if a league is supported for bet builders
 */
export function isLeagueSupported(league: string): boolean {
  return getAllSupportedLeagues().includes(league);
}

/**
 * Get confidence threshold for a specific league tier
 */
export function getConfidenceThreshold(league: string): number {
  if (BET_BUILDER_CONFIG.TIER_1_LEAGUES.includes(league)) {
    return BET_BUILDER_CONFIG.MIN_CONFIDENCE;
  }
  if (BET_BUILDER_CONFIG.TIER_2_LEAGUES.includes(league)) {
    return BET_BUILDER_CONFIG.MIN_CONFIDENCE;
  }
  // Not supported
  return 100; // Impossible threshold
}
