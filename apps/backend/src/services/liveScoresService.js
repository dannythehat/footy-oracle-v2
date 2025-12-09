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
exports.fetchLiveFixtures = fetchLiveFixtures;
exports.fetchFixtureStatistics = fetchFixtureStatistics;
exports.updateLiveScores = updateLiveScores;
exports.updateRecentlyFinishedFixtures = updateRecentlyFinishedFixtures;
var axios_1 = require("axios");
var Fixture_js_1 = require("../models/Fixture.js");
var API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
var API_KEY = process.env.API_FOOTBALL_KEY;
var apiClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    timeout: 15000,
});
/**
 * MAP STATUS from API-Football to our format
 */
function mapStatus(short) {
    var statusMap = {
        'TBD': 'scheduled',
        'NS': 'scheduled',
        '1H': 'live',
        'HT': 'live',
        '2H': 'live',
        'ET': 'live',
        'BT': 'live',
        'P': 'live',
        'SUSP': 'live',
        'INT': 'live',
        'FT': 'finished',
        'AET': 'finished',
        'PEN': 'finished',
        'PST': 'postponed',
        'CANC': 'cancelled',
        'ABD': 'abandoned',
        'AWD': 'finished',
        'WO': 'finished',
    };
    return statusMap[short] || short;
}
/**
 * Fetch live fixtures from API-Football
 * Returns all currently live matches across all leagues
 */
function fetchLiveFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var response, fixtures, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🔴 Fetching live fixtures from API...');
                    return [4 /*yield*/, apiClient.get('/fixtures', {
                            params: { live: 'all' }
                        })];
                case 1:
                    response = _a.sent();
                    fixtures = response.data.response || [];
                    console.log("\u2705 Found ".concat(fixtures.length, " live fixtures from API"));
                    return [2 /*return*/, fixtures.map(function (f) {
                            var _a, _b, _c, _d;
                            return ({
                                fixtureId: f.fixture.id,
                                date: f.fixture.date,
                                homeTeam: f.teams.home.name,
                                awayTeam: f.teams.away.name,
                                homeTeamId: f.teams.home.id,
                                awayTeamId: f.teams.away.id,
                                league: f.league.name,
                                leagueId: f.league.id,
                                country: f.league.country,
                                season: f.league.season,
                                status: mapStatus(f.fixture.status.short),
                                statusShort: f.fixture.status.short,
                                elapsed: f.fixture.status.elapsed,
                                score: {
                                    home: (_a = f.goals.home) !== null && _a !== void 0 ? _a : null,
                                    away: (_b = f.goals.away) !== null && _b !== void 0 ? _b : null,
                                },
                                homeScore: (_c = f.goals.home) !== null && _c !== void 0 ? _c : null,
                                awayScore: (_d = f.goals.away) !== null && _d !== void 0 ? _d : null,
                            });
                        })];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Error fetching live fixtures:', error_1.message);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch detailed statistics for a specific fixture
 * Returns comprehensive match statistics including shots, possession, cards, etc.
 */
