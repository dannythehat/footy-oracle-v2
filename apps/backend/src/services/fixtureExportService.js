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
exports.exportFixturesForML = exportFixturesForML;
exports.exportFixturesForDateRange = exportFixturesForDateRange;
exports.getExportStatus = getExportStatus;
var Fixture_js_1 = require("../models/Fixture.js");
var promises_1 = require("fs/promises");
var path_1 = require("path");
/**
 * Export fixtures in ML-compatible format
 * ML scripts read this to generate predictions for the 4 markets
 */
function exportFixturesForML() {
    return __awaiter(this, arguments, void 0, function (date) {
        var startOfDay, endOfDay, fixtures, mlFormat, outputDir, outputPath, error_1;
        if (date === void 0) { date = new Date(); }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    startOfDay = new Date(date);
                    startOfDay.setHours(0, 0, 0, 0);
                    endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            kickoff: {
                                $gte: startOfDay,
                                $lte: endOfDay,
                            },
                        }).lean()];
                case 1:
                    fixtures = _a.sent();
                    console.log("\uD83D\uDCE4 Exporting ".concat(fixtures.length, " fixtures for ML processing..."));
                    mlFormat = fixtures.map(function (fixture) {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        return ({
                            fixture_id: fixture.fixtureId,
                            home_team: fixture.homeTeam,
                            away_team: fixture.awayTeam,
                            league: fixture.league,
                            kickoff: fixture.kickoff,
                            venue: fixture.venue || '',
                            // Team form (last 5 matches)
                            home_form: fixture.homeForm || [],
                            away_form: fixture.awayForm || [],
                            // Head to head
                            h2h: fixture.headToHead || [],
                            // Team statistics (if available)
                            home_stats: {
                                goals_scored_avg: ((_a = fixture.homeStats) === null || _a === void 0 ? void 0 : _a.goalsScored) || 0,
                                goals_conceded_avg: ((_b = fixture.homeStats) === null || _b === void 0 ? void 0 : _b.goalsConceded) || 0,
                                corners_avg: ((_c = fixture.homeStats) === null || _c === void 0 ? void 0 : _c.corners) || 0,
                                cards_avg: ((_d = fixture.homeStats) === null || _d === void 0 ? void 0 : _d.cards) || 0,
                            },
                            away_stats: {
                                goals_scored_avg: ((_e = fixture.awayStats) === null || _e === void 0 ? void 0 : _e.goalsScored) || 0,
                                goals_conceded_avg: ((_f = fixture.awayStats) === null || _f === void 0 ? void 0 : _f.goalsConceded) || 0,
                                corners_avg: ((_g = fixture.awayStats) === null || _g === void 0 ? void 0 : _g.corners) || 0,
                                cards_avg: ((_h = fixture.awayStats) === null || _h === void 0 ? void 0 : _h.cards) || 0,
                            },
                        });
                    });
                    outputDir = (0, path_1.join)(process.cwd(), '../../shared/ml_inputs');
                    return [4 /*yield*/, (0, promises_1.mkdir)(outputDir, { recursive: true })];
                case 2:
                    _a.sent();
                    outputPath = (0, path_1.join)(outputDir, 'fixtures_today.json');
                    return [4 /*yield*/, (0, promises_1.writeFile)(outputPath, JSON.stringify(mlFormat, null, 2))];
                case 3:
                    _a.sent();
                    console.log("\u2705 Exported ".concat(fixtures.length, " fixtures to ").concat(outputPath));
                    console.log("\uD83D\uDCCA ML can now generate predictions for 4 markets: BTTS, Over 2.5 Goals, Over 9.5 Corners, Over 3.5 Cards");
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error exporting fixtures for ML:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Export fixtures for a specific date range
 */
function exportFixturesForDateRange(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var fixtures, mlFormat, outputDir, outputPath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            kickoff: {
                                $gte: startDate,
                                $lte: endDate,
                            },
                        }).lean()];
                case 1:
                    fixtures = _a.sent();
                    console.log("\uD83D\uDCE4 Exporting ".concat(fixtures.length, " fixtures for date range..."));
                    mlFormat = fixtures.map(function (fixture) { return ({
                        fixture_id: fixture.fixtureId,
                        home_team: fixture.homeTeam,
                        away_team: fixture.awayTeam,
                        league: fixture.league,
                        kickoff: fixture.kickoff,
                        venue: fixture.venue || '',
                        home_form: fixture.homeForm || [],
                        away_form: fixture.awayForm || [],
                        h2h: fixture.headToHead || [],
                    }); });
                    outputDir = (0, path_1.join)(process.cwd(), '../../shared/ml_inputs');
                    return [4 /*yield*/, (0, promises_1.mkdir)(outputDir, { recursive: true })];
                case 2:
                    _a.sent();
                    outputPath = (0, path_1.join)(outputDir, 'fixtures_range.json');
                    return [4 /*yield*/, (0, promises_1.writeFile)(outputPath, JSON.stringify(mlFormat, null, 2))];
                case 3:
                    _a.sent();
                    console.log("\u2705 Exported ".concat(fixtures.length, " fixtures to ").concat(outputPath));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('❌ Error exporting fixtures for date range:', error_2);
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get export status and statistics
 */
function getExportStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var today, tomorrow, fixtureCount, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, Fixture_js_1.Fixture.countDocuments({
                            kickoff: {
                                $gte: today,
                                $lt: tomorrow,
                            },
                        })];
                case 1:
                    fixtureCount = _a.sent();
                    return [2 /*return*/, {
                            lastExport: new Date(), // TODO: Track actual last export time
                            fixtureCount: fixtureCount,
                            status: fixtureCount > 0 ? 'ready' : 'pending',
                        }];
                case 2:
                    error_3 = _a.sent();
                    console.error('❌ Error getting export status:', error_3);
                    return [2 /*return*/, {
                            lastExport: null,
                            fixtureCount: 0,
                            status: 'error',
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
