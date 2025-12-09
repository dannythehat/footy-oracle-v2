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
exports.selectBetBuilderOfTheDay = selectBetBuilderOfTheDay;
exports.generateBetBuilderOfTheDayReasoning = generateBetBuilderOfTheDayReasoning;
exports.getBetBuilderOfTheDay = getBetBuilderOfTheDay;
var BetBuilder_js_1 = require("../models/BetBuilder.js");
var Fixture_js_1 = require("../models/Fixture.js");
var aiService_js_1 = require("./aiService.js");
var axios_1 = require("axios");
var ML_API_URL = process.env.ML_API_URL || 'https://football-ml-api.onrender.com';
var ML_API_TIMEOUT = 30000; // 30 seconds
/**
 * Format fixtures for ML API consumption
 */
function formatFixturesForML(fixtures) {
    return {
        matches: fixtures.map(function (f) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            return ({
                id: ((_a = f.fixtureId) === null || _a === void 0 ? void 0 : _a.toString()) || ((_b = f._id) === null || _b === void 0 ? void 0 : _b.toString()),
                home_team: f.homeTeam,
                away_team: f.awayTeam,
                date: f.date.toISOString(),
                league: f.league || 'Unknown',
                datetime: f.date.toISOString(),
                stats: {
                    home_goals_avg: ((_d = (_c = f.statistics) === null || _c === void 0 ? void 0 : _c.home) === null || _d === void 0 ? void 0 : _d.totalShots) ? f.statistics.home.totalShots / 10 : 1.5,
                    away_goals_avg: ((_f = (_e = f.statistics) === null || _e === void 0 ? void 0 : _e.away) === null || _f === void 0 ? void 0 : _f.totalShots) ? f.statistics.away.totalShots / 10 : 1.5,
                    home_cards_avg: (((_h = (_g = f.statistics) === null || _g === void 0 ? void 0 : _g.home) === null || _h === void 0 ? void 0 : _h.yellowCards) || 0) + (((_k = (_j = f.statistics) === null || _j === void 0 ? void 0 : _j.home) === null || _k === void 0 ? void 0 : _k.redCards) || 0) * 2,
                    away_cards_avg: (((_m = (_l = f.statistics) === null || _l === void 0 ? void 0 : _l.away) === null || _m === void 0 ? void 0 : _m.yellowCards) || 0) + (((_p = (_o = f.statistics) === null || _o === void 0 ? void 0 : _o.away) === null || _p === void 0 ? void 0 : _p.redCards) || 0) * 2,
                    home_corners_avg: ((_r = (_q = f.statistics) === null || _q === void 0 ? void 0 : _q.home) === null || _r === void 0 ? void 0 : _r.cornerKicks) || 5.0,
                    away_corners_avg: ((_t = (_s = f.statistics) === null || _s === void 0 ? void 0 : _s.away) === null || _t === void 0 ? void 0 : _t.cornerKicks) || 5.0
                },
                odds: {
                    btts: ((_u = f.odds) === null || _u === void 0 ? void 0 : _u.btts) || 1.70,
                    goals: ((_v = f.odds) === null || _v === void 0 ? void 0 : _v.over25) || 1.85,
                    corners: ((_w = f.odds) === null || _w === void 0 ? void 0 : _w.over95corners) || 1.95,
                    cards: ((_x = f.odds) === null || _x === void 0 ? void 0 : _x.over35cards) || 2.20
                }
            });
        })
    };
}
/**
 * Calculate a composite score for bet builder selection
 * Balances confidence and odds for optimal value
 *
 * Formula: (confidence * 0.6) + (normalized_odds * 0.4)
 * - Confidence weighted 60% (reliability)
 * - Odds weighted 40% (value)
 */
function calculateCompositeScore(betBuilder) {
    var confidence = betBuilder.combinedConfidence;
    // Normalize odds to 0-100 scale (odds 1-10 -> 0-100)
    // Higher odds = higher score, but capped at 10x
    var normalizedOdds = Math.min((betBuilder.estimatedCombinedOdds - 1) * 11.11, 100);
    // Weighted composite score
    var score = (confidence * 0.6) + (normalizedOdds * 0.4);
    return Math.round(score * 100) / 100;
}
/**
 * Get Bet Builder of the Day from ML API
 * Fetches today's fixtures and calls ML API for analysis
 */
function getBetBuilderFromMLAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var today, endOfDay, fixtures, payload, response, mlBetBuilder, markets, betBuilderData, betBuilder, reasoning, compositeScore, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    endOfDay = new Date(today);
                    endOfDay.setHours(23, 59, 59, 999);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: today, $lte: endOfDay },
                            status: { $in: ['scheduled', 'live'] }
                        })];
                case 1:
                    fixtures = _a.sent();
                    if (fixtures.length === 0) {
                        console.log('No fixtures available for Bet Builder of the Day');
                        return [2 /*return*/, { betBuilder: null, reasoning: null, compositeScore: null }];
                    }
                    console.log("\uD83C\uDFAF Calling ML API for Bet Builder (".concat(fixtures.length, " fixtures)..."));
                    payload = formatFixturesForML(fixtures);
                    return [4 /*yield*/, axios_1.default.post("".concat(ML_API_URL, "/api/v1/predictions/bet-builder-of-the-day"), payload, { timeout: ML_API_TIMEOUT })];
                case 2:
                    response = _a.sent();
                    if (!response.data || !response.data.bet_builder) {
                        console.log('⚠️ ML API returned no bet builder');
                        return [2 /*return*/, { betBuilder: null, reasoning: null, compositeScore: null }];
                    }
                    mlBetBuilder = response.data.bet_builder;
                    markets = mlBetBuilder.markets.map(function (m) { return ({
                        market: m.market,
                        marketName: m.prediction,
                        confidence: m.confidence,
                        probability: m.confidence / 100,
                        estimatedOdds: m.odds || 1.85
                    }); });
                    betBuilderData = {
                        fixtureId: parseInt(mlBetBuilder.match_id),
                        date: new Date(mlBetBuilder.datetime || today),
                        homeTeam: mlBetBuilder.home_team,
                        awayTeam: mlBetBuilder.away_team,
                        league: mlBetBuilder.league,
                        kickoff: new Date(mlBetBuilder.datetime || today),
                        markets: markets,
                        combinedConfidence: mlBetBuilder.combined_confidence,
                        estimatedCombinedOdds: mlBetBuilder.combined_odds || 1.0,
                        aiReasoning: mlBetBuilder.reasoning || ''
                    };
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.findOne({ fixtureId: betBuilderData.fixtureId })];
                case 3:
                    betBuilder = _a.sent();
                    if (!betBuilder) return [3 /*break*/, 5];
                    Object.assign(betBuilder, betBuilderData);
                    return [4 /*yield*/, betBuilder.save()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    betBuilder = new BetBuilder_js_1.BetBuilder(betBuilderData);
                    return [4 /*yield*/, betBuilder.save()];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [4 /*yield*/, generateBetBuilderOfTheDayReasoning(betBuilder)];
                case 8:
                    reasoning = _a.sent();
                    compositeScore = calculateCompositeScore(betBuilder);
                    console.log("\u2705 Got Bet Builder of the Day from ML API: ".concat(betBuilder.homeTeam, " vs ").concat(betBuilder.awayTeam));
                    return [2 /*return*/, {
                            betBuilder: betBuilder,
                            reasoning: reasoning,
                            compositeScore: compositeScore
                        }];
                case 9:
                    error_1 = _a.sent();
                    console.error('ML API error for Bet Builder:', error_1.message);
                    if (error_1.code === 'ECONNREFUSED' || error_1.code === 'ETIMEDOUT') {
                        console.warn('⚠️ ML API unavailable for Bet Builder');
                    }
                    return [2 /*return*/, { betBuilder: null, reasoning: null, compositeScore: null }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Select the Bet Builder of the Day from database (fallback)
 * Uses ML-driven composite scoring to find the optimal balance
 * between confidence and value
 *
 * @returns The best bet builder for today, or null if none available
 */
function selectBetBuilderOfTheDay() {
    return __awaiter(this, void 0, void 0, function () {
        var today, tomorrow, betBuilders, scoredBuilders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.find({
                            date: { $gte: today, $lt: tomorrow },
                        })];
                case 1:
                    betBuilders = _a.sent();
                    if (betBuilders.length === 0) {
                        return [2 /*return*/, null];
                    }
                    scoredBuilders = betBuilders.map(function (bb) { return ({
                        betBuilder: bb,
                        score: calculateCompositeScore(bb),
                    }); });
                    // Sort by composite score (highest first)
                    scoredBuilders.sort(function (a, b) { return b.score - a.score; });
                    // Return the top bet builder
                    return [2 /*return*/, scoredBuilders[0].betBuilder];
            }
        });
    });
}
/**
 * Generate enhanced AI reasoning for Bet Builder of the Day
 * Uses GPT-4o-latest for friendly, detailed, humorous analysis
 *
 * @param betBuilder - The selected bet builder
 * @returns Enhanced AI reasoning with confidence metrics
 */