function fetchFixtureStatistics(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, stats, homeStats, awayStats, getStat, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("\uD83D\uDCCA Fetching statistics for fixture ".concat(fixtureId, "..."));
                    return [4 /*yield*/, apiClient.get('/fixtures/statistics', {
                            params: { fixture: fixtureId }
                        })];
                case 1:
                    response = _a.sent();
                    stats = response.data.response;
                    if (!stats || stats.length < 2) {
                        return [2 /*return*/, null];
                    }
                    homeStats = stats[0];
                    awayStats = stats[1];
                    getStat = function (teamStats, key) {
                        var _a;
                        var stat = (_a = teamStats === null || teamStats === void 0 ? void 0 : teamStats.statistics) === null || _a === void 0 ? void 0 : _a.find(function (s) { return s.type === key; });
                        return stat === null || stat === void 0 ? void 0 : stat.value;
                    };
                    return [2 /*return*/, {
                            home: {
                                shotsOnGoal: getStat(homeStats, 'Shots on Goal') || 0,
                                shotsOffGoal: getStat(homeStats, 'Shots off Goal') || 0,
                                shotsInsideBox: getStat(homeStats, 'Shots insidebox') || 0,
                                shotsOutsideBox: getStat(homeStats, 'Shots outsidebox') || 0,
                                totalShots: getStat(homeStats, 'Total Shots') || 0,
                                blockedShots: getStat(homeStats, 'Blocked Shots') || 0,
                                fouls: getStat(homeStats, 'Fouls') || 0,
                                cornerKicks: getStat(homeStats, 'Corner Kicks') || 0,
                                offsides: getStat(homeStats, 'Offsides') || 0,
                                ballPossession: getStat(homeStats, 'Ball Possession') || '0%',
                                yellowCards: getStat(homeStats, 'Yellow Cards') || 0,
                                redCards: getStat(homeStats, 'Red Cards') || 0,
                                goalkeeperSaves: getStat(homeStats, 'Goalkeeper Saves') || 0,
                                totalPasses: getStat(homeStats, 'Total passes') || 0,
                                passesAccurate: getStat(homeStats, 'Passes accurate') || 0,
                                passesPercentage: getStat(homeStats, 'Passes %') || '0%',
                            },
                            away: {
                                shotsOnGoal: getStat(awayStats, 'Shots on Goal') || 0,
                                shotsOffGoal: getStat(awayStats, 'Shots off Goal') || 0,
                                shotsInsideBox: getStat(awayStats, 'Shots insidebox') || 0,
                                shotsOutsideBox: getStat(awayStats, 'Shots outsidebox') || 0,
                                totalShots: getStat(awayStats, 'Total Shots') || 0,
                                blockedShots: getStat(awayStats, 'Blocked Shots') || 0,
                                fouls: getStat(awayStats, 'Fouls') || 0,
                                cornerKicks: getStat(awayStats, 'Corner Kicks') || 0,
                                offsides: getStat(awayStats, 'Offsides') || 0,
                                ballPossession: getStat(awayStats, 'Ball Possession') || '0%',
                                yellowCards: getStat(awayStats, 'Yellow Cards') || 0,
                                redCards: getStat(awayStats, 'Red Cards') || 0,
                                goalkeeperSaves: getStat(awayStats, 'Goalkeeper Saves') || 0,
                                totalPasses: getStat(awayStats, 'Total passes') || 0,
                                passesAccurate: getStat(awayStats, 'Passes accurate') || 0,
                                passesPercentage: getStat(awayStats, 'Passes %') || '0%',
                            },
                        }];
                case 2:
                    error_2 = _a.sent();
                    console.error("\u274C Error fetching statistics for fixture ".concat(fixtureId, ":"), error_2.message);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update live scores in database
 * ENHANCED: Now also checks recently finished fixtures to prevent stale 'live' status
 */
function updateLiveScores() {
    return __awaiter(this, void 0, void 0, function () {
        var liveFixtures, threeHoursAgo, recentDbFixtures, updated, processedIds, _i, liveFixtures_1, fixture, statistics, error_3, _a, recentDbFixtures_1, dbFixture, response, apiFixture, newStatus, homeScore, awayScore, error_4, totalChecked, error_5;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 20, , 21]);
                    console.log('🔄 Starting comprehensive live scores update...');
                    return [4 /*yield*/, fetchLiveFixtures()];
                case 1:
                    liveFixtures = _e.sent();
                    console.log("\uD83D\uDCCA API reports ".concat(liveFixtures.length, " live fixtures"));
                    threeHoursAgo = new Date();
                    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: threeHoursAgo },
                            status: 'live'
                        }).lean()];
                case 2:
                    recentDbFixtures = _e.sent();
                    console.log("\uD83D\uDCCA Database has ".concat(recentDbFixtures.length, " fixtures marked as 'live' from last 3 hours"));
                    updated = 0;
                    processedIds = new Set();
                    _i = 0, liveFixtures_1 = liveFixtures;
                    _e.label = 3;
                case 3:
                    if (!(_i < liveFixtures_1.length)) return [3 /*break*/, 10];
                    fixture = liveFixtures_1[_i];
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 8, , 9]);
                    processedIds.add(fixture.fixtureId);
                    return [4 /*yield*/, fetchFixtureStatistics(fixture.fixtureId)];
                case 5:
                    statistics = _e.sent();
                    // Update fixture in database with BOTH score formats
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixture.fixtureId }, {
                            $set: {
                                status: fixture.status,
                                statusShort: fixture.statusShort,
                                'score.home': fixture.score.home,
                                'score.away': fixture.score.away,
                                homeScore: fixture.homeScore,
                                awayScore: fixture.awayScore,
                                elapsed: fixture.elapsed,
                                statistics: statistics || undefined,
                                lastUpdated: new Date(),
                            }
                        }, { upsert: true })];
                case 6:
                    // Update fixture in database with BOTH score formats
                    _e.sent();
                    updated++;
                    console.log("\u2705 Updated LIVE: ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam, " (").concat(fixture.homeScore, "-").concat(fixture.awayScore, ") [").concat(fixture.elapsed, "']"));
                    // Rate limiting - reduced to 50ms for faster updates
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 7:
                    // Rate limiting - reduced to 50ms for faster updates
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _e.sent();
                    console.error("\u274C Error updating live fixture ".concat(fixture.fixtureId, ":"), error_3.message);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 3];
                case 10:
                    _a = 0, recentDbFixtures_1 = recentDbFixtures;
                    _e.label = 11;
                case 11:
                    if (!(_a < recentDbFixtures_1.length)) return [3 /*break*/, 19];
                    dbFixture = recentDbFixtures_1[_a];
                    if (processedIds.has(dbFixture.fixtureId)) {
                        return [3 /*break*/, 18]; // Already processed above
                    }
                    _e.label = 12;
                case 12:
                    _e.trys.push([12, 17, , 18]);
                    return [4 /*yield*/, apiClient.get('/fixtures', {
                            params: { id: dbFixture.fixtureId }
                        })];
                case 13:
                    response = _e.sent();
                    apiFixture = (_b = response.data.response) === null || _b === void 0 ? void 0 : _b[0];
                    if (!apiFixture) return [3 /*break*/, 15];
                    newStatus = mapStatus(apiFixture.fixture.status.short);
                    homeScore = (_c = apiFixture.goals.home) !== null && _c !== void 0 ? _c : null;
                    awayScore = (_d = apiFixture.goals.away) !== null && _d !== void 0 ? _d : null;
                    if (!(dbFixture.status !== newStatus)) return [3 /*break*/, 15];
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: dbFixture.fixtureId }, {
                            $set: {
                                status: newStatus,
                                statusShort: apiFixture.fixture.status.short,
                                'score.home': homeScore,
                                'score.away': awayScore,
                                homeScore: homeScore,
                                awayScore: awayScore,
                                lastUpdated: new Date(),
                            }
                        })];
                case 14:
                    _e.sent();
                    updated++;
                    console.log("\u2705 Updated STATUS: ".concat(dbFixture.homeTeam, " vs ").concat(dbFixture.awayTeam, " - ").concat(dbFixture.status, " \u2192 ").concat(newStatus));
                    _e.label = 15;
                case 15: 
                // Rate limiting
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 16:
                    // Rate limiting
                    _e.sent();
                    return [3 /*break*/, 18];
                case 17:
                    error_4 = _e.sent();
                    console.error("\u274C Error checking fixture ".concat(dbFixture.fixtureId, ":"), error_4.message);
                    return [3 /*break*/, 18];
                case 18:
                    _a++;
                    return [3 /*break*/, 11];
                case 19:
                    totalChecked = liveFixtures.length + recentDbFixtures.length;
                    console.log("\u2705 Live scores update complete: ".concat(updated, " fixtures updated (checked ").concat(totalChecked, " total)"));
                    return [2 /*return*/, { updated: updated, total: totalChecked }];
                case 20:
                    error_5 = _e.sent();
                    console.error('❌ Error in updateLiveScores:', error_5.message);
                    return [2 /*return*/, { updated: 0, total: 0 }];
                case 21: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update scores for recently finished fixtures (last 6 hours)
 * Ensures final scores are captured for matches that just ended
 */
function updateRecentlyFinishedFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var sixHoursAgo, recentFixtures, updated, _i, recentFixtures_1, fixture, response, apiFixture, newStatus, homeScore, awayScore, error_6, error_7;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    console.log('🏁 Updating recently finished fixtures...');
                    sixHoursAgo = new Date();
                    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: sixHoursAgo }
                        }).lean()];
                case 1:
                    recentFixtures = _d.sent();
                    if (recentFixtures.length === 0) {
                        console.log('ℹ️  No recently finished fixtures to update');
                        return [2 /*return*/, { updated: 0, total: 0 }];
                    }
                    console.log("\uD83D\uDD0D Checking ".concat(recentFixtures.length, " fixtures from last 6 hours..."));
                    updated = 0;
                    _i = 0, recentFixtures_1 = recentFixtures;
                    _d.label = 2;
                case 2:
                    if (!(_i < recentFixtures_1.length)) return [3 /*break*/, 10];
                    fixture = recentFixtures_1[_i];
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 8, , 9]);
                    return [4 /*yield*/, apiClient.get('/fixtures', {
                            params: { id: fixture.fixtureId }
                        })];
                case 4:
                    response = _d.sent();
                    apiFixture = (_a = response.data.response) === null || _a === void 0 ? void 0 : _a[0];
                    if (!apiFixture) return [3 /*break*/, 6];
                    newStatus = mapStatus(apiFixture.fixture.status.short);
                    homeScore = (_b = apiFixture.goals.home) !== null && _b !== void 0 ? _b : null;
                    awayScore = (_c = apiFixture.goals.away) !== null && _c !== void 0 ? _c : null;
                    if (!(fixture.status !== newStatus ||
                        fixture.homeScore !== homeScore ||
                        fixture.awayScore !== awayScore)) return [3 /*break*/, 6];
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixture.fixtureId }, {
                            $set: {
                                status: newStatus,
                                statusShort: apiFixture.fixture.status.short,
                                'score.home': homeScore,
                                'score.away': awayScore,
                                homeScore: homeScore,
                                awayScore: awayScore,
                                lastUpdated: new Date(),
                            }
                        })];
                case 5:
                    _d.sent();
                    updated++;
                    console.log("\u2705 Updated ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam, " - Status: ").concat(fixture.status, " \u2192 ").concat(newStatus));
                    _d.label = 6;
                case 6: 
                // Rate limiting
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 7:
                    // Rate limiting
                    _d.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_6 = _d.sent();
                    console.error("\u274C Error updating fixture ".concat(fixture.fixtureId, ":"), error_6.message);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    console.log("\u2705 Recently finished fixtures update complete: ".concat(updated, "/").concat(recentFixtures.length, " updated"));
                    return [2 /*return*/, { updated: updated, total: recentFixtures.length }];
                case 11:
                    error_7 = _d.sent();
                    console.error('❌ Error in updateRecentlyFinishedFixtures:', error_7.message);
                    return [2 /*return*/, { updated: 0, total: 0 }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
