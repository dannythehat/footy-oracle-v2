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
require("dotenv/config");
var axios_1 = require("axios");
var BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
var FIXTURES_URL = "".concat(BASE_URL, "/fixtures");
// Color codes for terminal output
var colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};
function log(color, message) {
    console.log("".concat(color).concat(message).concat(colors.reset));
}
function logSuccess(message) {
    log(colors.green, "\u2705 ".concat(message));
}
function logError(message) {
    log(colors.red, "\u274C ".concat(message));
}
function logInfo(message) {
    log(colors.cyan, "\u2139\uFE0F  ".concat(message));
}
function logWarning(message) {
    log(colors.yellow, "\u26A0\uFE0F  ".concat(message));
}
function logSection(message) {
    console.log('\n' + '='.repeat(60));
    log(colors.blue, "\uD83D\uDCCC ".concat(message));
    console.log('='.repeat(60));
}
var testResults = [];
function testEndpoint(name, testFn) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, duration, error_1, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, testFn()];
                case 2:
                    _a.sent();
                    duration = Date.now() - startTime;
                    testResults.push({ name: name, passed: true, duration: duration });
                    logSuccess("".concat(name, " (").concat(duration, "ms)"));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    duration = Date.now() - startTime;
                    testResults.push({
                        name: name,
                        passed: false,
                        error: error_1.message,
                        duration: duration
                    });
                    logError("".concat(name, " - ").concat(error_1.message, " (").concat(duration, "ms)"));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Test 1: GET /fixtures (List all fixtures)
function testGetFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!Array.isArray(response.data.data)) {
                        throw new Error('Response data should be an array');
                    }
                    logInfo("Found ".concat(response.data.count, " fixtures"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 2: GET /fixtures?date=YYYY-MM-DD (Filter by date)
function testGetFixturesByDate() {
    return __awaiter(this, void 0, void 0, function () {
        var today, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "?date=").concat(today))];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("Found ".concat(response.data.count, " fixtures for ").concat(today));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 3: GET /fixtures/meta/leagues (Get distinct leagues)
function testGetLeagues() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/meta/leagues"))];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!Array.isArray(response.data.data)) {
                        throw new Error('Response data should be an array');
                    }
                    logInfo("Found ".concat(response.data.count, " leagues"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 4: GET /fixtures/:id (Get fixture by ID)
function testGetFixtureById() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixtureId, response, fixture, requiredFields, _i, requiredFields_1, field;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixtureId = listResponse.data.data[0].fixtureId;
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/").concat(fixtureId))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!response.data.data) {
                        throw new Error('Response should contain fixture data');
                    }
                    fixture = response.data.data;
                    requiredFields = [
                        'fixtureId', 'homeTeam', 'awayTeam', 'league',
                        'date', 'time', 'status'
                    ];
                    for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
                        field = requiredFields_1[_i];
                        if (!(field in fixture)) {
                            throw new Error("Fixture missing required field: ".concat(field));
                        }
                    }
                    logInfo("Fixture: ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 5: GET /fixtures/:id/odds (NEW ENDPOINT - Get fixture odds)
function testGetFixtureOdds() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixtureId, response, oddsData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixtureId = listResponse.data.data[0].fixtureId;
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/").concat(fixtureId, "/odds"))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!response.data.data) {
                        throw new Error('Response should contain odds data');
                    }
                    oddsData = response.data.data;
                    if (!oddsData.fixtureId) {
                        throw new Error('Odds data should contain fixtureId');
                    }
                    if (oddsData.odds) {
                        logInfo("Odds available for fixture ".concat(fixtureId));
                    }
                    else {
                        logWarning("No odds data for fixture ".concat(fixtureId));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Test 6: GET /fixtures/:id/h2h (Head to head)
function testGetH2H() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixture, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixture = listResponse.data.data[0];
                    if (!fixture.homeTeamId || !fixture.awayTeamId) {
                        throw new Error('Fixture missing team IDs');
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/").concat(fixture.fixtureId, "/h2h?homeTeamId=").concat(fixture.homeTeamId, "&awayTeamId=").concat(fixture.awayTeamId))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("H2H data retrieved for ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 7: GET /fixtures/:id/stats (Fixture stats)
function testGetFixtureStats() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixture, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixture = listResponse.data.data[0];
                    if (!fixture.homeTeamId || !fixture.awayTeamId || !fixture.leagueId || !fixture.season) {
                        throw new Error('Fixture missing required fields for stats');
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/").concat(fixture.fixtureId, "/stats?homeTeamId=").concat(fixture.homeTeamId, "&awayTeamId=").concat(fixture.awayTeamId, "&leagueId=").concat(fixture.leagueId, "&season=").concat(fixture.season))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("Stats retrieved for fixture ".concat(fixture.fixtureId));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 8: GET /fixtures/team/:teamId/stats (Team stats)
function testGetTeamStats() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixture, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixture = listResponse.data.data[0];
                    if (!fixture.homeTeamId || !fixture.leagueId || !fixture.season) {
                        throw new Error('Fixture missing required fields for team stats');
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/team/").concat(fixture.homeTeamId, "/stats?leagueId=").concat(fixture.leagueId, "&season=").concat(fixture.season))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("Team stats retrieved for team ".concat(fixture.homeTeamId));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 9: GET /fixtures/team/:teamId/last (Team last fixtures)
function testGetTeamLastFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var listResponse, fixture, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(FIXTURES_URL)];
                case 1:
                    listResponse = _a.sent();
                    if (!listResponse.data.data || listResponse.data.data.length === 0) {
                        throw new Error('No fixtures available to test');
                    }
                    fixture = listResponse.data.data[0];
                    if (!fixture.homeTeamId) {
                        throw new Error('Fixture missing homeTeamId');
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/team/").concat(fixture.homeTeamId, "/last?last=5"))];
                case 2:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("Last fixtures retrieved for team ".concat(fixture.homeTeamId));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 10: POST /fixtures/refresh-scores (Refresh scores)
function testRefreshScores() {
    return __awaiter(this, void 0, void 0, function () {
        var today, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date().toISOString().split('T')[0];
                    return [4 /*yield*/, axios_1.default.post("".concat(FIXTURES_URL, "/refresh-scores"), {
                            date: today
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    logInfo("Refreshed ".concat(response.data.updated, " fixtures"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 11: POST /fixtures/analyze (Analyze single fixture)
function testAnalyzeFixture() {
    return __awaiter(this, void 0, void 0, function () {
        var testFixture, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFixture = {
                        id: 'test-001',
                        homeTeam: 'Manchester City',
                        awayTeam: 'Arsenal',
                        league: 'Premier League',
                        date: new Date().toISOString(),
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(FIXTURES_URL, "/analyze"), testFixture)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!response.data.data) {
                        throw new Error('Response should contain analysis data');
                    }
                    logInfo("Analysis completed for ".concat(testFixture.homeTeam, " vs ").concat(testFixture.awayTeam));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 12: POST /fixtures/analyze-bulk (Analyze multiple fixtures)
function testAnalyzeBulkFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var testFixtures, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFixtures = [
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
                    return [4 /*yield*/, axios_1.default.post("".concat(FIXTURES_URL, "/analyze-bulk"), {
                            fixtures: testFixtures
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!Array.isArray(response.data.data)) {
                        throw new Error('Response data should be an array');
                    }
                    logInfo("Analyzed ".concat(response.data.count, " fixtures"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 13: POST /fixtures/golden-bets (Find golden bets)
function testFindGoldenBets() {
    return __awaiter(this, void 0, void 0, function () {
        var testFixtures, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFixtures = [
                        {
                            id: 'test-001',
                            homeTeam: 'Manchester City',
                            awayTeam: 'Arsenal',
                            league: 'Premier League',
                            date: new Date().toISOString(),
                        }
                    ];
                    return [4 /*yield*/, axios_1.default.post("".concat(FIXTURES_URL, "/golden-bets"), {
                            fixtures: testFixtures,
                            minConfidence: 80
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!Array.isArray(response.data.data)) {
                        throw new Error('Response data should be an array');
                    }
                    logInfo("Found ".concat(response.data.count, " golden bets"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 14: POST /fixtures/value-bets (Find value bets)
function testFindValueBets() {
    return __awaiter(this, void 0, void 0, function () {
        var testFixtures, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testFixtures = [
                        {
                            id: 'test-001',
                            homeTeam: 'Manchester City',
                            awayTeam: 'Arsenal',
                            league: 'Premier League',
                            date: new Date().toISOString(),
                        }
                    ];
                    return [4 /*yield*/, axios_1.default.post("".concat(FIXTURES_URL, "/value-bets"), {
                            fixtures: testFixtures,
                            minValue: 5
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Expected status 200, got ".concat(response.status));
                    }
                    if (!response.data.success) {
                        throw new Error('Response success should be true');
                    }
                    if (!Array.isArray(response.data.data)) {
                        throw new Error('Response data should be an array');
                    }
                    logInfo("Found ".concat(response.data.count, " value bets"));
                    return [2 /*return*/];
            }
        });
    });
}
// Test 15: Error handling - Invalid fixture ID
function testInvalidFixtureId() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/999999999"))];
                case 1:
                    _a.sent();
                    throw new Error('Should have returned 404 for invalid fixture ID');
                case 2:
                    error_2 = _a.sent();
                    if (error_2.response && error_2.response.status === 404) {
                        logInfo('Correctly returned 404 for invalid fixture ID');
                    }
                    else {
                        throw error_2;
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Test 16: Error handling - Missing required parameters
function testMissingParameters() {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("".concat(FIXTURES_URL, "/1/h2h"))];
                case 1:
                    _a.sent();
                    throw new Error('Should have returned 400 for missing parameters');
                case 2:
                    error_3 = _a.sent();
                    if (error_3.response && error_3.response.status === 400) {
                        logInfo('Correctly returned 400 for missing parameters');
                    }
                    else {
                        throw error_3;
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function runAllTests() {
    return __awaiter(this, void 0, void 0, function () {
        var error_4, passed, failed, total, passRate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logSection('FIXTURES API ENDPOINT TESTS');
                    console.log("\n\uD83D\uDD17 Testing API at: ".concat(BASE_URL));
                    console.log("\uD83D\uDCC5 Test Date: ".concat(new Date().toISOString(), "\n"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL.replace('/api', ''), "/health"))];
                case 2:
                    _a.sent();
                    logSuccess('Server is running');
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    logError('Server is not running! Please start the server first.');
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4:
                    logSection('GET ENDPOINTS');
                    return [4 /*yield*/, testEndpoint('GET /fixtures', testGetFixtures)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures?date=YYYY-MM-DD', testGetFixturesByDate)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/meta/leagues', testGetLeagues)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/:id', testGetFixtureById)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/:id/odds (NEW)', testGetFixtureOdds)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/:id/h2h', testGetH2H)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/:id/stats', testGetFixtureStats)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/team/:teamId/stats', testGetTeamStats)];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('GET /fixtures/team/:teamId/last', testGetTeamLastFixtures)];
                case 13:
                    _a.sent();
                    logSection('POST ENDPOINTS');
                    return [4 /*yield*/, testEndpoint('POST /fixtures/refresh-scores', testRefreshScores)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('POST /fixtures/analyze', testAnalyzeFixture)];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('POST /fixtures/analyze-bulk', testAnalyzeBulkFixtures)];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('POST /fixtures/golden-bets', testFindGoldenBets)];
                case 17:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('POST /fixtures/value-bets', testFindValueBets)];
                case 18:
                    _a.sent();
                    logSection('ERROR HANDLING');
                    return [4 /*yield*/, testEndpoint('Invalid fixture ID (404)', testInvalidFixtureId)];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, testEndpoint('Missing parameters (400)', testMissingParameters)];
                case 20:
                    _a.sent();
                    // Print summary
                    logSection('TEST SUMMARY');
                    passed = testResults.filter(function (r) { return r.passed; }).length;
                    failed = testResults.filter(function (r) { return !r.passed; }).length;
                    total = testResults.length;
                    passRate = ((passed / total) * 100).toFixed(1);
                    console.log("\n\uD83D\uDCCA Results: ".concat(passed, "/").concat(total, " tests passed (").concat(passRate, "%)\n"));
                    if (failed > 0) {
                        logError("Failed Tests (".concat(failed, "):"));
                        testResults
                            .filter(function (r) { return !r.passed; })
                            .forEach(function (r) {
                            console.log("  \u274C ".concat(r.name));
                            console.log("     ".concat(colors.red).concat(r.error).concat(colors.reset));
                        });
                    }
                    console.log('\n' + '='.repeat(60));
                    if (failed === 0) {
                        logSuccess('ALL TESTS PASSED! 🎉');
                    }
                    else {
                        logError("".concat(failed, " TEST(S) FAILED"));
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Run all tests
runAllTests().catch(function (error) {
    logError("Test suite failed: ".concat(error.message));
    process.exit(1);
});
