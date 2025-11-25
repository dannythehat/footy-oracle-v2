/**
 * Historical Predictions Seeding Script
 * 
 * Seeds MongoDB with realistic historical predictions from Nov 1 - Nov 24, 2025
 * 
 * Features:
 * - Fetches actual match results from API-Football
 * - Generates predictions with 70% overall accuracy
 * - Ensures at least 2 days where all 3 Golden Bets won (ACCA profit)
 * - Calculates realistic odds and value bets
 * - Proper P&L tracking
 * 
 * Usage:
 *   npx tsx src/scripts/seedHistoricalPredictions.ts
 */

import mongoose from 'mongoose';
import { Prediction } from '../models/Prediction.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  },
  timeout: 15000
});

// Top leagues to focus on
const TOP_LEAGUES = [
  39, 140, 78, 135, 61, // Premier League, La Liga, Bundesliga, Serie A, Ligue 1
  2, 3, 94, 88, 203, // Champions League, Europa League, Primeira Liga, Eredivisie, Super Lig
  144, 71, 179, 235, 253 // Belgian Pro League, Brazilian Serie A, Scottish Premiership, Russian Premier League, MLS
];

// Markets to predict
const MARKETS = [
  { name: 'Match Winner', predictions: ['Home Win', 'Draw', 'Away Win'] },
  { name: 'Both Teams to Score', predictions: ['Yes', 'No'] },
  { name: 'Over/Under 2.5 Goals', predictions: ['Over 2.5', 'Under 2.5'] },
  { name: 'Over/Under 9.5 Corners', predictions: ['Over 9.5', 'Under 9.5'] },
];

interface FixtureResult {
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeScore: number;
  awayScore: number;
  status: string;
}

/**
 * Fetch fixtures with results for a date range
 */
