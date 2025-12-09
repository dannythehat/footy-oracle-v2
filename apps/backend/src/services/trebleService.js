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
exports.getTodaysTreble = getTodaysTreble;
exports.getHistoricalTrebles = getHistoricalTrebles;
exports.getTrebleStats = getTrebleStats;
var Prediction_js_1 = require("../models/Prediction.js");
var TREBLE_STAKE = 10; // £10 per treble
/**
 * Get today's treble from top 3 Golden Bets
 */
function getTodaysTreble() {
    return __awaiter(this, void 0, void 0, function () {
        var today, tomorrow, goldenBets, bets, trebleOdds, potentialReturn, potentialProfit, allSettled, allWon, anyLost, status_1, actualReturn, actualProfit, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, Prediction_js_1.Prediction.find({
                            isGoldenBet: true,
                            date: { $gte: today, $lt: tomorrow },
                        })
                            .sort({ confidence: -1 })
                            .limit(3)];
                case 1:
                    goldenBets = _a.sent();
                    if (goldenBets.length < 3) {
                        console.log("\u26A0\uFE0F  Only ".concat(goldenBets.length, " Golden Bets available for treble"));
                        return [2 /*return*/, null];
                    }
                    bets = goldenBets.map(function (bet) { return ({
                        fixtureId: bet.fixtureId,
                        match: "".concat(bet.homeTeam, " vs ").concat(bet.awayTeam),
                        homeTeam: bet.homeTeam,
                        awayTeam: bet.awayTeam,
                        prediction: bet.prediction,
                        market: bet.market,
                        odds: bet.odds,
                        confidence: bet.confidence,
                        aiReasoning: bet.aiReasoning,
                        result: bet.result,
                    }); });
                    trebleOdds = bets.reduce(function (acc, bet) { return acc * bet.odds; }, 1);
                    potentialReturn = TREBLE_STAKE * trebleOdds;
                    potentialProfit = potentialReturn - TREBLE_STAKE;
                    allSettled = bets.every(function (bet) { return bet.result !== 'pending'; });
                    allWon = bets.every(function (bet) { return bet.result === 'win'; });
                    anyLost = bets.some(function (bet) { return bet.result === 'loss'; });
                    status_1 = 'pending';
                    actualReturn = 0;
                    actualProfit = 0;
                    if (allSettled) {
                        if (allWon) {
                            status_1 = 'won';
                            actualReturn = potentialReturn;
                            actualProfit = potentialProfit;
                        }
                        else if (anyLost) {
                            status_1 = 'lost';
                            actualReturn = 0;
                            actualProfit = -TREBLE_STAKE;
                        }
                    }
                    return [2 /*return*/, {
                            date: today.toISOString().split('T')[0],
                            bets: bets,
                            trebleOdds: parseFloat(trebleOdds.toFixed(2)),
                            stake: TREBLE_STAKE,
                            potentialReturn: parseFloat(potentialReturn.toFixed(2)),
                            potentialProfit: parseFloat(potentialProfit.toFixed(2)),
                            status: status_1,
                            actualReturn: actualReturn > 0 ? parseFloat(actualReturn.toFixed(2)) : undefined,
                            actualProfit: actualProfit !== 0 ? parseFloat(actualProfit.toFixed(2)) : undefined,
                        }];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error getting today\'s treble:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get historical trebles with date range
 */
function getHistoricalTrebles(startDate, endDate, status) {
    return __awaiter(this, void 0, void 0, function () {
        var query, predictions, treblesByDate, _i, predictions_1, pred, dateKey, dayBets, trebles, _a, _b, _c, date, bets, trebleBets, trebleOdds, potentialReturn, potentialProfit, allSettled, allWon, anyLost, trebleStatus, actualReturn, actualProfit, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    query = { isGoldenBet: true };
                    if (startDate || endDate) {
                        query.date = {};
                        if (startDate)
                            query.date.$gte = new Date(startDate);
                        if (endDate)
                            query.date.$lte = new Date(endDate);
                    }
                    return [4 /*yield*/, Prediction_js_1.Prediction.find(query).sort({ date: -1 })];
                case 1:
                    predictions = _d.sent();
                    treblesByDate = new Map();
                    for (_i = 0, predictions_1 = predictions; _i < predictions_1.length; _i++) {
                        pred = predictions_1[_i];
                        dateKey = pred.date.toISOString().split('T')[0];
                        if (!treblesByDate.has(dateKey)) {
                            treblesByDate.set(dateKey, []);
                        }
                        dayBets = treblesByDate.get(dateKey);
                        if (dayBets.length < 3) {
                            dayBets.push(pred);
                        }
                    }
                    trebles = [];
                    for (_a = 0, _b = treblesByDate.entries(); _a < _b.length; _a++) {
                        _c = _b[_a], date = _c[0], bets = _c[1];
                        if (bets.length !== 3)
                            continue; // Skip incomplete trebles
                        trebleBets = bets.map(function (bet) { return ({
                            fixtureId: bet.fixtureId,
                            match: "".concat(bet.homeTeam, " vs ").concat(bet.awayTeam),
                            homeTeam: bet.homeTeam,
                            awayTeam: bet.awayTeam,
                            prediction: bet.prediction,
                            market: bet.market,
                            odds: bet.odds,
                            confidence: bet.confidence,
                            aiReasoning: bet.aiReasoning,
                            result: bet.result,
                        }); });
                        trebleOdds = trebleBets.reduce(function (acc, bet) { return acc * bet.odds; }, 1);
                        potentialReturn = TREBLE_STAKE * trebleOdds;
                        potentialProfit = potentialReturn - TREBLE_STAKE;
                        allSettled = trebleBets.every(function (bet) { return bet.result !== 'pending'; });
                        allWon = trebleBets.every(function (bet) { return bet.result === 'win'; });
                        anyLost = trebleBets.some(function (bet) { return bet.result === 'loss'; });
                        trebleStatus = 'pending';
                        actualReturn = 0;
                        actualProfit = 0;
                        if (allSettled) {
                            if (allWon) {
                                trebleStatus = 'won';
                                actualReturn = potentialReturn;
                                actualProfit = potentialProfit;
                            }
                            else if (anyLost) {
                                trebleStatus = 'lost';
                                actualReturn = 0;
                                actualProfit = -TREBLE_STAKE;
                            }
                        }
                        // Filter by status if specified
                        if (status && trebleStatus !== status) {
                            continue;
                        }
                        trebles.push({
                            date: date,
                            bets: trebleBets,
                            trebleOdds: parseFloat(trebleOdds.toFixed(2)),
                            stake: TREBLE_STAKE,
                            potentialReturn: parseFloat(potentialReturn.toFixed(2)),
                            potentialProfit: parseFloat(potentialProfit.toFixed(2)),
                            status: trebleStatus,
                            actualReturn: actualReturn > 0 ? parseFloat(actualReturn.toFixed(2)) : undefined,
                            actualProfit: actualProfit !== 0 ? parseFloat(actualProfit.toFixed(2)) : undefined,
                        });
                    }
                    return [2 /*return*/, trebles];
                case 2:
                    error_2 = _d.sent();
                    console.error('Error getting historical trebles:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get treble statistics
 */
function getTrebleStats() {
    return __awaiter(this, arguments, void 0, function (period) {
        var startDate, now, trebles, totalTrebles, wonTrebles, lostTrebles, pendingTrebles, totalProfit, totalStaked, winRate, roi, error_3;
        if (period === void 0) { period = 'all'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    startDate = void 0;
                    now = new Date();
                    switch (period) {
                        case 'daily':
                            startDate = new Date(now.setHours(0, 0, 0, 0));
                            break;
                        case 'weekly':
                            startDate = new Date(now.setDate(now.getDate() - 7));
                            break;
                        case 'monthly':
                            startDate = new Date(now.setMonth(now.getMonth() - 1));
                            break;
                    }
                    return [4 /*yield*/, getHistoricalTrebles(startDate === null || startDate === void 0 ? void 0 : startDate.toISOString().split('T')[0], undefined)];
                case 1:
                    trebles = _a.sent();
                    totalTrebles = trebles.length;
                    wonTrebles = trebles.filter(function (t) { return t.status === 'won'; }).length;
                    lostTrebles = trebles.filter(function (t) { return t.status === 'lost'; }).length;
                    pendingTrebles = trebles.filter(function (t) { return t.status === 'pending'; }).length;
                    totalProfit = trebles.reduce(function (sum, t) { return sum + (t.actualProfit || 0); }, 0);
                    totalStaked = (wonTrebles + lostTrebles) * TREBLE_STAKE;
                    winRate = (wonTrebles + lostTrebles) > 0
                        ? (wonTrebles / (wonTrebles + lostTrebles)) * 100
                        : 0;
                    roi = totalStaked > 0
                        ? (totalProfit / totalStaked) * 100
                        : 0;
                    return [2 /*return*/, {
                            period: period,
                            totalTrebles: totalTrebles,
                            wonTrebles: wonTrebles,
                            lostTrebles: lostTrebles,
                            pendingTrebles: pendingTrebles,
                            totalProfit: parseFloat(totalProfit.toFixed(2)),
                            totalStaked: parseFloat(totalStaked.toFixed(2)),
                            winRate: parseFloat(winRate.toFixed(2)),
                            roi: parseFloat(roi.toFixed(2)),
                            averageOdds: trebles.length > 0
                                ? parseFloat((trebles.reduce(function (sum, t) { return sum + t.trebleOdds; }, 0) / trebles.length).toFixed(2))
                                : 0,
                        }];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error getting treble stats:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
