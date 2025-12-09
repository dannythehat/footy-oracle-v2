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
exports.updateTodayOdds = updateTodayOdds;
exports.updateFixtureOdds = updateFixtureOdds;
var Fixture_js_1 = require("../models/Fixture.js");
var apiFootballService_js_1 = require("./apiFootballService.js");
/**
 * Fetch and update odds for today's fixtures
 * This ensures odds are available for display in the UI
 */
function updateTodayOdds() {
    return __awaiter(this, void 0, void 0, function () {
        var today, tomorrow, fixtures, updated, errors, _i, fixtures_1, fixture, odds, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    console.log('💰 Starting odds update for today\'s fixtures...');
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: today, $lt: tomorrow },
                            status: { $in: ['scheduled', 'live'] }
                        }).lean()];
                case 1:
                    fixtures = _a.sent();
                    console.log("\uD83D\uDCCA Found ".concat(fixtures.length, " fixtures for today"));
                    updated = 0;
                    errors = 0;
                    _i = 0, fixtures_1 = fixtures;
                    _a.label = 2;
                case 2:
                    if (!(_i < fixtures_1.length)) return [3 /*break*/, 11];
                    fixture = fixtures_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 9, , 10]);
                    console.log("\uD83D\uDCB0 Fetching odds for fixture ".concat(fixture.fixtureId, ": ").concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam));
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchOdds)(fixture.fixtureId)];
                case 4:
                    odds = _a.sent();
                    if (!odds) return [3 /*break*/, 6];
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixture.fixtureId }, {
                            $set: {
                                odds: odds,
                                lastUpdated: new Date()
                            }
                        })];
                case 5:
                    _a.sent();
                    updated++;
                    console.log("\u2705 Updated odds for fixture ".concat(fixture.fixtureId));
                    return [3 /*break*/, 7];
                case 6:
                    console.log("\u26A0\uFE0F  No odds available for fixture ".concat(fixture.fixtureId));
                    _a.label = 7;
                case 7: 
                // Rate limiting: wait 1 second between requests to avoid API limits
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 8:
                    // Rate limiting: wait 1 second between requests to avoid API limits
                    _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _a.sent();
                    console.error("\u274C Error fetching odds for fixture ".concat(fixture.fixtureId, ":"), err_1.message);
                    errors++;
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11:
                    console.log("\u2705 Odds update complete: ".concat(updated, "/").concat(fixtures.length, " updated, ").concat(errors, " errors"));
                    return [2 /*return*/, {
                            updated: updated,
                            total: fixtures.length,
                            errors: errors
                        }];
                case 12:
                    err_2 = _a.sent();
                    console.error('❌ Error in updateTodayOdds:', err_2.message);
                    throw err_2;
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch and update odds for a specific fixture
 */
function updateFixtureOdds(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var odds, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log("\uD83D\uDCB0 Fetching odds for fixture ".concat(fixtureId, "..."));
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchOdds)(fixtureId)];
                case 1:
                    odds = _a.sent();
                    if (!odds) return [3 /*break*/, 3];
                    return [4 /*yield*/, Fixture_js_1.Fixture.updateOne({ fixtureId: fixtureId }, {
                            $set: {
                                odds: odds,
                                lastUpdated: new Date()
                            }
                        })];
                case 2:
                    _a.sent();
                    console.log("\u2705 Updated odds for fixture ".concat(fixtureId));
                    return [2 /*return*/, true];
                case 3:
                    console.log("\u26A0\uFE0F  No odds available for fixture ".concat(fixtureId));
                    return [2 /*return*/, false];
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    console.error("\u274C Error updating odds for fixture ".concat(fixtureId, ":"), err_3.message);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
