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
var Prediction_js_1 = require("../models/Prediction.js");
var router = (0, express_1.Router)();
// Get all predictions with advanced filters
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, date, startDate, endDate, league, market, minConfidence, maxConfidence, result, isGoldenBet, search, _b, sortBy, _c, sortOrder, _d, page, _e, limit, query, targetDate, nextDate, sortOptions, skip, _f, predictions, total, error_1;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 2, , 3]);
                _a = req.query, date = _a.date, startDate = _a.startDate, endDate = _a.endDate, league = _a.league, market = _a.market, minConfidence = _a.minConfidence, maxConfidence = _a.maxConfidence, result = _a.result, isGoldenBet = _a.isGoldenBet, search = _a.search, _b = _a.sortBy, sortBy = _b === void 0 ? 'confidence' : _b, _c = _a.sortOrder, sortOrder = _c === void 0 ? 'desc' : _c, _d = _a.page, page = _d === void 0 ? 1 : _d, _e = _a.limit, limit = _e === void 0 ? 20 : _e;
                query = {};
                // Date filters
                if (date) {
                    targetDate = new Date(date);
                    nextDate = new Date(targetDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    query.date = { $gte: targetDate, $lt: nextDate };
                }
                if (startDate || endDate) {
                    query.date = {};
                    if (startDate)
                        query.date.$gte = new Date(startDate);
                    if (endDate)
                        query.date.$lte = new Date(endDate);
                }
                // League filter
                if (league) {
                    query.league = league;
                }
                // Market filter
                if (market) {
                    query.market = market;
                }
                // Confidence range
                if (minConfidence || maxConfidence) {
                    query.confidence = {};
                    if (minConfidence)
                        query.confidence.$gte = Number(minConfidence);
                    if (maxConfidence)
                        query.confidence.$lte = Number(maxConfidence);
                }
                // Result filter
                if (result) {
                    query.result = result;
                }
                // Golden Bet filter
                if (isGoldenBet !== undefined) {
                    query.isGoldenBet = isGoldenBet === 'true';
                }
                // Search by team name
                if (search) {
                    query.$or = [
                        { homeTeam: { $regex: search, $options: 'i' } },
                        { awayTeam: { $regex: search, $options: 'i' } },
                    ];
                }
                sortOptions = {};
                sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
                skip = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, Promise.all([
                        Prediction_js_1.Prediction.find(query)
                            .sort(sortOptions)
                            .skip(skip)
                            .limit(Number(limit)),
                        Prediction_js_1.Prediction.countDocuments(query),
                    ])];
            case 1:
                _f = _g.sent(), predictions = _f[0], total = _f[1];
                res.json({
                    success: true,
                    data: predictions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                    filters: {
                        date: date,
                        startDate: startDate,
                        endDate: endDate,
                        league: league,
                        market: market,
                        minConfidence: minConfidence,
                        maxConfidence: maxConfidence,
                        result: result,
                        isGoldenBet: isGoldenBet,
                        search: search,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _g.sent();
                res.status(500).json({
                    success: false,
                    error: error_1.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get prediction by fixture ID
router.get('/fixture/:fixtureId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var predictions, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Prediction_js_1.Prediction.find({
                        fixtureId: Number(req.params.fixtureId)
                    })];
            case 1:
                predictions = _a.sent();
                res.json({
                    success: true,
                    data: predictions,
                    count: predictions.length,
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
// Get historical results with filters (for frontend history page)
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, league, market, result, _b, page, _c, limit, query, skip, _d, predictions, total, wins, losses, pending, totalProfit, error_3;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate, league = _a.league, market = _a.market, result = _a.result, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c;
                query = {
                    isGoldenBet: true, // Only show Golden Bets in history
                };
                // Date range
                if (startDate || endDate) {
                    query.date = {};
                    if (startDate)
                        query.date.$gte = new Date(startDate);
                    if (endDate)
                        query.date.$lte = new Date(endDate);
                }
                // Filters
                if (league)
                    query.league = league;
                if (market)
                    query.market = market;
                if (result)
                    query.result = result;
                skip = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, Promise.all([
                        Prediction_js_1.Prediction.find(query)
                            .sort({ date: -1 })
                            .skip(skip)
                            .limit(Number(limit)),
                        Prediction_js_1.Prediction.countDocuments(query),
                    ])];
            case 1:
                _d = _e.sent(), predictions = _d[0], total = _d[1];
                wins = predictions.filter(function (p) { return p.result === 'win'; }).length;
                losses = predictions.filter(function (p) { return p.result === 'loss'; }).length;
                pending = predictions.filter(function (p) { return p.result === 'pending'; }).length;
                totalProfit = predictions.reduce(function (sum, p) { return sum + (p.profit || 0); }, 0);
                res.json({
                    success: true,
                    data: predictions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                    summary: {
                        wins: wins,
                        losses: losses,
                        pending: pending,
                        totalProfit: parseFloat(totalProfit.toFixed(2)),
                        winRate: (wins + losses) > 0 ? parseFloat(((wins / (wins + losses)) * 100).toFixed(2)) : 0,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _e.sent();
                res.status(500).json({
                    success: false,
                    error: error_3.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get available leagues (for filter dropdown)
router.get('/leagues', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leagues, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Prediction_js_1.Prediction.distinct('league')];
            case 1:
                leagues = _a.sent();
                res.json({
                    success: true,
                    data: leagues.sort(),
                    count: leagues.length,
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_4.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get available markets (for filter dropdown)
router.get('/markets', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var markets, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Prediction_js_1.Prediction.distinct('market')];
            case 1:
                markets = _a.sent();
                res.json({
                    success: true,
                    data: markets.sort(),
                    count: markets.length,
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json({
                    success: false,
                    error: error_5.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
