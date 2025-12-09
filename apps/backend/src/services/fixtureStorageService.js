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
exports.fetchAndStoreFixtures = fetchAndStoreFixtures;
exports.fetchAndStoreFixturesRange = fetchAndStoreFixturesRange;
exports.getFixturesByDate = getFixturesByDate;
exports.getFixturesByDateRange = getFixturesByDateRange;
exports.getFixturesByLeague = getFixturesByLeague;
exports.updateFixtureResult = updateFixtureResult;
exports.getAvailableLeagues = getAvailableLeagues;
exports.getFixtureCountsByStatus = getFixtureCountsByStatus;
var Fixture_js_1 = require("../models/Fixture.js");
var apiFootballService_js_1 = require("./apiFootballService.js");
/**
 * Fetch and store fixtures for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Number of fixtures stored
 */
function fetchAndStoreFixtures(date) {
    return __awaiter(this, void 0, void 0, function () {
        var fixturesData, storedCount, _i, fixturesData_1, fixtureData, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log("\n\uD83D\uDD04 Starting fixture fetch and store for ".concat(date, "..."));
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchFixturesWithOdds)(date)];
                case 1:
                    fixturesData = _a.sent();
                    if (fixturesData.length === 0) {
                        console.log("\u2139\uFE0F  No fixtures to store for ".concat(date));
                        return [2 /*return*/, 0];
                    }
                    console.log("\uD83D\uDCBE Storing ".concat(fixturesData.length, " fixtures in database..."));
                    storedCount = 0;
                    _i = 0, fixturesData_1 = fixturesData;
                    _a.label = 2;
                case 2:
                    if (!(_i < fixturesData_1.length)) return [3 /*break*/, 7];
                    fixtureData = fixturesData_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixtureData.fixtureId }, {
                            fixtureId: fixtureData.fixtureId,
                            date: new Date(fixtureData.date),
                            homeTeam: fixtureData.homeTeam,
                            awayTeam: fixtureData.awayTeam,
                            league: fixtureData.league,
                            country: fixtureData.country,
                            odds: fixtureData.odds,
                            status: fixtureData.status || 'scheduled',
                        }, { upsert: true, new: true })];
                case 4:
                    _a.sent();
                    storedCount++;
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("\u274C Error storing fixture ".concat(fixtureData.fixtureId, ":"), error_1.message);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log("\u2705 Successfully stored ".concat(storedCount, "/").concat(fixturesData.length, " fixtures"));
                    return [2 /*return*/, storedCount];
                case 8:
                    error_2 = _a.sent();
                    console.error('❌ Error in fetchAndStoreFixtures:', error_2.message);
                    throw error_2;
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch and store fixtures for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Total number of fixtures stored
 */
function fetchAndStoreFixturesRange(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var start, end, totalStored, date, dateStr, stored, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log("\n\uD83D\uDCC5 Fetching fixtures from ".concat(startDate, " to ").concat(endDate, "..."));
                    start = new Date(startDate);
                    end = new Date(endDate);
                    totalStored = 0;
                    date = new Date(start);
                    _a.label = 1;
                case 1:
                    if (!(date <= end)) return [3 /*break*/, 5];
                    dateStr = date.toISOString().split('T')[0];
                    return [4 /*yield*/, fetchAndStoreFixtures(dateStr)];
                case 2:
                    stored = _a.sent();
                    totalStored += stored;
                    if (!(date < end)) return [3 /*break*/, 4];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    date.setDate(date.getDate() + 1);
                    return [3 /*break*/, 1];
                case 5:
                    console.log("\n\u2705 Total fixtures stored: ".concat(totalStored));
                    return [2 /*return*/, totalStored];
                case 6:
                    error_3 = _a.sent();
                    console.error('❌ Error in fetchAndStoreFixturesRange:', error_3.message);
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get fixtures from database by date
 * @param date - Date in YYYY-MM-DD format
 * @returns Array of fixtures
 */
function getFixturesByDate(date) {
    return __awaiter(this, void 0, void 0, function () {
        var targetDate, nextDate, fixtures, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    targetDate = new Date(date);
                    nextDate = new Date(targetDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: targetDate, $lt: nextDate }
                        }).sort({ date: 1 })];
                case 1:
                    fixtures = _a.sent();
                    return [2 /*return*/, fixtures];
                case 2:
                    error_4 = _a.sent();
                    console.error('❌ Error getting fixtures by date:', error_4.message);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get fixtures from database by date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of fixtures
 */
function getFixturesByDateRange(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var start, end, fixtures, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    start = new Date(startDate);
                    end = new Date(endDate);
                    end.setDate(end.getDate() + 1); // Include end date
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: start, $lt: end }
                        }).sort({ date: 1 })];
                case 1:
                    fixtures = _a.sent();
                    return [2 /*return*/, fixtures];
                case 2:
                    error_5 = _a.sent();
                    console.error('❌ Error getting fixtures by date range:', error_5.message);
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get fixtures by league
 * @param league - League name
 * @returns Array of fixtures
 */
function getFixturesByLeague(league) {
    return __awaiter(this, void 0, void 0, function () {
        var fixtures, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({ league: league }).sort({ date: 1 })];
                case 1:
                    fixtures = _a.sent();
                    return [2 /*return*/, fixtures];
                case 2:
                    error_6 = _a.sent();
                    console.error('❌ Error getting fixtures by league:', error_6.message);
                    throw error_6;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update fixture result
 * @param fixtureId - Fixture ID
 * @param homeScore - Home team score
 * @param awayScore - Away team score
 * @param status - Fixture status
 */
function updateFixtureResult(fixtureId, homeScore, awayScore, status) {
    return __awaiter(this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixtureId }, {
                            score: { home: homeScore, away: awayScore },
                            status: status
                        })];
                case 1:
                    _a.sent();
                    console.log("\u2705 Updated result for fixture ".concat(fixtureId, ": ").concat(homeScore, "-").concat(awayScore));
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error("\u274C Error updating fixture result for ".concat(fixtureId, ":"), error_7.message);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all available leagues in database
 * @returns Array of league names
 */
function getAvailableLeagues() {
    return __awaiter(this, void 0, void 0, function () {
        var leagues, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.distinct('league')];
                case 1:
                    leagues = _a.sent();
                    return [2 /*return*/, leagues];
                case 2:
                    error_8 = _a.sent();
                    console.error('❌ Error getting available leagues:', error_8.message);
                    throw error_8;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Count fixtures by status
 * @returns Object with counts by status
 */
function getFixtureCountsByStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var counts, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.aggregate([
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 }
                                }
                            }
                        ])];
                case 1:
                    counts = _a.sent();
                    return [2 /*return*/, counts.reduce(function (acc, curr) {
                            acc[curr._id] = curr.count;
                            return acc;
                        }, {})];
                case 2:
                    error_9 = _a.sent();
                    console.error('❌ Error getting fixture counts:', error_9.message);
                    throw error_9;
                case 3: return [2 /*return*/];
            }
        });
    });
}
