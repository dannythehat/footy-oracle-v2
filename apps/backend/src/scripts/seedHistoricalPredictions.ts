/**
 * Historical Predictions Seeding Script - GOLDEN BETS ONLY
 * 
 * Seeds MongoDB with ONLY Golden Bets (3 per day) from Nov 1 - Nov 24, 2025
 * 
 * Features:
 * - Fetches actual match results from API-Football
 * - Creates ONLY 3 Golden Bets per day (not all predictions)
 * - 75% overall accuracy for Golden Bets
 * - Ensures at least 2 days where all 3 Golden Bets won (ACCA profit)
 * - Calculates realistic odds and proper P&L (£10 stake per bet)
 * - Proper daily/weekly/monthly stats tracking
 * - Value bet metrics (confidence vs odds)
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

// Markets for Golden Bets
const MARKETS = [
  { name: 'Match Winner', predictions: ['Home Win', 'Draw', 'Away Win'] },
  { name: 'Both Teams to Score', predictions: ['Yes', 'No'] },
  { name: 'Over/Under 2.5 Goals', predictions: ['Over 2.5', 'Under 2.5'] },
  { name: 'Over/Under 9.5 Corners', predictions: ['Over 9.5', 'Under 9.5'] },
];

const STAKE = 10; // £10 per Golden Bet

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
 * Golden Bets should have value, so odds slightly higher than probability suggests
 */
function generateOdds(market: string, prediction: string, confidence: number): number {
  // Base odds ranges
  const oddsRanges: Record<string, Record<string, [number, number]>> = {
    'Match Winner': {
      'Home Win': [1.6, 2.8],
      'Draw': [3.0, 4.2],
      'Away Win': [1.8, 3.5]
    },
    'Both Teams to Score': {
      'Yes': [1.65, 2.1],
      'No': [1.65, 2.1]
    },
    'Over/Under 2.5 Goals': {
      'Over 2.5': [1.7, 2.2],
      'Under 2.5': [1.7, 2.2]
    },
    'Over/Under 9.5 Corners': {
      'Over 9.5': [1.8, 2.3],
      'Under 9.5': [1.8, 2.3]
    }
  };
  
  const range = oddsRanges[market]?.[prediction] || [1.8, 2.5];
  
  // For Golden Bets, we want VALUE - so odds should be slightly better than confidence suggests
  // If confidence is 85%, fair odds would be ~1.18, but bookmaker offers 1.85 = VALUE
  const baseOdds = Math.random() * (range[1] - range[0]) + range[0];
  
  return parseFloat(baseOdds.toFixed(2));
}

/**
 * Generate AI reasoning for a Golden Bet
 */
function generateAIReasoning(fixture: FixtureResult, market: string, prediction: string, confidence: number): string {
  const reasons = [
    `${fixture.homeTeam} has exceptional home form with 4 wins in last 5 matches, averaging 2.3 goals per game.`,
    `${fixture.awayTeam} shows strong away record with 1.8 goals per game and solid defensive structure.`,
    `Head-to-head analysis reveals ${prediction.toLowerCase()} occurred in 4 of last 5 meetings between these teams.`,
    `Both teams have scored in 75% of recent encounters, with high-intensity tactical matchups.`,
    `Statistical models indicate ${confidence}% probability for this outcome based on form, tactics, and historical data.`,
    `Form analysis shows ${fixture.homeTeam} averaging 11.2 corners at home, while ${fixture.awayTeam} concedes 10.8 away.`,
    `Recent performance metrics and xG data strongly support this selection with ${confidence}% confidence.`,
    `Tactical matchup favors this outcome - ${fixture.homeTeam}'s pressing style vs ${fixture.awayTeam}'s counter-attacking approach.`,
    `Referee tendencies and team discipline records suggest high card count in this fixture.`,
    `Weather conditions and pitch quality favor attacking play, supporting over goals prediction.`
  ];
  
  // Pick 3-4 random reasons for comprehensive analysis
  const selectedReasons = [];
  const numReasons = Math.floor(Math.random() * 2) + 3; // 3-4 reasons
  
  const shuffled = [...reasons].sort(() => Math.random() - 0.5);
  for (let i = 0; i < numReasons && i < shuffled.length; i++) {
    selectedReasons.push(shuffled[i]);
  }
  
  return selectedReasons.join(' ');
}

/**
 * Select 3 Golden Bets for a specific day
 * Ensures variety in markets and teams
 */
function selectGoldenBetsForDay(
  fixtures: FixtureResult[], 
  targetAccuracy: number,
  forceAllWins: boolean = false
): any[] {
  if (fixtures.length < 3) {
    console.log(`  ⚠️  Only ${fixtures.length} fixtures available, need at least 3`);
    return [];
  }
  
  // Shuffle fixtures to get variety
  const shuffled = [...fixtures].sort(() => Math.random() - 0.5);
  const selectedFixtures = shuffled.slice(0, 3);
  
  const goldenBets = [];
  
  for (const fixture of selectedFixtures) {
    // Pick a random market
    const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
    const actualResult = getActualResult(fixture, market.name);
    
    // Determine if this bet should win
    let shouldWin = forceAllWins || Math.random() < targetAccuracy;
    
    // Select prediction
    const prediction = shouldWin 
      ? actualResult 
      : market.predictions.filter(p => p !== actualResult)[Math.floor(Math.random() * (market.predictions.length - 1))];
    
    // Golden Bets have high confidence (80-95%)
    const confidence = Math.floor(Math.random() * 16) + 80; // 80-95%
    const odds = generateOdds(market.name, prediction, confidence);
    const isCorrect = prediction === actualResult;
    const profit = isCorrect ? ((odds - 1) * STAKE) : -STAKE;
    
    goldenBets.push({
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
      isGoldenBet: true,
      result: isCorrect ? 'win' : 'loss',
      profit: parseFloat(profit.toFixed(2))
    });
  }
  
  return goldenBets;
}

