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
var express_1 = require("express");
var Fixture_js_1 = require("../models/Fixture.js");
var liveScoresService_js_1 = require("../services/liveScoresService.js");
var leagues_js_1 = require("../config/leagues.js");
var router = (0, express_1.Router)();
/**
 * Helper function to format Date to HH:mm string
 */
function formatTime(date) {
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    return "".concat(hours, ":").concat(minutes);
}
/**
 * Helper function to format Date to YYYY-MM-DD string
 */
function formatDate(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
/* ============================================================
   🔴 GET LIVE FIXTURES - Real-time scores and statistics
   Returns all currently live fixtures with scores and stats
   ============================================================ */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var liveFixtures, formattedFixtures, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🔴 Fetching live fixtures from database...');
                return [4 /*yield*/, Fixture_js_1.Fixture.find({ status: 'live' })
                        .sort({ date: 1 })
                        .lean()];
            case 1:
                liveFixtures = _a.sent();
                if (liveFixtures.length === 0) {
                    return [2 /*return*/, res.json({
                            success: true,
                            data: [],
                            count: 0,
                            message: 'No live fixtures at the moment'
                        })];
                }
                formattedFixtures = liveFixtures.map(function (f) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    return ({
                        id: f.fixtureId,
                        fixtureId: f.fixtureId,
                        date: formatDate(new Date(f.date)),
                        time: formatTime(new Date(f.date)),
                        leagueId: f.leagueId,
                        league: f.league,
                        leagueName: f.league,
                        leagueLogo: (0, leagues_js_1.getLeagueLogo)(f.leagueId),
                        homeTeam: f.homeTeam,
                        awayTeam: f.awayTeam,
                        homeTeamId: f.homeTeamId,
                        awayTeamId: f.awayTeamId,
                        status: f.status,
                        statusShort: f.statusShort,
                        elapsed: f.elapsed,
                        homeScore: (_b = (_a = f.score) === null || _a === void 0 ? void 0 : _a.home) !== null && _b !== void 0 ? _b : null,
                        awayScore: (_d = (_c = f.score) === null || _c === void 0 ? void 0 : _c.away) !== null && _d !== void 0 ? _d : null,
                        score: {
                            home: (_f = (_e = f.score) === null || _e === void 0 ? void 0 : _e.home) !== null && _f !== void 0 ? _f : null,
                            away: (_h = (_g = f.score) === null || _g === void 0 ? void 0 : _g.away) !== null && _h !== void 0 ? _h : null
                        },
                        statistics: f.statistics || null,
                        lastUpdated: f.lastUpdated,
                        season: f.season,
                        country: f.country,
                    });
                });
                res.json({
                    success: true,
                    data: formattedFixtures,
                    count: formattedFixtures.length,
                    lastUpdated: new Date()
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('❌ Error fetching live fixtures:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1.message || 'Failed to fetch live fixtures'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/* ============================================================
   🔴 GET LIVE FIXTURE STATISTICS - Detailed stats for a fixture
   Returns comprehensive statistics for a specific live fixture
   ============================================================ */
router.get('/:fixtureId/statistics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixture, lastUpdate, now, minutesSinceUpdate, statistics, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                fixtureId = parseInt(req.params.fixtureId);
                if (isNaN(fixtureId)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid fixture ID'
                        })];
                }
                console.log("\uD83D\uDCCA Fetching statistics for fixture ".concat(fixtureId, "..."));
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: fixtureId }).lean()];
            case 1:
                fixture = _a.sent();
                if (!fixture) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Fixture not found'
                        })];
                }
                // If statistics are already in database and recent (< 2 minutes old), return them
                if (fixture.statistics && fixture.lastUpdated) {
                    lastUpdate = new Date(fixture.lastUpdated);
                    now = new Date();
                    minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / 1000 / 60;
                    if (minutesSinceUpdate < 2) {
                        return [2 /*return*/, res.json({
                                success: true,
                                data: {
                                    fixtureId: fixture.fixtureId,
                                    homeTeam: fixture.homeTeam,
                                    awayTeam: fixture.awayTeam,
                                    status: fixture.status,
                                    elapsed: fixture.elapsed,
                                    score: fixture.score,
                                    statistics: fixture.statistics,
                                    lastUpdated: fixture.lastUpdated
                                }
                            })];
                    }
                }
                return [4 /*yield*/, (0, liveScoresService_js_1.fetchFixtureStatistics)(fixtureId)];
            case 2:
                statistics = _a.sent();
                if (!statistics) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Statistics not available for this fixture'
                        })];
                }
                // Update database with new statistics
                return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixtureId }, {
                        $set: {
                            statistics: statistics,
                            lastUpdated: new Date()
                        }
                    })];
            case 3:
                // Update database with new statistics
                _a.sent();
                res.json({
                    success: true,
                    data: {
                        fixtureId: fixture.fixtureId,
                        homeTeam: fixture.homeTeam,
                        awayTeam: fixture.awayTeam,
                        status: fixture.status,
                        elapsed: fixture.elapsed,
                        score: fixture.score,
                        statistics: statistics,
                        lastUpdated: new Date()
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error('❌ Error fetching fixture statistics:', error_2);
                res.status(500).json({
                    success: false,
                    error: error_2.message || 'Failed to fetch fixture statistics'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/* ============================================================
   🔄 FORCE UPDATE LIVE SCORES - Manual trigger for live scores update
   Manually triggers the live scores update process
   ============================================================ */
router.post('/update', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🔄 Manually triggering live scores update...');
                return [4 /*yield*/, (0, liveScoresService_js_1.updateLiveScores)()];
            case 1:
                result = _a.sent();
                res.json({
                    success: true,
                    message: "Updated ".concat(result.updated, " live fixtures"),
                    updated: result.updated,
                    total: result.total,
                    timestamp: new Date()
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('❌ Error updating live scores:', error_3);
                res.status(500).json({
                    success: false,
                    error: error_3.message || 'Failed to update live scores'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
