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
exports.settlePendingPredictions = settlePendingPredictions;
exports.settlePredictionByFixture = settlePredictionByFixture;
exports.getSettlementStats = getSettlementStats;
var Prediction_js_1 = require("../models/Prediction.js");
var Fixture_js_1 = require("../models/Fixture.js");
/**
 * Result Settlement Service
 * Uses stored Fixture + Prediction data only (no external API calls)
 */
var STAKE_PER_BET = 10; // stake per bet unit
/**
 * Helper: get simple match result + stats from Fixture
 */
function buildResultFromFixture(fixture) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!fixture || !fixture.score)
        return null;
    var homeScore = fixture.score.home;
    var awayScore = fixture.score.away;
    if (homeScore == null || awayScore == null)
        return null;
    var stats = fixture.statistics || {};
    // Try to derive cards & corners from stored stats (if present)
    var homeStats = stats.home || {};
    var awayStats = stats.away || {};
    var homeCorners = (_b = (_a = homeStats.corners) !== null && _a !== void 0 ? _a : homeStats.cornerKicks) !== null && _b !== void 0 ? _b : 0;
    var awayCorners = (_d = (_c = awayStats.corners) !== null && _c !== void 0 ? _c : awayStats.cornerKicks) !== null && _d !== void 0 ? _d : 0;
    var homeCards = ((_e = homeStats.yellowCards) !== null && _e !== void 0 ? _e : 0) + ((_f = homeStats.redCards) !== null && _f !== void 0 ? _f : 0);
    var awayCards = ((_g = awayStats.yellowCards) !== null && _g !== void 0 ? _g : 0) + ((_h = awayStats.redCards) !== null && _h !== void 0 ? _h : 0);
    return {
        homeScore: homeScore,
        awayScore: awayScore,
        homeCorners: homeCorners,
        awayCorners: awayCorners,
        homeCards: homeCards,
        awayCards: awayCards,
    };
}
/**
 * Core result check, simplified but matching your markets
 */
function checkPredictionResult(prediction, result) {
    var market = (prediction.market || '').toLowerCase();
    var pred = (prediction.prediction || '').toLowerCase();
    if (!result)
        return false;
    switch (market) {
        case 'match winner':
        case 'winner':
            return checkMatchWinner(pred, result);
        case 'both teams to score':
        case 'btts':
            return checkBTTS(pred, result);
        case 'over/under 2.5':
        case 'over/under 2.5 goals':
            return checkOverUnder25(pred, result);
        case 'cards':
        case 'over/under cards':
            return checkCards(pred, result);
        case 'corners':
        case 'over/under corners':
            return checkCorners(pred, result);
        default:
            console.warn("\u26A0\uFE0F Unknown market type: ".concat(market));
            return false;
    }
}
function checkMatchWinner(prediction, result) {
    var homeScore = result.homeScore, awayScore = result.awayScore;
    if (prediction.includes('home') || prediction.includes('1')) {
        return homeScore > awayScore;
    }
    else if (prediction.includes('away') || prediction.includes('2')) {
        return awayScore > homeScore;
    }
    else if (prediction.includes('draw') || prediction.includes('x')) {
        return homeScore === awayScore;
    }
    return false;
}
function checkBTTS(prediction, result) {
    var homeScore = result.homeScore, awayScore = result.awayScore;
    var bothScored = homeScore > 0 && awayScore > 0;
    if (prediction.includes('yes'))
        return bothScored;
    if (prediction.includes('no'))
        return !bothScored;
    return false;
}
function checkOverUnder25(prediction, result) {
    var homeScore = result.homeScore, awayScore = result.awayScore;
    var totalGoals = homeScore + awayScore;
    if (prediction.includes('over'))
        return totalGoals > 2.5;
    if (prediction.includes('under'))
        return totalGoals < 2.5;
    return false;
}
function checkCorners(prediction, result) {
    var totalCorners = (result.homeCorners || 0) + (result.awayCorners || 0);
    if (prediction.includes('over'))
        return totalCorners > 9.5;
    if (prediction.includes('under'))
        return totalCorners < 9.5;
    return false;
}
function checkCards(prediction, result) {
    var totalCards = (result.homeCards || 0) + (result.awayCards || 0);
    if (prediction.includes('over'))
        return totalCards > 3.5;
    if (prediction.includes('under'))
        return totalCards < 3.5;
    return false;
}
/**
 * Settle all pending predictions for finished fixtures
 */
