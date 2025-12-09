"use strict";
/**
 * API-Football Configuration
 * https://www.api-football.com/documentation-v3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiFootballConfig = void 0;
exports.validateApiFootballConfig = validateApiFootballConfig;
exports.apiFootballConfig = {
    apiKey: process.env.API_FOOTBALL_KEY || '',
    baseUrl: process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io',
    endpoints: {
        fixtures: '/fixtures',
        fixtureStatistics: '/fixtures/statistics',
        fixtureHeadToHead: '/fixtures/headtohead',
        fixtureEvents: '/fixtures/events',
        fixtureLineups: '/fixtures/lineups',
        teams: '/teams',
        teamStatistics: '/teams/statistics',
        standings: '/standings',
        injuries: '/injuries',
        predictions: '/predictions',
        leagues: '/leagues',
        players: '/players'
    },
    // Rate limiting
    rateLimit: {
        requestsPerMinute: 30, // Free tier: 100/day, Pro: 3000/day
        requestsPerDay: 3000
    },
    // Cache TTL (in seconds)
    cacheTTL: {
        fixtures: 300, // 5 minutes
        statistics: 3600, // 1 hour
        h2h: 86400, // 24 hours
        standings: 3600, // 1 hour
        injuries: 3600, // 1 hour
        teamStats: 3600 // 1 hour
    }
};
/**
 * Validate API-Football configuration
 */
function validateApiFootballConfig() {
    if (!exports.apiFootballConfig.apiKey) {
        console.error('❌ API_FOOTBALL_KEY is not set in environment variables');
        return false;
    }
    console.log('✅ API-Football configuration validated');
    return true;
}
