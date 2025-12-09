"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Prediction_js_1 = require("../models/Prediction.js");
var trebleService_js_1 = require("../services/trebleService.js");
var resultSettlementService_js_1 = require("../services/resultSettlementService.js");
var router = (0, express_1.Router)();
// Get P&L statistics for Golden Bets
router.get('/pnl', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, dateFilter, now, today, weekAgo, monthAgo, yearAgo, predictions, stats, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query.period, period = _a === void 0 ? 'all' : _a;
                dateFilter = {};
                now = new Date();
                switch (period) {
                    case 'daily':
                        today = new Date(now.setHours(0, 0, 0, 0));
                        dateFilter = { date: { $gte: today } };
                        break;
                    case 'weekly':
                        weekAgo = new Date(now.setDate(now.getDate() - 7));
                        dateFilter = { date: { $gte: weekAgo } };
                        break;
                    case 'monthly':
                        monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                        dateFilter = { date: { $gte: monthAgo } };
                        break;
                    case 'yearly':
                        yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
                        dateFilter = { date: { $gte: yearAgo } };
                        break;
                }
                return [4 /*yield*/, Prediction_js_1.Prediction.find(__assign({ isGoldenBet: true, result: { $in: ['win', 'loss'] } }, dateFilter))];
            case 1:
                predictions = _b.sent();
                stats = {
                    totalBets: predictions.length,
                    wins: predictions.filter(function (p) { return p.result === 'win'; }).length,
                    losses: predictions.filter(function (p) { return p.result === 'loss'; }).length,
                    totalProfit: predictions.reduce(function (sum, p) { return sum + (p.profit || 0); }, 0),
                    winRate: 0,
                    roi: 0,
                };
                stats.winRate = stats.totalBets > 0
                    ? (stats.wins / stats.totalBets) * 100
                    : 0;
                stats.roi = stats.totalBets > 0
                    ? (stats.totalProfit / (stats.totalBets * 10)) * 100
                    : 0;
                res.json({
                    success: true,
                    data: __assign(__assign({}, stats), { totalProfit: parseFloat(stats.totalProfit.toFixed(2)), winRate: parseFloat(stats.winRate.toFixed(2)), roi: parseFloat(stats.roi.toFixed(2)) }),
                    period: period,
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_1.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get today's treble calculator
router.get('/treble/today', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var treble, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, trebleService_js_1.getTodaysTreble)()];
            case 1:
                treble = _a.sent();
                if (!treble) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No treble available for today',
                        })];
                }
                res.json({
                    success: true,
                    data: treble,
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_2.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get treble statistics
router.get('/treble', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, stats, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query.period, period = _a === void 0 ? 'all' : _a;
                return [4 /*yield*/, (0, trebleService_js_1.getTrebleStats)(period)];
            case 1:
                stats = _b.sent();
                res.json({
                    success: true,
                    data: stats,
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_3.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get historical trebles
router.get('/treble/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, status_1, trebles, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate, status_1 = _a.status;
                return [4 /*yield*/, (0, trebleService_js_1.getHistoricalTrebles)(startDate, endDate, status_1)];
            case 1:
                trebles = _b.sent();
                res.json({
                    success: true,
                    data: trebles,
                    count: trebles.length,
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_4.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get overall statistics
router.get('/overview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalPredictions, goldenBets, pendingBets, winningBets, totalGoldenBetsSettled, winRate, settlementStats, trebleStats, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                return [4 /*yield*/, Promise.all([
                        Prediction_js_1.Prediction.countDocuments(),
                        Prediction_js_1.Prediction.countDocuments({ isGoldenBet: true }),
                        Prediction_js_1.Prediction.countDocuments({ result: 'pending' }),
                    ])];
            case 1:
                _a = _b.sent(), totalPredictions = _a[0], goldenBets = _a[1], pendingBets = _a[2];
                return [4 /*yield*/, Prediction_js_1.Prediction.countDocuments({
                        isGoldenBet: true,
                        result: 'win'
                    })];
            case 2:
                winningBets = _b.sent();
                return [4 /*yield*/, Prediction_js_1.Prediction.countDocuments({
                        isGoldenBet: true,
                        result: { $in: ['win', 'loss'] },
                    })];
            case 3:
                totalGoldenBetsSettled = _b.sent();
                winRate = totalGoldenBetsSettled > 0
                    ? (winningBets / totalGoldenBetsSettled) * 100
                    : 0;
                return [4 /*yield*/, (0, resultSettlementService_js_1.getSettlementStats)()];
            case 4:
                settlementStats = _b.sent();
                return [4 /*yield*/, (0, trebleService_js_1.getTrebleStats)('all')];
            case 5:
                trebleStats = _b.sent();
                res.json({
                    success: true,
                    data: {
                        totalPredictions: totalPredictions,
                        goldenBets: goldenBets,
                        pendingBets: pendingBets,
                        winRate: parseFloat(winRate.toFixed(2)),
                        settlement: settlementStats,
                        trebles: {
                            total: trebleStats.totalTrebles,
                            won: trebleStats.wonTrebles,
                            lost: trebleStats.lostTrebles,
                            pending: trebleStats.pendingTrebles,
                            winRate: trebleStats.winRate,
                            totalProfit: trebleStats.totalProfit,
                        },
                    },
                });
                return [3 /*break*/, 7];
            case 6:
                error_5 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_5.message,
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Get performance by league
router.get('/by-league', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var predictions, leagueStats, leagueArray, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Prediction_js_1.Prediction.find({
                        isGoldenBet: true,
                        result: { $in: ['win', 'loss'] },
                    })];
            case 1:
                predictions = _a.sent();
                leagueStats = predictions.reduce(function (acc, pred) {
                    if (!acc[pred.league]) {
                        acc[pred.league] = {
                            league: pred.league,
                            totalBets: 0,
                            wins: 0,
                            losses: 0,
                            totalProfit: 0,
                        };
                    }
                    acc[pred.league].totalBets++;
                    if (pred.result === 'win')
                        acc[pred.league].wins++;
                    if (pred.result === 'loss')
                        acc[pred.league].losses++;
                    acc[pred.league].totalProfit += pred.profit || 0;
                    return acc;
                }, {});
                leagueArray = Object.values(leagueStats).map(function (stats) { return (__assign(__assign({}, stats), { winRate: parseFloat(((stats.wins / stats.totalBets) * 100).toFixed(2)), totalProfit: parseFloat(stats.totalProfit.toFixed(2)) })); }).sort(function (a, b) { return b.winRate - a.winRate; });
                res.json({
                    success: true,
                    data: leagueArray,
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_6.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get performance by market
router.get('/by-market', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var predictions, marketStats, marketArray, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Prediction_js_1.Prediction.find({
                        isGoldenBet: true,
                        result: { $in: ['win', 'loss'] },
                    })];
            case 1:
                predictions = _a.sent();
                marketStats = predictions.reduce(function (acc, pred) {
                    if (!acc[pred.market]) {
                        acc[pred.market] = {
                            market: pred.market,
                            totalBets: 0,
                            wins: 0,
                            losses: 0,
                            totalProfit: 0,
                        };
                    }
                    acc[pred.market].totalBets++;
                    if (pred.result === 'win')
                        acc[pred.market].wins++;
                    if (pred.result === 'loss')
                        acc[pred.market].losses++;
                    acc[pred.market].totalProfit += pred.profit || 0;
                    return acc;
                }, {});
                marketArray = Object.values(marketStats).map(function (stats) { return (__assign(__assign({}, stats), { winRate: parseFloat(((stats.wins / stats.totalBets) * 100).toFixed(2)), totalProfit: parseFloat(stats.totalProfit.toFixed(2)) })); }).sort(function (a, b) { return b.winRate - a.winRate; });
                res.json({
                    success: true,
                    data: marketArray,
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_7.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
