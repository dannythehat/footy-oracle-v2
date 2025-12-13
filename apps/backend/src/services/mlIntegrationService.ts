import axios from 'axios';
import { isPremiumLeague } from './leagueFilter.js';
import * as mlService from './mlService.js';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

const apiFootballClient = axios.create({
  baseURL: API_FOOTBALL_BASE,
  headers: {
    'x-apisports-key': API_FOOTBALL_KEY,
  },
  timeout: 15000,
});

const mlClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 30000,
});

interface Fixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
  };
  league: {
    id: number;
    name: string;
    country: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
}

interface TeamStats {
  team_id: number;
  goals_scored_avg: number;
  goals_conceded_avg: number;
  btts_percentage: number;
  over25_percentage: number;
  corners_avg: number;
  cards_avg: number;
  form: string;
  wins: number;
  draws: number;
  losses: number;
}

/**
 * Fetch today's fixtures from API-Football
 */
async function fetchTodaysFixtures(): Promise<Fixture[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Fetching fixtures for ${today}...`);
    
    const response = await apiFootballClient.get('/fixtures', {
      params: {
        date: today,
      },
    });
    
    if (response.data.response) {
      const fixtures = response.data.response;
      console.log(`✅ Fetched ${fixtures.length} total fixtures`);
      
      // Filter by premium leagues
      const premiumFixtures = fixtures.filter((f: Fixture) => 
        isPremiumLeague(f.league.id)
      );
      
      console.log(`🎯 Filtered to ${premiumFixtures.length} premium league fixtures`);
      return premiumFixtures;
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching fixtures:', error.message);
    return [];
  }
}

/**
 * Fetch team statistics for feature engineering
 */
async function fetchTeamStats(teamId: number, leagueId: number, season: number): Promise<TeamStats | null> {
  try {
    const response = await apiFootballClient.get('/teams/statistics', {
      params: {
        team: teamId,
        league: leagueId,
        season: season,
      },
    });
    
    if (response.data.response) {
      const stats = response.data.response;
      
      return {
        team_id: teamId,
        goals_scored_avg: stats.goals?.for?.average?.total || 0,
        goals_conceded_avg: stats.goals?.against?.average?.total || 0,
        btts_percentage: (stats.goals?.for?.total?.total > 0 && stats.goals?.against?.total?.total > 0) ? 0.5 : 0,
        over25_percentage: 0.5, // Placeholder
        corners_avg: 5.0, // Placeholder
        cards_avg: 2.5, // Placeholder
        form: stats.form || 'DDDDD',
        wins: stats.fixtures?.wins?.total || 0,
        draws: stats.fixtures?.draws?.total || 0,
        losses: stats.fixtures?.loses?.total || 0,
      };
    }
    
    return null;
  } catch (error) {
    console.warn(`⚠️  Could not fetch stats for team ${teamId}`);
    return null;
  }
}

/**
 * Prepare features for ML API
 * This is a simplified version - you should expand based on your ML model's feature requirements
 */
function prepareFeatures(
  fixture: Fixture,
  homeStats: TeamStats | null,
  awayStats: TeamStats | null
): Record<string, number> {
  // Default features if stats not available
  const defaultFeatures = {
    home_goals_scored_avg: 1.5,
    home_goals_conceded_avg: 1.2,
    away_goals_scored_avg: 1.3,
    away_goals_conceded_avg: 1.4,
    home_btts_percentage: 0.5,
    away_btts_percentage: 0.5,
    home_over25_percentage: 0.5,
    away_over25_percentage: 0.5,
    home_corners_avg: 5.0,
    away_corners_avg: 4.8,
    home_cards_avg: 2.5,
    away_cards_avg: 2.3,
    home_form_points: 5,
    away_form_points: 5,
    is_home_favorite: 1,
    league_id: fixture.league.id,
  };
  
  if (!homeStats || !awayStats) {
    return defaultFeatures;
  }
  
  // Calculate form points (W=3, D=1, L=0)
  const homeFormPoints = (homeStats.wins * 3) + homeStats.draws;
  const awayFormPoints = (awayStats.wins * 3) + awayStats.draws;
  
  return {
    home_goals_scored_avg: homeStats.goals_scored_avg,
    home_goals_conceded_avg: homeStats.goals_conceded_avg,
    away_goals_scored_avg: awayStats.goals_scored_avg,
    away_goals_conceded_avg: awayStats.goals_conceded_avg,
    home_btts_percentage: homeStats.btts_percentage,
    away_btts_percentage: awayStats.btts_percentage,
    home_over25_percentage: homeStats.over25_percentage,
    away_over25_percentage: awayStats.over25_percentage,
    home_corners_avg: homeStats.corners_avg,
    away_corners_avg: awayStats.corners_avg,
    home_cards_avg: homeStats.cards_avg,
    away_cards_avg: awayStats.cards_avg,
    home_form_points: homeFormPoints,
    away_form_points: awayFormPoints,
    is_home_favorite: homeFormPoints > awayFormPoints ? 1 : 0,
    league_id: fixture.league.id,
  };
}

/**
 * Fetch odds for a fixture (placeholder - implement based on your odds provider)
 */
async function fetchOdds(fixtureId: number): Promise<Record<string, number> | null> {
  // TODO: Implement odds fetching from your odds provider
  // For now, return null
  return null;
}

/**
 * Main function: Get predictions for today's fixtures
 */
export async function getPredictionsForToday() {
  try {
    console.log('🚀 Starting ML prediction pipeline...');
    
    // Step 1: Fetch today's fixtures
    const fixtures = await fetchTodaysFixtures();
    
    if (fixtures.length === 0) {
      console.log('ℹ️  No fixtures found for today');
      return {
        success: true,
        count: 0,
        predictions: [],
      };
    }
    
    // Step 2: Prepare fixture data with features
    const currentYear = new Date().getFullYear();
    const fixturesWithFeatures = [];
    
    for (const fixture of fixtures) {
      console.log(`📊 Preparing features for ${fixture.teams.home.name} vs ${fixture.teams.away.name}...`);
      
      // Fetch team stats (with rate limiting consideration)
      const homeStats = await fetchTeamStats(
        fixture.teams.home.id,
        fixture.league.id,
        currentYear
      );
      
      const awayStats = await fetchTeamStats(
        fixture.teams.away.id,
        fixture.league.id,
        currentYear
      );
      
      // Prepare features
      const features = prepareFeatures(fixture, homeStats, awayStats);
      
      // Fetch odds
      const odds = await fetchOdds(fixture.fixture.id);
      
      fixturesWithFeatures.push({
        fixture_id: fixture.fixture.id,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        league_id: fixture.league.id,
        league_name: fixture.league.name,
        date: fixture.fixture.date,
        features: features,
        odds: odds,
      });
    }
    
    // Step 3: Call ML API
    console.log(`🤖 Calling ML API with ${fixturesWithFeatures.length} fixtures...`);
    
    const response = await mlClient.post('/predictions', {
      fixtures: fixturesWithFeatures,
    });
    
    if (response.data.success) {
      console.log(`✅ ML API returned ${response.data.count} predictions`);
      return response.data;
    }
    
    throw new Error('ML API returned unsuccessful response');
  } catch (error: any) {
    console.error('❌ Error in ML prediction pipeline:', error.message);
    throw error;
  }
}

/**
 * Get golden bets for today
 */
export async function getGoldenBetsForToday(minConfidence: number = 0.75) {
  try {
    console.log('🏆 Starting golden bets pipeline...');
    
    const fixtures = await fetchTodaysFixtures();
    
    if (fixtures.length === 0) {
      return {
        success: true,
        count: 0,
        data: [],
      };
    }
    
    // Prepare fixtures (same as predictions)
    const currentYear = new Date().getFullYear();
    const fixturesWithFeatures = [];
    
    for (const fixture of fixtures) {
      const homeStats = await fetchTeamStats(fixture.teams.home.id, fixture.league.id, currentYear);
      const awayStats = await fetchTeamStats(fixture.teams.away.id, fixture.league.id, currentYear);
      const features = prepareFeatures(fixture, homeStats, awayStats);
      const odds = await fetchOdds(fixture.fixture.id);
      
      fixturesWithFeatures.push({
        fixture_id: fixture.fixture.id,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        league_id: fixture.league.id,
        league_name: fixture.league.name,
        date: fixture.fixture.date,
        features: features,
        odds: odds,
      });
    }
    
    // Call ML API golden bets endpoint
    const response = await mlClient.post('/golden-bets', {
      fixtures: fixturesWithFeatures,
      min_confidence: minConfidence,
    });
    
    if (response.data.success) {
      console.log(`✅ ML API returned ${response.data.count} golden bets`);
      return response.data;
    }
    
    throw new Error('ML API returned unsuccessful response');
  } catch (error: any) {
    console.error('❌ Error in golden bets pipeline:', error.message);
    throw error;
  }
}

/**
 * Get value bets for today
 */
export async function getValueBetsForToday(minEdge: number = 0.05) {
  try {
    console.log('💎 Starting value bets pipeline...');
    
    const fixtures = await fetchTodaysFixtures();
    
    if (fixtures.length === 0) {
      return {
        success: true,
        count: 0,
        data: [],
      };
    }
    
    // Prepare fixtures (same as predictions)
    const currentYear = new Date().getFullYear();
    const fixturesWithFeatures = [];
    
    for (const fixture of fixtures) {
      const homeStats = await fetchTeamStats(fixture.teams.home.id, fixture.league.id, currentYear);
      const awayStats = await fetchTeamStats(fixture.teams.away.id, fixture.league.id, currentYear);
      const features = prepareFeatures(fixture, homeStats, awayStats);
      const odds = await fetchOdds(fixture.fixture.id);
      
      fixturesWithFeatures.push({
        fixture_id: fixture.fixture.id,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        league_id: fixture.league.id,
        league_name: fixture.league.name,
        date: fixture.fixture.date,
        features: features,
        odds: odds,
      });
    }
    
    // Call ML API value bets endpoint
    const response = await mlClient.post('/value-bets', {
      fixtures: fixturesWithFeatures,
      min_edge: minEdge,
    });
    
    if (response.data.success) {
      console.log(`✅ ML API returned ${response.data.count} value bets`);
      return response.data;
    }
    
    throw new Error('ML API returned unsuccessful response');
  } catch (error: any) {
    console.error('❌ Error in value bets pipeline:', error.message);
    throw error;
  }
}