async function fetchFixturesWithResults(startDate: string, endDate: string): Promise<FixtureResult[]> {
  const fixtures: FixtureResult[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  console.log(`📥 Fetching fixtures from ${startDate} to ${endDate}...`);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      const response = await apiClient.get('/fixtures', {
        params: { 
          date: dateStr,
          status: 'FT' // Only finished matches
        }
      });

      if (response.data.response && response.data.response.length > 0) {
        const dayFixtures = response.data.response
          .filter((f: any) => TOP_LEAGUES.includes(f.league.id))
          .map((f: any) => ({
            fixtureId: f.fixture.id,
            date: f.fixture.date,
            homeTeam: f.teams.home.name,
            awayTeam: f.teams.away.name,
            league: f.league.name,
            homeScore: f.goals.home,
            awayScore: f.goals.away,
            status: f.fixture.status.short
          }));
        
        fixtures.push(...dayFixtures);
        console.log(`  ✅ ${dateStr}: Found ${dayFixtures.length} finished fixtures`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(`  ❌ Error fetching ${dateStr}:`, error.message);
    }
  }
  
  console.log(`\n✅ Total fixtures fetched: ${fixtures.length}\n`);
  return fixtures;
}

/**
 * Determine actual result for a market based on match outcome
 */
function getActualResult(fixture: FixtureResult, market: string): string {
  const { homeScore, awayScore } = fixture;
  const totalGoals = homeScore + awayScore;
  
  switch (market) {
    case 'Match Winner':
      if (homeScore > awayScore) return 'Home Win';
      if (homeScore < awayScore) return 'Away Win';
      return 'Draw';
    
    case 'Both Teams to Score':
      return (homeScore > 0 && awayScore > 0) ? 'Yes' : 'No';
    
    case 'Over/Under 2.5 Goals':
      return totalGoals > 2.5 ? 'Over 2.5' : 'Under 2.5';
    
    case 'Over/Under 9.5 Corners':
      // Simulate corners (avg 10-11 per match)
      const corners = Math.floor(Math.random() * 6) + 8; // 8-13 corners
      return corners > 9.5 ? 'Over 9.5' : 'Under 9.5';
    
    default:
      return 'Unknown';
  }
}

/**
 * Generate realistic odds for a prediction
 */
function generateOdds(market: string, prediction: string): number {
  const oddsRanges: Record<string, Record<string, [number, number]>> = {
    'Match Winner': {
      'Home Win': [1.5, 3.0],
      'Draw': [3.0, 4.5],
      'Away Win': [1.8, 4.0]
    },
    'Both Teams to Score': {
      'Yes': [1.6, 2.2],
      'No': [1.6, 2.2]
    },
    'Over/Under 2.5 Goals': {
      'Over 2.5': [1.7, 2.3],
      'Under 2.5': [1.7, 2.3]
    },
    'Over/Under 9.5 Corners': {
      'Over 9.5': [1.8, 2.4],
      'Under 9.5': [1.8, 2.4]
    }
  };
  
  const range = oddsRanges[market]?.[prediction] || [1.8, 2.5];
  return parseFloat((Math.random() * (range[1] - range[0]) + range[0]).toFixed(2));
}

/**
 * Generate AI reasoning for a prediction
 */
function generateAIReasoning(fixture: FixtureResult, market: string, prediction: string, confidence: number): string {
  const reasons = [
    `${fixture.homeTeam} has strong home form with 4 wins in last 5 matches.`,
    `${fixture.awayTeam} averages 1.8 goals per game in away fixtures.`,
    `Head-to-head record shows ${prediction.toLowerCase()} in 3 of last 5 meetings.`,
    `Both teams have scored in 70% of recent encounters.`,
    `Statistical models indicate ${confidence}% probability for this outcome.`,
    `Form analysis and tactical matchup favor this prediction.`,
    `Recent performance metrics strongly support this selection.`
  ];
  
  // Pick 2-3 random reasons
  const selectedReasons = [];
  const numReasons = Math.floor(Math.random() * 2) + 2; // 2-3 reasons
  
  for (let i = 0; i < numReasons; i++) {
    const randomIndex = Math.floor(Math.random() * reasons.length);
    selectedReasons.push(reasons[randomIndex]);
  }
  
  return selectedReasons.join(' ');
}

/**
 * Generate predictions for a fixture with controlled accuracy
 */
function generatePredictions(
  fixture: FixtureResult, 
  targetAccuracy: number = 0.70,
  forceCorrect: boolean = false
): any[] {
  const predictions = [];
  
  for (const market of MARKETS) {
    const actualResult = getActualResult(fixture, market.name);
    
    // Determine if this prediction should be correct
    let shouldBeCorrect = forceCorrect || Math.random() < targetAccuracy;
    
    // Select prediction
    const prediction = shouldBeCorrect 
      ? actualResult 
      : market.predictions.filter(p => p !== actualResult)[Math.floor(Math.random() * (market.predictions.length - 1))];
    
    const confidence = Math.floor(Math.random() * 20) + 70; // 70-90%
    const odds = generateOdds(market.name, prediction);
    const isCorrect = prediction === actualResult;
    const profit = isCorrect ? (odds - 1) : -1; // £1 stake
    
    predictions.push({
      fixtureId: fixture.fixtureId,
      date: new Date(fixture.date),
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      league: fixture.league,
      market: market.name,
      prediction,
      odds,
      confidence,
      aiReasoning: generateAIReasoning(fixture, market.name, prediction, confidence),
      isGoldenBet: false, // Will be set later for top 3 daily
      result: isCorrect ? 'win' : 'loss',
      profit
    });
  }
  
  return predictions;
}

/**
 * Select Golden Bets for each day (top 3 by confidence)
 */
function selectGoldenBets(predictions: any[], guaranteedWinDays: Set<string>): any[] {
  // Group by date
  const byDate = predictions.reduce((acc, pred) => {
    const dateKey = pred.date.toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(pred);
    return acc;
  }, {} as Record<string, any[]>);
  
  const goldenBets: any[] = [];
  
  for (const [dateKey, dayPredictions] of Object.entries(byDate)) {
    const shouldAllWin = guaranteedWinDays.has(dateKey);
    
    // Sort by confidence
    const sorted = dayPredictions.sort((a, b) => b.confidence - a.confidence);
    
    // Select top 3
    const top3 = sorted.slice(0, 3);
    
    // If this is a guaranteed win day, ensure all 3 are winners
    if (shouldAllWin) {
      top3.forEach(bet => {
        bet.result = 'win';
        bet.profit = bet.odds - 1;
        bet.confidence = Math.floor(Math.random() * 15) + 80; // 80-95% for golden bets
      });
      console.log(`  🌟 ${dateKey}: All 3 Golden Bets WIN (ACCA Day)`);
    } else {
      // Normal day - boost confidence for golden bets
      top3.forEach(bet => {
        bet.confidence = Math.floor(Math.random() * 15) + 80; // 80-95%
      });
    }
    
    top3.forEach(bet => {
      bet.isGoldenBet = true;
      goldenBets.push(bet);
    });
  }
  
  return goldenBets;
}

/**
 * Main seeding function
 */
async function seedHistoricalPredictions() {
  try {
    console.log('🚀 Starting Historical Predictions Seeding...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/footy-oracle';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing predictions
    const deleteResult = await Prediction.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing predictions\n`);
    
    // Fetch fixtures with results
    const startDate = '2025-11-01';
    const endDate = '2025-11-24';
    const fixtures = await fetchFixturesWithResults(startDate, endDate);
    
    if (fixtures.length === 0) {
      console.log('❌ No fixtures found. Exiting...');
      return;
    }
    
    // Select 2 random days for guaranteed ACCA wins
    const allDates = [...new Set(fixtures.map(f => f.date.split('T')[0]))];
    const guaranteedWinDays = new Set<string>();
    
    // Pick 2 random days
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * allDates.length);
      guaranteedWinDays.add(allDates[randomIndex]);
    }
    
    console.log(`🎯 Guaranteed ACCA Win Days: ${Array.from(guaranteedWinDays).join(', ')}\n`);
    
    // Generate predictions for all fixtures
    console.log('🤖 Generating predictions...\n');
    const allPredictions: any[] = [];
    
    for (const fixture of fixtures) {
      const dateKey = fixture.date.split('T')[0];
      const forceCorrect = guaranteedWinDays.has(dateKey);
      
      const predictions = generatePredictions(fixture, 0.70, forceCorrect);
      allPredictions.push(...predictions);
    }
    
    console.log(`✅ Generated ${allPredictions.length} predictions\n`);
    
    // Select Golden Bets (top 3 per day)
    console.log('🌟 Selecting Golden Bets...\n');
    selectGoldenBets(allPredictions, guaranteedWinDays);
    
    // Calculate statistics
    const goldenBets = allPredictions.filter(p => p.isGoldenBet);
    const goldenWins = goldenBets.filter(p => p.result === 'win').length;
    const goldenWinRate = ((goldenWins / goldenBets.length) * 100).toFixed(1);
    const goldenProfit = goldenBets.reduce((sum, p) => sum + p.profit, 0).toFixed(2);
    
    const allWins = allPredictions.filter(p => p.result === 'win').length;
    const overallWinRate = ((allWins / allPredictions.length) * 100).toFixed(1);
    const totalProfit = allPredictions.reduce((sum, p) => sum + p.profit, 0).toFixed(2);
    
    console.log('\n📊 Statistics:');
    console.log(`  Total Predictions: ${allPredictions.length}`);
    console.log(`  Overall Win Rate: ${overallWinRate}%`);
    console.log(`  Total Profit: £${totalProfit}`);
    console.log(`\n  Golden Bets: ${goldenBets.length}`);
    console.log(`  Golden Win Rate: ${goldenWinRate}%`);
    console.log(`  Golden Profit: £${goldenProfit}`);
    
    // Calculate ACCA stats
    const byDate = goldenBets.reduce((acc, pred) => {
      const dateKey = pred.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(pred);
      return acc;
    }, {} as Record<string, any[]>);
    
    let accaWins = 0;
    let accaProfit = 0;
    
    for (const [dateKey, dayBets] of Object.entries(byDate)) {
      if (dayBets.length === 3 && dayBets.every(b => b.result === 'win')) {
        accaWins++;
        const accaOdds = dayBets.reduce((prod, b) => prod * b.odds, 1);
        accaProfit += (accaOdds - 1); // £1 stake
      }
    }
    
    console.log(`\n  ACCA Wins: ${accaWins} days`);
    console.log(`  ACCA Profit: £${accaProfit.toFixed(2)}`);
    
    // Insert into MongoDB
    console.log('\n💾 Inserting predictions into MongoDB...');
    await Prediction.insertMany(allPredictions);
    console.log(`✅ Inserted ${allPredictions.length} predictions\n`);
    
    console.log('🎉 Historical seeding complete!\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
seedHistoricalPredictions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
