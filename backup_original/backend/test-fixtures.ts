import 'dotenv/config';
import { analyzeFixture, analyzeBulkFixtures, findGoldenBets, findValueBets } from '../src/services/fixturesService';

// Test fixture data
const testFixture = {
  id: 'test-001',
  homeTeam: 'Manchester City',
  awayTeam: 'Arsenal',
  league: 'Premier League',
  date: '2025-11-24T15:00:00Z',
  venue: 'Etihad Stadium',
  homeForm: ['W', 'W', 'W', 'D', 'W'],
  awayForm: ['W', 'D', 'W', 'W', 'L']
};

const testFixtures = [
  testFixture,
  {
    id: 'test-002',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    league: 'Premier League',
    date: '2025-11-24T17:30:00Z',
    venue: 'Anfield',
    homeForm: ['W', 'W', 'W', 'W', 'D'],
    awayForm: ['L', 'D', 'W', 'L', 'D']
  },
  {
    id: 'test-003',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    league: 'La Liga',
    date: '2025-11-24T20:00:00Z',
    venue: 'Santiago Bernabéu',
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['W', 'W', 'W', 'W', 'W']
  }
];

async function testSingleAnalysis() {
  console.log('\n🔍 Testing Single Fixture Analysis...\n');
  
  try {
    const result = await analyzeFixture(testFixture);
    console.log('✅ Single Analysis Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Single Analysis Failed:', error.message);
  }
}

async function testBulkAnalysis() {
  console.log('\n🔍 Testing Bulk Fixture Analysis...\n');
  
  try {
    const results = await analyzeBulkFixtures(testFixtures);
    console.log(`✅ Bulk Analysis Success! Analyzed ${results.length} fixtures`);
    results.forEach((result, index) => {
      console.log(`\n--- Fixture ${index + 1}: ${result.homeTeam} vs ${result.awayTeam} ---`);
      console.log(`Winner: ${result.prediction.winner} (${result.prediction.confidence}% confidence)`);
      console.log(`Score: ${result.prediction.scorePrediction}`);
      console.log(`Markets: ${result.markets.length}`);
      if (result.goldenBet) {
        console.log(`🏆 Golden Bet: ${result.goldenBet.market} @ ${result.goldenBet.odds}`);
      }
    });
  } catch (error: any) {
    console.error('❌ Bulk Analysis Failed:', error.message);
  }
}

async function testGoldenBets() {
  console.log('\n🏆 Testing Golden Bets Detection...\n');
  
  try {
    const predictions = await analyzeBulkFixtures(testFixtures);
    const goldenBets = await findGoldenBets(predictions);
    console.log(`✅ Found ${goldenBets.length} Golden Bets!`);
    goldenBets.forEach((bet, index) => {
      console.log(`\n${index + 1}. ${bet.homeTeam} vs ${bet.awayTeam}`);
      console.log(`   Market: ${bet.goldenBet?.market}`);
      console.log(`   Odds: ${bet.goldenBet?.odds}`);
      console.log(`   Confidence: ${bet.goldenBet?.confidence}%`);
    });
  } catch (error: any) {
    console.error('❌ Golden Bets Detection Failed:', error.message);
  }
}

async function testValueBets() {
  console.log('\n💎 Testing Value Bets Detection...\n');
  
  try {
    const predictions = await analyzeBulkFixtures(testFixtures);
    const valueBets = await findValueBets(predictions);
    console.log(`✅ Found ${valueBets.length} Value Bets!`);
    valueBets.slice(0, 5).forEach((bet, index) => {
      console.log(`\n${index + 1}. ${bet.fixture}`);
      console.log(`   Market: ${bet.market}`);
      console.log(`   Prediction: ${bet.prediction}`);
      console.log(`   Odds: ${bet.odds}`);
      console.log(`   Edge: ${bet.edge}`);
    });
  } catch (error: any) {
    console.error('❌ Value Bets Detection Failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Fixtures Service Tests...');
  console.log('=====================================');
  
  // Check OpenAI API Key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables!');
    console.log('Please create a .env file with your OpenAI API key.');
    process.exit(1);
  }
  
  console.log('✅ OpenAI API Key found');
  console.log(`📝 Model: ${process.env.OPENAI_MODEL || 'gpt-4'}`);
  
  await testSingleAnalysis();
  await testBulkAnalysis();
  await testGoldenBets();
  await testValueBets();
  
  console.log('\n=====================================');
  console.log('✅ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
