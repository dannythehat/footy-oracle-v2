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
exports.findBetBuilders = findBetBuilders;
exports.saveBetBuilders = saveBetBuilders;
exports.getTodaysBetBuilders = getTodaysBetBuilders;
exports.getBetBuildersByDate = getBetBuildersByDate;
exports.getHistoricalBetBuilders = getHistoricalBetBuilders;
var BetBuilder_js_1 = require("../models/BetBuilder.js");
var betBuilder_js_1 = require("../config/betBuilder.js");
/**
 * Calculate combined confidence from multiple markets
 * Uses weighted average based on individual confidences
 */
function calculateCombinedConfidence(markets) {
    if (markets.length === 0)
        return 0;
    // Simple average for now - can be enhanced with weighted formula
    var sum = markets.reduce(function (acc, m) { return acc + m.confidence; }, 0);
    return Math.round(sum / markets.length);
}
/**
 * Calculate combined odds by multiplying individual market odds
 */
function calculateCombinedOdds(markets) {
    if (markets.length === 0)
        return 1;
    var combined = markets.reduce(function (acc, m) { return acc * m.estimatedOdds; }, 1);
    return Math.round(combined * 100) / 100; // Round to 2 decimals
}
/**
 * Find bet builders from fixture predictions
 *
 * @param predictions - Array of fixture predictions from ML output
 * @returns Array of bet builder candidates sorted by combined confidence
 */
function findBetBuilders(predictions) {
    var betBuilders = [];
    for (var _i = 0, predictions_1 = predictions; _i < predictions_1.length; _i++) {
        var fixture = predictions_1[_i];
        // Filter: Only top-tier leagues
        if (!(0, betBuilder_js_1.isLeagueSupported)(fixture.league)) {
            continue;
        }
        // Check each market for high confidence
        var highConfidenceMarkets = [];
        // Check BTTS
        if (fixture.predictions.btts) {
            var _a = fixture.predictions.btts, yes_probability = _a.yes_probability, confidence = _a.confidence;
            if (confidence >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
                yes_probability >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_PROBABILITY) {
                highConfidenceMarkets.push({
                    market: 'btts',
                    marketName: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_NAMES.btts,
                    confidence: confidence,
                    probability: yes_probability,
                    estimatedOdds: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_ODDS.btts,
                });
            }
        }
        // Check Over 2.5 Goals
        if (fixture.predictions.over_2_5_goals) {
            var _b = fixture.predictions.over_2_5_goals, over_probability = _b.over_probability, confidence = _b.confidence;
            if (confidence >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
                over_probability >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_PROBABILITY) {
                highConfidenceMarkets.push({
                    market: 'over_2_5_goals',
                    marketName: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_NAMES.over_2_5_goals,
                    confidence: confidence,
                    probability: over_probability,
                    estimatedOdds: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_ODDS.over_2_5_goals,
                });
            }
        }
        // Check Over 9.5 Corners
        if (fixture.predictions.over_9_5_corners) {
            var _c = fixture.predictions.over_9_5_corners, over_probability = _c.over_probability, confidence = _c.confidence;
            if (confidence >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
                over_probability >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_PROBABILITY) {
                highConfidenceMarkets.push({
                    market: 'over_9_5_corners',
                    marketName: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_NAMES.over_9_5_corners,
                    confidence: confidence,
                    probability: over_probability,
                    estimatedOdds: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_ODDS.over_9_5_corners,
                });
            }
        }
        // Check Over 3.5 Cards
        if (fixture.predictions.over_3_5_cards) {
            var _d = fixture.predictions.over_3_5_cards, over_probability = _d.over_probability, confidence = _d.confidence;
            if (confidence >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_CONFIDENCE &&
                over_probability >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_PROBABILITY) {
                highConfidenceMarkets.push({
                    market: 'over_3_5_cards',
                    marketName: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_NAMES.over_3_5_cards,
                    confidence: confidence,
                    probability: over_probability,
                    estimatedOdds: betBuilder_js_1.BET_BUILDER_CONFIG.MARKET_ODDS.over_3_5_cards,
                });
            }
        }
        // Bet Builder requires minimum number of markets
        if (highConfidenceMarkets.length >= betBuilder_js_1.BET_BUILDER_CONFIG.MIN_MARKETS) {
            var combinedConfidence = calculateCombinedConfidence(highConfidenceMarkets);
            var estimatedCombinedOdds = calculateCombinedOdds(highConfidenceMarkets);
            betBuilders.push({
                fixture: fixture,
                markets: highConfidenceMarkets,
                combinedConfidence: combinedConfidence,
                estimatedCombinedOdds: estimatedCombinedOdds,
            });
        }
    }
    // Sort by combined confidence (highest first)
    betBuilders.sort(function (a, b) { return b.combinedConfidence - a.combinedConfidence; });
    // Return top N bet builders
    return betBuilders.slice(0, betBuilder_js_1.BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS);
}
/**
 * Save bet builders to database
 *
 * @param candidates - Bet builder candidates to save
 * @param aiReasoningMap - Optional map of fixture IDs to AI reasoning
 * @returns Array of saved bet builder documents
 */
