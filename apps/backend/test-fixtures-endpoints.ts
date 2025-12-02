import 'dotenv/config';
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const FIXTURES_URL = `${BASE_URL}/fixtures`;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(colors.green, `✅ ${message}`);
}

function logError(message: string) {
  log(colors.red, `❌ ${message}`);
}

function logInfo(message: string) {
  log(colors.cyan, `ℹ️  ${message}`);
}

function logWarning(message: string) {
  log(colors.yellow, `⚠️  ${message}`);
}

function logSection(message: string) {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, `📌 ${message}`);
  console.log('='.repeat(60));
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const testResults: TestResult[] = [];

async function testEndpoint(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({ name, passed: true, duration });
    logSuccess(`${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    testResults.push({ 
      name, 
      passed: false, 
      error: error.message,
      duration 
    });
    logError(`${name} - ${error.message} (${duration}ms)`);
  }
}

// Test 1: GET /fixtures (List all fixtures)
async function testGetFixtures() {
  const response = await axios.get(FIXTURES_URL);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Response data should be an array');
  }
  
  logInfo(`Found ${response.data.count} fixtures`);
}

// Test 2: GET /fixtures?date=YYYY-MM-DD (Filter by date)
async function testGetFixturesByDate() {
  const today = new Date().toISOString().split('T')[0];
  const response = await axios.get(`${FIXTURES_URL}?date=${today}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`Found ${response.data.count} fixtures for ${today}`);
}

// Test 3: GET /fixtures/meta/leagues (Get distinct leagues)
async function testGetLeagues() {
  const response = await axios.get(`${FIXTURES_URL}/meta/leagues`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Response data should be an array');
  }
  
  logInfo(`Found ${response.data.count} leagues`);
}

// Test 4: GET /fixtures/:id (Get fixture by ID)
async function testGetFixtureById() {
  // First get a fixture ID
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixtureId = listResponse.data.data[0].fixtureId;
  const response = await axios.get(`${FIXTURES_URL}/${fixtureId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!response.data.data) {
    throw new Error('Response should contain fixture data');
  }
  
  const fixture = response.data.data;
  
  // Validate fixture structure
  const requiredFields = [
    'fixtureId', 'homeTeam', 'awayTeam', 'league', 
    'date', 'time', 'status'
  ];
  
  for (const field of requiredFields) {
    if (!(field in fixture)) {
      throw new Error(`Fixture missing required field: ${field}`);
    }
  }
  
  logInfo(`Fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
}

// Test 5: GET /fixtures/:id/odds (NEW ENDPOINT - Get fixture odds)
async function testGetFixtureOdds() {
  // First get a fixture ID
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixtureId = listResponse.data.data[0].fixtureId;
  const response = await axios.get(`${FIXTURES_URL}/${fixtureId}/odds`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!response.data.data) {
    throw new Error('Response should contain odds data');
  }
  
  const oddsData = response.data.data;
  
  if (!oddsData.fixtureId) {
    throw new Error('Odds data should contain fixtureId');
  }
  
  if (oddsData.odds) {
    logInfo(`Odds available for fixture ${fixtureId}`);
  } else {
    logWarning(`No odds data for fixture ${fixtureId}`);
  }
}

// Test 6: GET /fixtures/:id/h2h (Head to head)
async function testGetH2H() {
  // First get a fixture with team IDs
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixture = listResponse.data.data[0];
  
  if (!fixture.homeTeamId || !fixture.awayTeamId) {
    throw new Error('Fixture missing team IDs');
  }
  
  const response = await axios.get(
    `${FIXTURES_URL}/${fixture.fixtureId}/h2h?homeTeamId=${fixture.homeTeamId}&awayTeamId=${fixture.awayTeamId}`
  );
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`H2H data retrieved for ${fixture.homeTeam} vs ${fixture.awayTeam}`);
}

// Test 7: GET /fixtures/:id/stats (Fixture stats)
async function testGetFixtureStats() {
  // First get a fixture with required data
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixture = listResponse.data.data[0];
  
  if (!fixture.homeTeamId || !fixture.awayTeamId || !fixture.leagueId || !fixture.season) {
    throw new Error('Fixture missing required fields for stats');
  }
  
  const response = await axios.get(
    `${FIXTURES_URL}/${fixture.fixtureId}/stats?homeTeamId=${fixture.homeTeamId}&awayTeamId=${fixture.awayTeamId}&leagueId=${fixture.leagueId}&season=${fixture.season}`
  );
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`Stats retrieved for fixture ${fixture.fixtureId}`);
}

// Test 8: GET /fixtures/team/:teamId/stats (Team stats)
async function testGetTeamStats() {
  // First get a fixture with team data
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixture = listResponse.data.data[0];
  
  if (!fixture.homeTeamId || !fixture.leagueId || !fixture.season) {
    throw new Error('Fixture missing required fields for team stats');
  }
  
  const response = await axios.get(
    `${FIXTURES_URL}/team/${fixture.homeTeamId}/stats?leagueId=${fixture.leagueId}&season=${fixture.season}`
  );
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`Team stats retrieved for team ${fixture.homeTeamId}`);
}

// Test 9: GET /fixtures/team/:teamId/last (Team last fixtures)
async function testGetTeamLastFixtures() {
  // First get a fixture with team data
  const listResponse = await axios.get(FIXTURES_URL);
  
  if (!listResponse.data.data || listResponse.data.data.length === 0) {
    throw new Error('No fixtures available to test');
  }
  
  const fixture = listResponse.data.data[0];
  
  if (!fixture.homeTeamId) {
    throw new Error('Fixture missing homeTeamId');
  }
  
  const response = await axios.get(
    `${FIXTURES_URL}/team/${fixture.homeTeamId}/last?last=5`
  );
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`Last fixtures retrieved for team ${fixture.homeTeamId}`);
}

