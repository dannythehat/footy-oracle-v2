"use strict";
/**
 * Test script for fixture data service
 *
 * Usage:
 * 1. Set your API key: export API_FOOTBALL_KEY="your-key-here"
 * 2. Run: npx ts-node test-fixture-data.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fixtureDataService_js_1 = require("./src/services/fixtureDataService.js");
// Test fixture IDs (use real ones from your database)
var TEST_FIXTURE_ID = 1035098; // Example: Premier League match
var TEST_HOME_TEAM_ID = 33; // Example: Manchester United
var TEST_AWAY_TEAM_ID = 34; // Example: Newcastle
var TEST_LEAGUE_ID = 39; // Example: Premier League
var TEST_SEASON = 2024;
function testAllEndpoints() {
    return __awaiter(this, void 0, void 0, function () {
        var fixture, stats, events, goals, cards, h2h, standings, table, upcoming, live, mockFixtureDoc, completeData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing API-Sports Endpoints\n');
                    console.log('='.repeat(60));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    // Test 1: Fetch Fixture by ID
                    console.log('\n1️⃣ Testing fetchFixtureById...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureById)(TEST_FIXTURE_ID)];
                case 2:
                    fixture = _a.sent();
                    console.log('✅ Fixture:', fixture ? 'SUCCESS' : 'NO DATA');
                    if (fixture) {
                        console.log("   ".concat(fixture.teams.home.name, " vs ").concat(fixture.teams.away.name));
                    }
                    // Test 2: Fetch Statistics
                    console.log('\n2️⃣ Testing fetchFixtureStatistics...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureStatistics)(TEST_FIXTURE_ID)];
                case 3:
                    stats = _a.sent();
                    console.log('✅ Statistics:', stats ? 'SUCCESS' : 'NO DATA');
                    if (stats) {
                        console.log("   Home shots: ".concat(stats.home.totalShots, ", Away shots: ").concat(stats.away.totalShots));
                        console.log("   Home possession: ".concat(stats.home.possession, ", Away possession: ").concat(stats.away.possession));
                    }
                    // Test 3: Fetch Events
                    console.log('\n3️⃣ Testing fetchFixtureEvents...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureEvents)(TEST_FIXTURE_ID)];
                case 4:
                    events = _a.sent();
                    console.log('✅ Events:', events.length > 0 ? "SUCCESS (".concat(events.length, " events)") : 'NO DATA');
                    if (events.length > 0) {
                        goals = events.filter(function (e) { return e.type === 'Goal'; });
                        cards = events.filter(function (e) { return e.type === 'Card'; });
                        console.log("   Goals: ".concat(goals.length, ", Cards: ").concat(cards.length));
                    }
                    // Test 4: Fetch H2H
                    console.log('\n4️⃣ Testing fetchH2H...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchH2H)(TEST_HOME_TEAM_ID, TEST_AWAY_TEAM_ID)];
                case 5:
                    h2h = _a.sent();
                    console.log('✅ H2H:', h2h.matches.length > 0 ? "SUCCESS (".concat(h2h.matches.length, " matches)") : 'NO DATA');
                    if (h2h.stats.totalMatches > 0) {
                        console.log("   Total: ".concat(h2h.stats.totalMatches, ", Home wins: ").concat(h2h.stats.homeWins, ", Away wins: ").concat(h2h.stats.awayWins, ", Draws: ").concat(h2h.stats.draws));
                        console.log("   BTTS: ".concat(h2h.stats.bttsCount, ", Over 2.5: ").concat(h2h.stats.over25Count));
                    }
                    // Test 5: Fetch Standings
                    console.log('\n5️⃣ Testing fetchStandings...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchStandings)(TEST_LEAGUE_ID, TEST_SEASON)];
                case 6:
                    standings = _a.sent();
                    console.log('✅ Standings:', standings ? 'SUCCESS' : 'NO DATA');
                    if (standings && standings.league && standings.league.standings) {
                        table = standings.league.standings[0];
                        console.log("   ".concat(standings.league.name, " - ").concat(table.length, " teams"));
                        if (table.length > 0) {
                            console.log("   Leader: ".concat(table[0].team.name, " (").concat(table[0].points, " pts)"));
                        }
                    }
                    // Test 6: Fetch Team Upcoming
                    console.log('\n6️⃣ Testing fetchTeamUpcoming...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchTeamUpcoming)(TEST_HOME_TEAM_ID, 5)];
                case 7:
                    upcoming = _a.sent();
                    console.log('✅ Upcoming:', upcoming.length > 0 ? "SUCCESS (".concat(upcoming.length, " fixtures)") : 'NO DATA');
                    if (upcoming.length > 0) {
                        console.log("   Next match: ".concat(upcoming[0].homeTeam, " vs ").concat(upcoming[0].awayTeam));
                    }
                    // Test 7: Fetch Live Fixtures
                    console.log('\n7️⃣ Testing fetchLiveFixtures...');
                    return [4 /*yield*/, (0, fixtureDataService_js_1.fetchLiveFixtures)()];
                case 8:
                    live = _a.sent();
                    console.log('✅ Live Fixtures:', live.length > 0 ? "SUCCESS (".concat(live.length, " live matches)") : 'NO LIVE MATCHES');
                    if (live.length > 0) {
                        console.log("   First live match: ".concat(live[0].teams.home.name, " vs ").concat(live[0].teams.away.name));
                    }
                    // Test 8: Complete Fixture Data
                    console.log('\n8️⃣ Testing getCompleteFixtureData...');
                    mockFixtureDoc = {
                        fixtureId: TEST_FIXTURE_ID,
                        homeTeamId: TEST_HOME_TEAM_ID,
                        awayTeamId: TEST_AWAY_TEAM_ID,
                        leagueId: TEST_LEAGUE_ID,
                        season: TEST_SEASON
                    };
                    return [4 /*yield*/, (0, fixtureDataService_js_1.getCompleteFixtureData)(mockFixtureDoc)];
                case 9:
                    completeData = _a.sent();
                    console.log('✅ Complete Data:');
                    console.log("   Fixture: ".concat(completeData.fixture ? '✓' : '✗'));
                    console.log("   Statistics: ".concat(completeData.statistics ? '✓' : '✗'));
                    console.log("   Events: ".concat(completeData.events.length > 0 ? '✓' : '✗'));
                    console.log("   H2H: ".concat(completeData.h2h.matches.length > 0 ? '✓' : '✗'));
                    console.log("   Standings: ".concat(completeData.standings ? '✓' : '✗'));
                    console.log("   Home Upcoming: ".concat(completeData.homeUpcoming.length > 0 ? '✓' : '✗'));
                    console.log("   Away Upcoming: ".concat(completeData.awayUpcoming.length > 0 ? '✓' : '✗'));
                    console.log('\n' + '='.repeat(60));
                    console.log('🎉 ALL TESTS COMPLETED!\n');
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.error('\n❌ TEST FAILED:', error_1.message);
                    console.error('Stack:', error_1.stack);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Run tests
console.log('🚀 Starting API-Sports endpoint tests...\n');
console.log('⚠️  Make sure API_FOOTBALL_KEY is set in your environment!\n');
testAllEndpoints().then(function () {
    console.log('✅ Test suite finished');
    process.exit(0);
}).catch(function (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