function saveBetBuilders(candidates, aiReasoningMap) {
    return __awaiter(this, void 0, void 0, function () {
        var savedBuilders, _i, candidates_1, candidate, fixture, markets, combinedConfidence, estimatedCombinedOdds, existing, betBuilder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    savedBuilders = [];
                    _i = 0, candidates_1 = candidates;
                    _a.label = 1;
                case 1:
                    if (!(_i < candidates_1.length)) return [3 /*break*/, 7];
                    candidate = candidates_1[_i];
                    fixture = candidate.fixture, markets = candidate.markets, combinedConfidence = candidate.combinedConfidence, estimatedCombinedOdds = candidate.estimatedCombinedOdds;
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.findOne({ fixtureId: fixture.fixture_id })];
                case 2:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 4];
                    // Update existing
                    existing.markets = markets;
                    existing.combinedConfidence = combinedConfidence;
                    existing.estimatedCombinedOdds = estimatedCombinedOdds;
                    if (aiReasoningMap === null || aiReasoningMap === void 0 ? void 0 : aiReasoningMap.has(fixture.fixture_id)) {
                        existing.aiReasoning = aiReasoningMap.get(fixture.fixture_id);
                    }
                    return [4 /*yield*/, existing.save()];
                case 3:
                    _a.sent();
                    savedBuilders.push(existing);
                    return [3 /*break*/, 6];
                case 4:
                    betBuilder = new BetBuilder_js_1.BetBuilder({
                        fixtureId: fixture.fixture_id,
                        date: new Date(fixture.kickoff),
                        homeTeam: fixture.home_team,
                        awayTeam: fixture.away_team,
                        league: fixture.league,
                        kickoff: new Date(fixture.kickoff),
                        markets: markets,
                        combinedConfidence: combinedConfidence,
                        estimatedCombinedOdds: estimatedCombinedOdds,
                        aiReasoning: aiReasoningMap === null || aiReasoningMap === void 0 ? void 0 : aiReasoningMap.get(fixture.fixture_id),
                    });
                    return [4 /*yield*/, betBuilder.save()];
                case 5:
                    _a.sent();
                    savedBuilders.push(betBuilder);
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, savedBuilders];
            }
        });
    });
}
/**
 * Get today's bet builders from database
 */
function getTodaysBetBuilders() {
    return __awaiter(this, void 0, void 0, function () {
        var today, tomorrow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.find({
                            date: { $gte: today, $lt: tomorrow },
                        })
                            .sort({ combinedConfidence: -1 })
                            .limit(betBuilder_js_1.BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get bet builders for a specific date
 */
function getBetBuildersByDate(date) {
    return __awaiter(this, void 0, void 0, function () {
        var startOfDay, endOfDay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startOfDay = new Date(date);
                    startOfDay.setHours(0, 0, 0, 0);
                    endOfDay = new Date(startOfDay);
                    endOfDay.setDate(endOfDay.getDate() + 1);
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.find({
                            date: { $gte: startOfDay, $lt: endOfDay },
                        })
                            .sort({ combinedConfidence: -1 })
                            .limit(betBuilder_js_1.BET_BUILDER_CONFIG.MAX_DAILY_BUILDERS)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Get historical bet builders with pagination
 */
function getHistoricalBetBuilders(startDate_1, endDate_1) {
    return __awaiter(this, arguments, void 0, function (startDate, endDate, page, limit) {
        var query, skip, _a, builders, total;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = {};
                    if (startDate || endDate) {
                        query.date = {};
                        if (startDate)
                            query.date.$gte = startDate;
                        if (endDate)
                            query.date.$lte = endDate;
                    }
                    skip = (page - 1) * limit;
                    return [4 /*yield*/, Promise.all([
                            BetBuilder_js_1.BetBuilder.find(query)
                                .sort({ date: -1, combinedConfidence: -1 })
                                .skip(skip)
                                .limit(limit),
                            BetBuilder_js_1.BetBuilder.countDocuments(query),
                        ])];
                case 1:
                    _a = _b.sent(), builders = _a[0], total = _a[1];
                    return [2 /*return*/, {
                            builders: builders,
                            total: total,
                            pages: Math.ceil(total / limit),
                        }];
            }
        });
    });
}
