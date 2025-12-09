"use strict";
/**
 * Bet Builder Brain Configuration
 *
 * Defines thresholds and league tiers for multi-market convergence detection
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BET_BUILDER_CONFIG = void 0;
exports.getAllSupportedLeagues = getAllSupportedLeagues;
exports.isLeagueSupported = isLeagueSupported;
exports.getConfidenceThreshold = getConfidenceThreshold;
exports.BET_BUILDER_CONFIG = {
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
function getAllSupportedLeagues() {
    return __spreadArray(__spreadArray([], exports.BET_BUILDER_CONFIG.TIER_1_LEAGUES, true), exports.BET_BUILDER_CONFIG.TIER_2_LEAGUES, true);
}
/**
 * Check if a league is supported for bet builders
 */
function isLeagueSupported(league) {
    return getAllSupportedLeagues().includes(league);
}
/**
 * Get confidence threshold for a specific league tier
 */
function getConfidenceThreshold(league) {
    if (exports.BET_BUILDER_CONFIG.TIER_1_LEAGUES.includes(league)) {
        return exports.BET_BUILDER_CONFIG.MIN_CONFIDENCE;
    }
    if (exports.BET_BUILDER_CONFIG.TIER_2_LEAGUES.includes(league)) {
        return exports.BET_BUILDER_CONFIG.MIN_CONFIDENCE;
    }
    // Not supported
    return 100; // Impossible threshold
}
