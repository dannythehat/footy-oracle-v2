/**
 * Test script for fixture data service
 * 
 * Usage:
 * 1. Set your API key: export API_FOOTBALL_KEY="your-key-here"
 * 2. Run: npx ts-node test-fixture-data.ts
 */

import {
  fetchFixtureById,
  fetchFixtureStatistics,
  fetchFixtureEvents,
  fetchH2H,
  fetchStandings,
  fetchTeamUpcoming,
  fetchLiveFixtures,
  getCompleteFixtureData
} from './src/services/fixtureDataService.js';

// Test fixture IDs (use real ones from your database)
const TEST_FIXTURE_ID = 1035098; // Example: Premier League match
const TEST_HOME_TEAM_ID = 33;    // Example: Manchester United
const TEST_AWAY_TEAM_ID = 34;    // Example: Newcastle
const TEST_LEAGUE_ID = 39;       // Example: Premier League
const TEST_SEASON = 2024;

async function testAllEndpoints() {
  console.log('🧪 Testing API-Sports Endpoints\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Fetch Fixture by ID
    console.log('\n1️⃣ Testing fetchFixtureById...');
    const fixture = await fetchFixtureById(TEST_FIXTURE_ID);
    console.log('✅ Fixture:', fixture ? 'SUCCESS' : 'NO DATA');
    if (fixture) {
      console.log(`   ${fixture.teams.home.name} vs ${fixture.teams.away.name}`);
    }

    // Test 2: Fetch Statistics
    console.log('\n2️⃣ Testing fetchFixtureStatistics...');
    const stats = await fetchFixtureStatistics(TEST_FIXTURE_ID);
    console.log('✅ Statistics:', stats ? 'SUCCESS' : 'NO DATA');
    if (stats) {
      console.log(`   Home shots: ${stats.home.totalShots}, Away shots: ${stats.away.totalShots}`);
      console.log(`   Home possession: ${stats.home.possession}, Away possession: ${stats.away.possession}`);
    }

    // Test 3: Fetch Events
    console.log('\n3️⃣ Testing fetchFixtureEvents...');
    const events = await fetchFixtureEvents(TEST_FIXTURE_ID);
    console.log('✅ Events:', events.length > 0 ? `SUCCESS (${events.length} events)` : 'NO DATA');
    if (events.length > 0) {
      const goals = events.filter((e: any) => e.type === 'Goal');
      const cards = events.filter((e: any) => e.type === 'Card');
      console.log(`   Goals: ${goals.length}, Cards: ${cards.length}`);
    }

    // Test 4: Fetch H2H
    console.log('\n4️⃣ Testing fetchH2H...');
    const h2h = await fetchH2H(TEST_HOME_TEAM_ID, TEST_AWAY_TEAM_ID);
    console.log('✅ H2H:', h2h.matches.length > 0 ? `SUCCESS (${h2h.matches.length} matches)` : 'NO DATA');
    if (h2h.stats.totalMatches > 0) {
      console.log(`   Total: ${h2h.stats.totalMatches}, Home wins: ${h2h.stats.homeWins}, Away wins: ${h2h.stats.awayWins}, Draws: ${h2h.stats.draws}`);
      console.log(`   BTTS: ${h2h.stats.bttsCount}, Over 2.5: ${h2h.stats.over25Count}`);
    }

    // Test 5: Fetch Standings
    console.log('\n5️⃣ Testing fetchStandings...');
    const standings = await fetchStandings(TEST_LEAGUE_ID, TEST_SEASON);
    console.log('✅ Standings:', standings ? 'SUCCESS' : 'NO DATA');
    if (standings && standings.league && standings.league.standings) {
      const table = standings.league.standings[0];
      console.log(`   ${standings.league.name} - ${table.length} teams`);
      if (table.length > 0) {
        console.log(`   Leader: ${table[0].team.name} (${table[0].points} pts)`);
      }
    }

    // Test 6: Fetch Team Upcoming
    console.log('\n6️⃣ Testing fetchTeamUpcoming...');
    const upcoming = await fetchTeamUpcoming(TEST_HOME_TEAM_ID, 5);
    console.log('✅ Upcoming:', upcoming.length > 0 ? `SUCCESS (${upcoming.length} fixtures)` : 'NO DATA');
    if (upcoming.length > 0) {
      console.log(`   Next match: ${upcoming[0].homeTeam} vs ${upcoming[0].awayTeam}`);
    }

    // Test 7: Fetch Live Fixtures
    console.log('\n7️⃣ Testing fetchLiveFixtures...');
    const live = await fetchLiveFixtures();
    console.log('✅ Live Fixtures:', live.length > 0 ? `SUCCESS (${live.length} live matches)` : 'NO LIVE MATCHES');
    if (live.length > 0) {
      console.log(`   First live match: ${live[0].teams.home.name} vs ${live[0].teams.away.name}`);
    }

    // Test 8: Complete Fixture Data
    console.log('\n8️⃣ Testing getCompleteFixtureData...');
    const mockFixtureDoc = {
      fixtureId: TEST_FIXTURE_ID,
      homeTeamId: TEST_HOME_TEAM_ID,
      awayTeamId: TEST_AWAY_TEAM_ID,
      leagueId: TEST_LEAGUE_ID,
      season: TEST_SEASON
    };
    const completeData = await getCompleteFixtureData(mockFixtureDoc);
    console.log('✅ Complete Data:');
    console.log(`   Fixture: ${completeData.fixture ? '✓' : '✗'}`);
    console.log(`   Statistics: ${completeData.statistics ? '✓' : '✗'}`);
    console.log(`   Events: ${completeData.events.length > 0 ? '✓' : '✗'}`);
    console.log(`   H2H: ${completeData.h2h.matches.length > 0 ? '✓' : '✗'}`);
    console.log(`   Standings: ${completeData.standings ? '✓' : '✗'}`);
    console.log(`   Home Upcoming: ${completeData.homeUpcoming.length > 0 ? '✓' : '✗'}`);
    console.log(`   Away Upcoming: ${completeData.awayUpcoming.length > 0 ? '✓' : '✗'}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS COMPLETED!\n');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run tests
console.log('🚀 Starting API-Sports endpoint tests...\n');
console.log('⚠️  Make sure API_FOOTBALL_KEY is set in your environment!\n');

testAllEndpoints().then(() => {
  console.log('✅ Test suite finished');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
