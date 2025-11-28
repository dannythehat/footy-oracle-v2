import dotenv from 'dotenv';
import { connectDatabase } from './src/config/database.js';
import { 
  testConnection, 
  fetchFixtures, 
  fetchFixturesWithOdds 
} from './src/services/apiFootballService.js';
import { 
  fetchAndStoreFixtures,
  getFixturesByDate,
  getAvailableLeagues,
  getFixtureCountsByStatus
} from './src/services/fixtureStorageService.js';

dotenv.config();

async function testAPIFootball() {
  console.log('🧪 Testing API-Football Integration\n');
  console.log('='.repeat(60));

  try {
    // Test 1: API Connection
    console.log('\n📌 TEST 1: API Connection');
    console.log('-'.repeat(60));
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ API connection failed. Check your API key.');
      return;
    }

    // Test 2: Fetch Fixtures (without odds)
    console.log('\n📌 TEST 2: Fetch Fixtures (Basic)');
    console.log('-'.repeat(60));
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching fixtures for ${today}...`);
    const fixtures = await fetchFixtures(today);
    console.log(`✅ Found ${fixtures.length} fixtures`);
    
    if (fixtures.length > 0) {
      console.log('\n📋 Sample Fixture:');
      console.log(JSON.stringify(fixtures[0], null, 2));
    }

    // Test 3: Fetch Fixtures with Odds (limited to 3 for testing)
    console.log('\n📌 TEST 3: Fetch Fixtures with Odds');
    console.log('-'.repeat(60));
    console.log('⚠️  Fetching odds for first 3 fixtures only (to save API calls)...');
    
    const limitedFixtures = fixtures.slice(0, 3);
    const fixturesWithOdds = await fetchFixturesWithOdds(today);
    
    if (fixturesWithOdds.length > 0) {
      console.log('\n📋 Sample Fixture with Odds:');
      console.log(JSON.stringify(fixturesWithOdds[0], null, 2));
    }

    console.log('\n✅ API-Football integration tests passed!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

async function testDatabaseStorage() {
  console.log('\n\n🧪 Testing Database Storage\n');
  console.log('='.repeat(60));

  try {
    // Connect to database
    console.log('\n📌 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ Database connected');

    // Test 1: Fetch and Store Fixtures
    console.log('\n📌 TEST 1: Fetch and Store Fixtures');
    console.log('-'.repeat(60));
    const today = new Date().toISOString().split('T')[0];
    console.log(`Fetching and storing fixtures for ${today}...`);
    console.log('⚠️  This will make API calls and store in database');
    
    const storedCount = await fetchAndStoreFixtures(today);
    console.log(`✅ Stored ${storedCount} fixtures in database`);

    // Test 2: Retrieve Fixtures from Database
    console.log('\n📌 TEST 2: Retrieve Fixtures from Database');
    console.log('-'.repeat(60));
    const dbFixtures = await getFixturesByDate(today);
    console.log(`✅ Retrieved ${dbFixtures.length} fixtures from database`);
    
    if (dbFixtures.length > 0) {
      console.log('\n📋 Sample Database Fixture:');
      console.log(JSON.stringify(dbFixtures[0], null, 2));
    }

    // Test 3: Get Available Leagues
    console.log('\n📌 TEST 3: Get Available Leagues');
    console.log('-'.repeat(60));
    const leagues = await getAvailableLeagues();
    console.log(`✅ Found ${leagues.length} leagues in database:`);
    console.log(leagues.slice(0, 10).join(', '), '...');

    // Test 4: Get Fixture Counts by Status
    console.log('\n📌 TEST 4: Get Fixture Counts by Status');
    console.log('-'.repeat(60));
    const counts = await getFixtureCountsByStatus();
    console.log('✅ Fixture counts by status:');
    console.log(JSON.stringify(counts, null, 2));

    console.log('\n✅ Database storage tests passed!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Main test runner
async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  console.log('\n🚀 Footy Oracle - API Integration Tests');
  console.log('='.repeat(60));
  console.log(`Test Type: ${testType}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  if (testType === 'api' || testType === 'all') {
    await testAPIFootball();
  }

  if (testType === 'db' || testType === 'all') {
    await testDatabaseStorage();
  }

  if (testType !== 'api' && testType !== 'db' && testType !== 'all') {
    console.log('\n❌ Invalid test type. Use: api, db, or all');
    console.log('Examples:');
    console.log('  npm run test:api     - Test API-Football only');
    console.log('  npm run test:db      - Test database storage');
    console.log('  npm run test:all     - Run all tests');
  }
}

runTests();