function generateBetBuilderOfTheDayReasoning(betBuilder) {
    return __awaiter(this, void 0, void 0, function () {
        var reasonings, marketBreakdown, enhancedReasoning;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!betBuilder.aiReasoning || betBuilder.aiReasoning.length < 50)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, aiService_js_1.generateBulkReasoning)([
                            {
                                homeTeam: betBuilder.homeTeam,
                                awayTeam: betBuilder.awayTeam,
                                league: betBuilder.league,
                                market: 'Multi-Market Bet Builder',
                                prediction: "".concat(betBuilder.markets.map(function (m) { return m.marketName; }).join(' + ')),
                                odds: betBuilder.estimatedCombinedOdds,
                                confidence: betBuilder.combinedConfidence,
                            },
                        ])];
                case 1:
                    reasonings = _a.sent();
                    betBuilder.aiReasoning = reasonings[0];
                    return [4 /*yield*/, betBuilder.save()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    marketBreakdown = betBuilder.markets
                        .map(function (m) { return "".concat(m.marketName, ": ").concat(m.confidence, "%"); })
                        .join(', ');
                    enhancedReasoning = "\n\uD83C\uDFAF **BET BUILDER OF THE DAY** - ".concat(betBuilder.combinedConfidence, "% Confidence\n\n**Market Convergence:**\n").concat(marketBreakdown, "\n\n**Combined Odds:** ").concat(betBuilder.estimatedCombinedOdds.toFixed(2), "x\n**Potential Return:** \u20AC10 \u2192 \u20AC").concat((10 * betBuilder.estimatedCombinedOdds).toFixed(2), "\n\n**AI Analysis:**\n").concat(betBuilder.aiReasoning, "\n\n**Why This is Today's Top Pick:**\nThis bet builder represents the optimal balance between high confidence (").concat(betBuilder.combinedConfidence, "%) and strong value (").concat(betBuilder.estimatedCombinedOdds.toFixed(2), "x odds). Our ML models show exceptional convergence across ").concat(betBuilder.markets.length, " markets, indicating a rare high-probability, high-value opportunity.\n  ").trim();
                    return [2 /*return*/, enhancedReasoning];
            }
        });
    });
}
/**
 * Get or create today's Bet Builder of the Day
 * Tries ML API first, falls back to database if unavailable
 *
 * @returns Today's featured bet builder with enhanced reasoning
 */
function getBetBuilderOfTheDay() {
    return __awaiter(this, void 0, void 0, function () {
        var mlResult, betBuilder, reasoning, compositeScore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBetBuilderFromMLAPI()];
                case 1:
                    mlResult = _a.sent();
                    if (mlResult.betBuilder) {
                        return [2 /*return*/, mlResult];
                    }
                    // Fallback to database
                    console.log('⚠️ Falling back to database for Bet Builder of the Day');
                    return [4 /*yield*/, selectBetBuilderOfTheDay()];
                case 2:
                    betBuilder = _a.sent();
                    if (!betBuilder) {
                        return [2 /*return*/, {
                                betBuilder: null,
                                reasoning: null,
                                compositeScore: null,
                            }];
                    }
                    return [4 /*yield*/, generateBetBuilderOfTheDayReasoning(betBuilder)];
                case 3:
                    reasoning = _a.sent();
                    compositeScore = calculateCompositeScore(betBuilder);
                    return [2 /*return*/, {
                            betBuilder: betBuilder,
                            reasoning: reasoning,
                            compositeScore: compositeScore,
                        }];
            }
        });
    });
}