// Test 10: POST /fixtures/refresh-scores (Refresh scores)
async function testRefreshScores() {
  const today = new Date().toISOString().split('T')[0];
  
  const response = await axios.post(`${FIXTURES_URL}/refresh-scores`, {
    date: today
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  logInfo(`Refreshed ${response.data.updated} fixtures`);
}

// Test 11: POST /fixtures/analyze (Analyze single fixture)
async function testAnalyzeFixture() {
  const testFixture = {
    id: 'test-001',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    date: new Date().toISOString(),
  };
  
  const response = await axios.post(`${FIXTURES_URL}/analyze`, testFixture);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!response.data.data) {
    throw new Error('Response should contain analysis data');
  }
  
  logInfo(`Analysis completed for ${testFixture.homeTeam} vs ${testFixture.awayTeam}`);
}

// Test 12: POST /fixtures/analyze-bulk (Analyze multiple fixtures)
async function testAnalyzeBulkFixtures() {
  const testFixtures = [
    {
      id: 'test-001',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      date: new Date().toISOString(),
    },
    {
      id: 'test-002',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      date: new Date().toISOString(),
    }
  ];
  
  const response = await axios.post(`${FIXTURES_URL}/analyze-bulk`, {
    fixtures: testFixtures
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Response data should be an array');
  }
  
  logInfo(`Analyzed ${response.data.count} fixtures`);
}

// Test 13: POST /fixtures/golden-bets (Find golden bets)
async function testFindGoldenBets() {
  const testFixtures = [
    {
      id: 'test-001',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      date: new Date().toISOString(),
    }
  ];
  
  const response = await axios.post(`${FIXTURES_URL}/golden-bets`, {
    fixtures: testFixtures,
    minConfidence: 80
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Response data should be an array');
  }
  
  logInfo(`Found ${response.data.count} golden bets`);
}

// Test 14: POST /fixtures/value-bets (Find value bets)
async function testFindValueBets() {
  const testFixtures = [
    {
      id: 'test-001',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      date: new Date().toISOString(),
    }
  ];
  
  const response = await axios.post(`${FIXTURES_URL}/value-bets`, {
    fixtures: testFixtures,
    minValue: 5
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success should be true');
  }
  
  if (!Array.isArray(response.data.data)) {
    throw new Error('Response data should be an array');
  }
  
  logInfo(`Found ${response.data.count} value bets`);
}

// Test 15: Error handling - Invalid fixture ID
async function testInvalidFixtureId() {
  try {
    await axios.get(`${FIXTURES_URL}/999999999`);
    throw new Error('Should have returned 404 for invalid fixture ID');
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logInfo('Correctly returned 404 for invalid fixture ID');
    } else {
      throw error;
    }
  }
}

// Test 16: Error handling - Missing required parameters
async function testMissingParameters() {
  try {
    await axios.get(`${FIXTURES_URL}/1/h2h`);
    throw new Error('Should have returned 400 for missing parameters');
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      logInfo('Correctly returned 400 for missing parameters');
    } else {
      throw error;
    }
  }
}

async function runAllTests() {
  logSection('FIXTURES API ENDPOINT TESTS');
  
  console.log(`\n🔗 Testing API at: ${BASE_URL}`);
  console.log(`📅 Test Date: ${new Date().toISOString()}\n`);
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    logSuccess('Server is running');
  } catch (error) {
    logError('Server is not running! Please start the server first.');
    process.exit(1);
  }
  
  logSection('GET ENDPOINTS');
  await testEndpoint('GET /fixtures', testGetFixtures);
  await testEndpoint('GET /fixtures?date=YYYY-MM-DD', testGetFixturesByDate);
  await testEndpoint('GET /fixtures/meta/leagues', testGetLeagues);
  await testEndpoint('GET /fixtures/:id', testGetFixtureById);
  await testEndpoint('GET /fixtures/:id/odds (NEW)', testGetFixtureOdds);
  await testEndpoint('GET /fixtures/:id/h2h', testGetH2H);
  await testEndpoint('GET /fixtures/:id/stats', testGetFixtureStats);
  await testEndpoint('GET /fixtures/team/:teamId/stats', testGetTeamStats);
  await testEndpoint('GET /fixtures/team/:teamId/last', testGetTeamLastFixtures);
  
  logSection('POST ENDPOINTS');
  await testEndpoint('POST /fixtures/refresh-scores', testRefreshScores);
  await testEndpoint('POST /fixtures/analyze', testAnalyzeFixture);
  await testEndpoint('POST /fixtures/analyze-bulk', testAnalyzeBulkFixtures);
  await testEndpoint('POST /fixtures/golden-bets', testFindGoldenBets);
  await testEndpoint('POST /fixtures/value-bets', testFindValueBets);
  
  logSection('ERROR HANDLING');
  await testEndpoint('Invalid fixture ID (404)', testInvalidFixtureId);
  await testEndpoint('Missing parameters (400)', testMissingParameters);
  
  // Print summary
  logSection('TEST SUMMARY');
  
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed (${passRate}%)\n`);
  
  if (failed > 0) {
    logError(`Failed Tests (${failed}):`);
    testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ❌ ${r.name}`);
        console.log(`     ${colors.red}${r.error}${colors.reset}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    logSuccess('ALL TESTS PASSED! 🎉');
  } else {
    logError(`${failed} TEST(S) FAILED`);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  process.exit(1);
});
