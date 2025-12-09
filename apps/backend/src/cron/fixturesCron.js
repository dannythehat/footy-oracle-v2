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
exports.startFixturesCron = startFixturesCron;
exports.loadFixturesWindow = loadFixturesWindow;
exports.loadUpcomingFixtures = loadUpcomingFixtures;
exports.loadTodaysFixtures = loadTodaysFixtures;
exports.loadFixturesForDate = loadFixturesForDate;
var node_cron_1 = require("node-cron");
var Fixture_js_1 = require("../models/Fixture.js");
var apiFootballService_js_1 = require("../services/apiFootballService.js");
var oddsUpdateService_js_1 = require("../services/oddsUpdateService.js");
/**
 * Start the fixtures cron: refreshes 7 days back + 7 days forward
 */
function startFixturesCron() {
    var _this = this;
    // Run once daily at 3:00 AM UTC (before odds update at 5 AM)
    node_cron_1.default.schedule('0 3 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔄 Running daily fixtures update cron (3:00 AM UTC)...');
                    return [4 /*yield*/, loadFixturesWindow()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Update odds daily at 5:00 AM UTC (BEFORE ML predictions at 6 AM)
    node_cron_1.default.schedule('0 5 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('💰 Running daily odds update cron (5:00 AM UTC - before ML at 6 AM)...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, oddsUpdateService_js_1.updateTodayOdds)()];
                case 2:
                    result = _a.sent();
                    console.log("\u2705 Daily odds update complete: ".concat(result.updated, "/").concat(result.total, " updated, ").concat(result.errors, " errors"));
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('❌ Daily odds update failed:', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Run once on startup
    console.log('🚀 Fixtures cron initialized - loading fixtures window...');
    loadFixturesWindow().catch(console.error);
}
/**
 * Load fixtures for a 14-day window (7 days back + 7 days ahead)
 */
function loadFixturesWindow() {
    return __awaiter(this, void 0, void 0, function () {
        var today, startDate, endDate, totalSaved, totalUpdated, date, dateStr, result, err_2, oddsResult, err_3, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    today = new Date();
                    startDate = new Date(today);
                    startDate.setDate(startDate.getDate() - 7);
                    endDate = new Date(today);
                    endDate.setDate(endDate.getDate() + 7);
                    console.log("\uD83D\uDCC5 Loading fixtures window: ".concat(startDate.toISOString().split('T')[0], " \u2192 ").concat(endDate
                        .toISOString()
                        .split('T')[0]));
                    totalSaved = 0;
                    totalUpdated = 0;
                    date = new Date(startDate);
                    _a.label = 1;
                case 1:
                    if (!(date <= endDate)) return [3 /*break*/, 7];
                    dateStr = date.toISOString().split('T')[0];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, loadFixturesForDate(dateStr)];
                case 3:
                    result = _a.sent();
                    totalSaved += result.new || 0;
                    totalUpdated += result.updated || 0;
                    // Avoid API rate limits
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 800); })];
                case 4:
                    // Avoid API rate limits
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.error("\u274C Error loading fixtures for ".concat(dateStr, ":"), err_2);
                    return [3 /*break*/, 6];
                case 6:
                    date.setDate(date.getDate() + 1);
                    return [3 /*break*/, 1];
                case 7:
                    console.log("\u2705 Window update complete: ".concat(totalSaved, " new, ").concat(totalUpdated, " updated"));
                    // After loading fixtures, update odds for today's fixtures
                    console.log('💰 Updating odds for today\'s fixtures...');
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, oddsUpdateService_js_1.updateTodayOdds)()];
                case 9:
                    oddsResult = _a.sent();
                    console.log("\u2705 Odds update complete: ".concat(oddsResult.updated, "/").concat(oddsResult.total, " updated, ").concat(oddsResult.errors, " errors"));
                    return [3 /*break*/, 11];
                case 10:
                    err_3 = _a.sent();
                    console.error('❌ Odds update failed:', err_3);
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    err_4 = _a.sent();
                    console.error('❌ Error loading fixtures window:', err_4);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Legacy compatibility
 */
function loadUpcomingFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadFixturesWindow()];
        });
    });
}
function loadTodaysFixtures() {
    return __awaiter(this, void 0, void 0, function () {
        var today;
        return __generator(this, function (_a) {
            today = new Date().toISOString().split('T')[0];
            return [2 /*return*/, loadFixturesForDate(today)];
        });
    });
}
/**
 * Load fixtures for a single date
 * NOTE: Odds are now fetched separately by the dedicated odds update cron at 5 AM
 */
function loadFixturesForDate(date) {
    return __awaiter(this, void 0, void 0, function () {
        var fixturesData, saved, updated, _i, fixturesData_1, fixture, existing, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    console.log("\uD83D\uDCE5 Fetching fixtures for ".concat(date, "..."));
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchFixtures)(date)];
                case 1:
                    fixturesData = _a.sent();
                    if (!fixturesData || fixturesData.length === 0) {
                        console.log("\u2139\uFE0F No fixtures found for ".concat(date));
                        return [2 /*return*/, { success: true, count: 0, new: 0, updated: 0 }];
                    }
                    saved = 0;
                    updated = 0;
                    _i = 0, fixturesData_1 = fixturesData;
                    _a.label = 2;
                case 2:
                    if (!(_i < fixturesData_1.length)) return [3 /*break*/, 10];
                    fixture = fixturesData_1[_i];
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: fixture.fixtureId })];
                case 3:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 5];
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixture.fixtureId }, {
                            $set: {
                                date: new Date(fixture.date),
                                homeTeam: fixture.homeTeam,
                                awayTeam: fixture.awayTeam,
                                homeTeamId: fixture.homeTeamId,
                                awayTeamId: fixture.awayTeamId,
                                league: fixture.league,
                                leagueId: fixture.leagueId,
                                country: fixture.country,
                                season: fixture.season,
                                status: fixture.status,
                                updatedAt: new Date(),
                            },
                        })];
                case 4:
                    _a.sent();
                    updated++;
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, Fixture_js_1.Fixture.create({
                        fixtureId: fixture.fixtureId,
                        date: new Date(fixture.date),
                        homeTeam: fixture.homeTeam,
                        awayTeam: fixture.awayTeam,
                        homeTeamId: fixture.homeTeamId,
                        awayTeamId: fixture.awayTeamId,
                        league: fixture.league,
                        leagueId: fixture.leagueId,
                        country: fixture.country,
                        season: fixture.season,
                        status: fixture.status,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })];
                case 6:
                    _a.sent();
                    saved++;
                    _a.label = 7;
                case 7: 
                // Rate limiting: API-Football gets angry otherwise
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 250); })];
                case 8:
                    // Rate limiting: API-Football gets angry otherwise
                    _a.sent();
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10:
                    console.log("\u2705 ".concat(date, ": ").concat(saved, " new, ").concat(updated, " updated"));
                    return [2 /*return*/, { success: true, count: saved + updated, new: saved, updated: updated }];
                case 11:
                    err_5 = _a.sent();
                    console.error("\u274C Error loading fixtures for ".concat(date, ":"), err_5);
                    throw err_5;
                case 12: return [2 /*return*/];
            }
        });
    });
}
