"use strict";
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
var dotenv_1 = require("dotenv");
var database_js_1 = require("./src/config/database.js");
var apiFootballService_js_1 = require("./src/services/apiFootballService.js");
var fixtureStorageService_js_1 = require("./src/services/fixtureStorageService.js");
dotenv_1.default.config();
function testAPIFootball() {
    return __awaiter(this, void 0, void 0, function () {
        var isConnected, today, fixtures, limitedFixtures, fixturesWithOdds, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing API-Football Integration\n');
                    console.log('='.repeat(60));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    // Test 1: API Connection
                    console.log('\n📌 TEST 1: API Connection');
                    console.log('-'.repeat(60));
                    return [4 /*yield*/, (0, apiFootballService_js_1.testConnection)()];
                case 2:
                    isConnected = _a.sent();
                    if (!isConnected) {
                        console.error('❌ API connection failed. Check your API key.');
                        return [2 /*return*/];
                    }
                    // Test 2: Fetch Fixtures (without odds)
                    console.log('\n📌 TEST 2: Fetch Fixtures (Basic)');
                    console.log('-'.repeat(60));
                    today = new Date().toISOString().split('T')[0];
                    console.log("Fetching fixtures for ".concat(today, "..."));
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchFixtures)(today)];
                case 3:
                    fixtures = _a.sent();
                    console.log("\u2705 Found ".concat(fixtures.length, " fixtures"));
                    if (fixtures.length > 0) {
                        console.log('\n📋 Sample Fixture:');
                        console.log(JSON.stringify(fixtures[0], null, 2));
                    }
                    // Test 3: Fetch Fixtures with Odds (limited to 3 for testing)
                    console.log('\n📌 TEST 3: Fetch Fixtures with Odds');
                    console.log('-'.repeat(60));
                    console.log('⚠️  Fetching odds for first 3 fixtures only (to save API calls)...');
                    limitedFixtures = fixtures.slice(0, 3);
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchFixturesWithOdds)(today)];
                case 4:
                    fixturesWithOdds = _a.sent();
                    if (fixturesWithOdds.length > 0) {
                        console.log('\n📋 Sample Fixture with Odds:');
                        console.log(JSON.stringify(fixturesWithOdds[0], null, 2));
                    }
                    console.log('\n✅ API-Football integration tests passed!');
                    console.log('='.repeat(60));
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('\n❌ Test failed:', error_1.message);
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function testDatabaseStorage() {
    return __awaiter(this, void 0, void 0, function () {
        var today, storedCount, dbFixtures, leagues, counts, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n\n🧪 Testing Database Storage\n');
                    console.log('='.repeat(60));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    // Connect to database
                    console.log('\n📌 Connecting to MongoDB...');
                    return [4 /*yield*/, (0, database_js_1.connectDatabase)()];
                case 2:
                    _a.sent();
                    console.log('✅ Database connected');
                    // Test 1: Fetch and Store Fixtures
                    console.log('\n📌 TEST 1: Fetch and Store Fixtures');
                    console.log('-'.repeat(60));
                    today = new Date().toISOString().split('T')[0];
                    console.log("Fetching and storing fixtures for ".concat(today, "..."));
                    console.log('⚠️  This will make API calls and store in database');
                    return [4 /*yield*/, (0, fixtureStorageService_js_1.fetchAndStoreFixtures)(today)];
                case 3:
                    storedCount = _a.sent();
                    console.log("\u2705 Stored ".concat(storedCount, " fixtures in database"));
                    // Test 2: Retrieve Fixtures from Database
                    console.log('\n📌 TEST 2: Retrieve Fixtures from Database');
                    console.log('-'.repeat(60));
                    return [4 /*yield*/, (0, fixtureStorageService_js_1.getFixturesByDate)(today)];
                case 4:
                    dbFixtures = _a.sent();
                    console.log("\u2705 Retrieved ".concat(dbFixtures.length, " fixtures from database"));
                    if (dbFixtures.length > 0) {
                        console.log('\n📋 Sample Database Fixture:');
                        console.log(JSON.stringify(dbFixtures[0], null, 2));
                    }
                    // Test 3: Get Available Leagues
                    console.log('\n📌 TEST 3: Get Available Leagues');
                    console.log('-'.repeat(60));
                    return [4 /*yield*/, (0, fixtureStorageService_js_1.getAvailableLeagues)()];
                case 5:
                    leagues = _a.sent();
                    console.log("\u2705 Found ".concat(leagues.length, " leagues in database:"));
                    console.log(leagues.slice(0, 10).join(', '), '...');
                    // Test 4: Get Fixture Counts by Status
                    console.log('\n📌 TEST 4: Get Fixture Counts by Status');
                    console.log('-'.repeat(60));
                    return [4 /*yield*/, (0, fixtureStorageService_js_1.getFixtureCountsByStatus)()];
                case 6:
                    counts = _a.sent();
                    console.log('✅ Fixture counts by status:');
                    console.log(JSON.stringify(counts, null, 2));
                    console.log('\n✅ Database storage tests passed!');
                    console.log('='.repeat(60));
                    return [3 /*break*/, 9];
                case 7:
                    error_2 = _a.sent();
                    console.error('\n❌ Test failed:', error_2.message);
                    console.error(error_2);
                    return [3 /*break*/, 9];
                case 8:
                    process.exit(0);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Main test runner
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var args, testType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = process.argv.slice(2);
                    testType = args[0] || 'all';
                    console.log('\n🚀 Footy Oracle - API Integration Tests');
                    console.log('='.repeat(60));
                    console.log("Test Type: ".concat(testType));
                    console.log("Date: ".concat(new Date().toISOString()));
                    console.log('='.repeat(60));
                    if (!(testType === 'api' || testType === 'all')) return [3 /*break*/, 2];
                    return [4 /*yield*/, testAPIFootball()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(testType === 'db' || testType === 'all')) return [3 /*break*/, 4];
                    return [4 /*yield*/, testDatabaseStorage()];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (testType !== 'api' && testType !== 'db' && testType !== 'all') {
                        console.log('\n❌ Invalid test type. Use: api, db, or all');
                        console.log('Examples:');
                        console.log('  npm run test:api     - Test API-Football only');
                        console.log('  npm run test:db      - Test database storage');
                        console.log('  npm run test:all     - Run all tests');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
runTests();