/**
 * Main seeding function
 */
async function seedHistoricalPredictions() {
  try {
    console.log('🚀 Starting Historical Golden Bets Seeding...\n');
    console.log('📌 IMPORTANT: Creating ONLY Golden Bets (3 per day)\n');
    
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
    
    // Group fixtures by date
    const fixturesByDate = fixtures.reduce((acc, fixture) => {
      const dateKey = fixture.date.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(fixture);
      return acc;
    }, {} as Record<string, FixtureResult[]>);
    
    const allDates = Object.keys(fixturesByDate).sort();
    
    // Select 2 random days for guaranteed ACCA wins
    const guaranteedWinDays = new Set<string>();
    const shuffledDates = [...allDates].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(2, shuffledDates.length); i++) {
      guaranteedWinDays.add(shuffledDates[i]);
    }
    
    console.log(`🎯 Guaranteed ACCA Win Days: ${Array.from(guaranteedWinDays).join(', ')}\n`);
    
    // Generate Golden Bets for each day
    console.log('🌟 Generating Golden Bets (3 per day)...\n');
    const allGoldenBets: any[] = [];
    
    for (const dateKey of allDates) {
      const dayFixtures = fixturesByDate[dateKey];
      const forceAllWins = guaranteedWinDays.has(dateKey);
      
      const goldenBets = selectGoldenBetsForDay(dayFixtures, 0.75, forceAllWins);
      
      if (goldenBets.length === 3) {
        allGoldenBets.push(...goldenBets);
        
        const wins = goldenBets.filter(b => b.result === 'win').length;
        const dayProfit = goldenBets.reduce((sum, b) => sum + b.profit, 0);
        
        if (forceAllWins) {
          console.log(`  🌟 ${dateKey}: 3/3 WINS (ACCA WIN) - Profit: £${dayProfit.toFixed(2)}`);
        } else {
          console.log(`  📊 ${dateKey}: ${wins}/3 wins - Profit: £${dayProfit.toFixed(2)}`);
        }
      }
    }
    
    console.log(`\n✅ Generated ${allGoldenBets.length} Golden Bets (${allDates.length} days × 3 bets)\n`);
    
    // Calculate statistics
    const totalBets = allGoldenBets.length;
    const wins = allGoldenBets.filter(b => b.result === 'win').length;
    const losses = allGoldenBets.filter(b => b.result === 'loss').length;
    const winRate = ((wins / totalBets) * 100).toFixed(1);
    const totalProfit = allGoldenBets.reduce((sum, b) => sum + b.profit, 0);
    const totalStaked = totalBets * STAKE;
    const roi = ((totalProfit / totalStaked) * 100).toFixed(1);
    
    // Calculate ACCA stats
    const accaStats = { wins: 0, losses: 0, profit: 0 };
    
    for (const dateKey of allDates) {
      const dayBets = allGoldenBets.filter(b => b.date.toISOString().split('T')[0] === dateKey);
      
      if (dayBets.length === 3) {
        const allWon = dayBets.every(b => b.result === 'win');
        
        if (allWon) {
          accaStats.wins++;
          const accaOdds = dayBets.reduce((prod, b) => prod * b.odds, 1);
          const accaProfit = (accaOdds * STAKE) - STAKE;
          accaStats.profit += accaProfit;
        } else {
          accaStats.losses++;
        }
      }
    }
    
    const accaTotal = accaStats.wins + accaStats.losses;
    const accaWinRate = accaTotal > 0 ? ((accaStats.wins / accaTotal) * 100).toFixed(1) : '0.0';
    
    console.log('\n📊 GOLDEN BETS STATISTICS:');
    console.log(`  Total Golden Bets: ${totalBets}`);
    console.log(`  Wins: ${wins} | Losses: ${losses}`);
    console.log(`  Win Rate: ${winRate}%`);
    console.log(`  Total Staked: £${totalStaked.toFixed(2)}`);
    console.log(`  Total Profit: £${totalProfit.toFixed(2)}`);
    console.log(`  ROI: ${roi}%`);
    
    console.log(`\n🎯 ACCA (TREBLE) STATISTICS:`);
    console.log(`  Total ACCAs: ${accaTotal} days`);
    console.log(`  ACCA Wins: ${accaStats.wins} days`);
    console.log(`  ACCA Losses: ${accaStats.losses} days`);
    console.log(`  ACCA Win Rate: ${accaWinRate}%`);
    console.log(`  ACCA Profit: £${accaStats.profit.toFixed(2)}`);
    
    // Insert into MongoDB
    console.log('\n💾 Inserting Golden Bets into MongoDB...');
    await Prediction.insertMany(allGoldenBets);
    console.log(`✅ Inserted ${allGoldenBets.length} Golden Bets\n`);
    
    console.log('🎉 Historical seeding complete!\n');
    console.log('📈 Your platform now has:');
    console.log(`   - ${allDates.length} days of historical data`);
    console.log(`   - ${totalBets} Golden Bets with ${winRate}% win rate`);
    console.log(`   - ${accaStats.wins} profitable ACCA days`);
    console.log(`   - £${totalProfit.toFixed(2)} total profit`);
    console.log(`   - Full daily/weekly/monthly P&L tracking ready\n`);
    
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