function settlePendingPredictions() {
    return __awaiter(this, void 0, void 0, function () {
        var pendingPredictions, settlements, _i, pendingPredictions_1, prediction, fixture, actualResult, isWin, profit, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    console.log('🔄 Starting result settlement (pending predictions)...');
                    return [4 /*yield*/, Prediction_js_1.Prediction.find({ result: 'pending' })];
                case 1:
                    pendingPredictions = _a.sent();
                    if (pendingPredictions.length === 0) {
                        console.log('ℹ️ No pending predictions to settle');
                        return [2 /*return*/, []];
                    }
                    console.log("\uD83D\uDCCA Found ".concat(pendingPredictions.length, " pending predictions"));
                    settlements = [];
                    _i = 0, pendingPredictions_1 = pendingPredictions;
                    _a.label = 2;
                case 2:
                    if (!(_i < pendingPredictions_1.length)) return [3 /*break*/, 8];
                    prediction = pendingPredictions_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOne({
                            fixtureId: prediction.fixtureId,
                        }).lean()];
                case 4:
                    fixture = _a.sent();
                    if (!fixture || fixture.status !== 'finished') {
                        return [3 /*break*/, 7]; // Skip if not finished
                    }
                    actualResult = buildResultFromFixture(fixture);
                    if (!actualResult) {
                        console.warn("\u26A0\uFE0F Could not build result for fixture ".concat(prediction.fixtureId));
                        return [3 /*break*/, 7];
                    }
                    isWin = checkPredictionResult(prediction, actualResult);
                    profit = isWin
                        ? (prediction.odds - 1) * STAKE_PER_BET
                        : -STAKE_PER_BET;
                    prediction.result = isWin ? 'win' : 'loss';
                    prediction.profit = profit;
                    return [4 /*yield*/, prediction.save()];
                case 5:
                    _a.sent();
                    settlements.push({
                        fixtureId: prediction.fixtureId,
                        match: "".concat(prediction.homeTeam, " vs ").concat(prediction.awayTeam),
                        prediction: prediction.prediction,
                        result: prediction.result,
                        profit: profit,
                        odds: prediction.odds,
                    });
                    console.log("\u2705 Settled: ".concat(prediction.homeTeam, " vs ").concat(prediction.awayTeam, " - ").concat(prediction.result.toUpperCase()));
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error("\u274C Error settling prediction ".concat(prediction.fixtureId, ":"), err_1);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("\u2705 Settlement complete: ".concat(settlements.length, " predictions settled"));
                    return [2 /*return*/, settlements];
                case 9:
                    err_2 = _a.sent();
                    console.error('❌ Error in settlement process:', err_2);
                    throw err_2;
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Settle a specific prediction by fixture ID
 */
function settlePredictionByFixture(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var prediction, fixture, actualResult, isWin, profit, settlement, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, Prediction_js_1.Prediction.findOne({ fixtureId: fixtureId })];
                case 1:
                    prediction = _a.sent();
                    if (!prediction) {
                        console.log("\u2139\uFE0F No prediction found for fixture ".concat(fixtureId));
                        return [2 /*return*/, null];
                    }
                    if (prediction.result && prediction.result !== 'pending') {
                        console.log("\u2139\uFE0F Prediction for fixture ".concat(fixtureId, " already settled (").concat(prediction.result, ")"));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: fixtureId }).lean()];
                case 2:
                    fixture = _a.sent();
                    if (!fixture || fixture.status !== 'finished') {
                        console.log("\u2139\uFE0F Fixture ".concat(fixtureId, " not finished yet (status: ").concat((fixture === null || fixture === void 0 ? void 0 : fixture.status) || 'unknown', ")"));
                        return [2 /*return*/, null];
                    }
                    actualResult = buildResultFromFixture(fixture);
                    if (!actualResult) {
                        console.warn("\u26A0\uFE0F Could not build result for fixture ".concat(fixtureId));
                        return [2 /*return*/, null];
                    }
                    isWin = checkPredictionResult(prediction, actualResult);
                    profit = isWin
                        ? (prediction.odds - 1) * STAKE_PER_BET
                        : -STAKE_PER_BET;
                    prediction.result = isWin ? 'win' : 'loss';
                    prediction.profit = profit;
                    return [4 /*yield*/, prediction.save()];
                case 3:
                    _a.sent();
                    settlement = {
                        fixtureId: fixtureId,
                        match: "".concat(prediction.homeTeam, " vs ").concat(prediction.awayTeam),
                        prediction: prediction.prediction,
                        result: prediction.result,
                        profit: profit,
                        odds: prediction.odds,
                    };
                    console.log("\u2705 Settled single fixture ".concat(fixtureId, ": ").concat(settlement.result.toUpperCase()));
                    return [2 /*return*/, settlement];
                case 4:
                    err_3 = _a.sent();
                    console.error("\u274C Error settling prediction for fixture ".concat(fixtureId, ":"), err_3);
                    throw err_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Summary stats for Golden Bets – used by /api/stats
 */
function getSettlementStats() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, total, settled, pending, wins, losses, winRate;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        Prediction_js_1.Prediction.countDocuments({ isGoldenBet: true }),
                        Prediction_js_1.Prediction.countDocuments({
                            isGoldenBet: true,
                            result: { $in: ['win', 'loss'] },
                        }),
                        Prediction_js_1.Prediction.countDocuments({ isGoldenBet: true, result: 'pending' }),
                        Prediction_js_1.Prediction.countDocuments({ isGoldenBet: true, result: 'win' }),
                        Prediction_js_1.Prediction.countDocuments({ isGoldenBet: true, result: 'loss' }),
                    ])];
                case 1:
                    _a = _b.sent(), total = _a[0], settled = _a[1], pending = _a[2], wins = _a[3], losses = _a[4];
                    winRate = settled > 0 ? (wins / settled) * 100 : 0;
                    return [2 /*return*/, {
                            total: total,
                            settled: settled,
                            pending: pending,
                            wins: wins,
                            losses: losses,
                            winRate: parseFloat(winRate.toFixed(2)),
                        }];
            }
        });
    });
}
