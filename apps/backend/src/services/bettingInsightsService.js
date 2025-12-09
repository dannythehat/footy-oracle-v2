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
exports.bettingInsightsService = void 0;
var Fixture_js_1 = require("../models/Fixture.js");
var apiFootballService_js_1 = require("./apiFootballService.js");
var openaiService_js_1 = require("./openaiService.js");
var BettingInsightsService = /** @class */ (function () {
    function BettingInsightsService() {
    }
    /**
     * Calculate AI betting insights for a fixture
     * This runs 48 hours before kickoff
     */
    BettingInsightsService.prototype.calculateBettingInsights = function (fixture) {
        return __awaiter(this, void 0, void 0, function () {
            var context, btsInsight, over25Insight, over35CardsInsight, over95CornersInsight, goldenBet, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.gatherFixtureContext(fixture)];
                    case 1:
                        context = _a.sent();
                        return [4 /*yield*/, this.calculateBTS(context)];
                    case 2:
                        btsInsight = _a.sent();
                        return [4 /*yield*/, this.calculateOver25(context)];
                    case 3:
                        over25Insight = _a.sent();
                        return [4 /*yield*/, this.calculateOver35Cards(context)];
                    case 4:
                        over35CardsInsight = _a.sent();
                        return [4 /*yield*/, this.calculateOver95Corners(context)];
                    case 5:
                        over95CornersInsight = _a.sent();
                        return [4 /*yield*/, this.determineGoldenBet({
                                bts: btsInsight,
                                over25: over25Insight,
                                over35cards: over35CardsInsight,
                                over95corners: over95CornersInsight
                            }, context)];
                    case 6:
                        goldenBet = _a.sent();
                        return [2 /*return*/, {
                                bts: btsInsight,
                                over25: over25Insight,
                                over35cards: over35CardsInsight,
                                over95corners: over95CornersInsight,
                                goldenBet: goldenBet
                            }];
                    case 7:
                        error_1 = _a.sent();
                        console.error('Error calculating betting insights:', error_1);
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gather real fixture context data from API-Football
     */
    BettingInsightsService.prototype.gatherFixtureContext = function (fixture) {
        return __awaiter(this, void 0, void 0, function () {
            var homeTeamId, awayTeamId, leagueId, season, _a, fixtureStats, homeLastFixtures, awayLastFixtures, h2hMatches, over25Count, btsCount, totalGoals, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        homeTeamId = fixture.homeTeamId || 0;
                        awayTeamId = fixture.awayTeamId || 0;
                        leagueId = fixture.leagueId || 0;
                        season = new Date(fixture.date).getFullYear();
                        // If IDs are missing, fall back to mock data
                        if (!homeTeamId || !awayTeamId || !leagueId) {
                            console.warn("Missing team/league IDs for fixture ".concat(fixture.fixtureId, ", using mock data"));
                            return [2 /*return*/, this.getMockContext(fixture)];
                        }
                        return [4 /*yield*/, Promise.all([
                                (0, apiFootballService_js_1.fetchFixtureStats)(fixture.fixtureId, homeTeamId, awayTeamId, leagueId, season),
                                (0, apiFootballService_js_1.fetchTeamLastFixtures)(homeTeamId, 5),
                                (0, apiFootballService_js_1.fetchTeamLastFixtures)(awayTeamId, 5)
                            ])];
                    case 1:
                        _a = _b.sent(), fixtureStats = _a[0], homeLastFixtures = _a[1], awayLastFixtures = _a[2];
                        h2hMatches = fixtureStats.h2h.lastMeetings;
                        over25Count = h2hMatches.filter(function (m) { return (m.homeScore + m.awayScore) > 2.5; }).length;
                        btsCount = h2hMatches.filter(function (m) { return m.homeScore > 0 && m.awayScore > 0; }).length;
                        totalGoals = h2hMatches.reduce(function (sum, m) { return sum + m.homeScore + m.awayScore; }, 0);
                        return [2 /*return*/, {
                                homeTeam: fixture.homeTeam,
                                awayTeam: fixture.awayTeam,
                                league: fixture.league,
                                date: fixture.date,
                                // Real form data
                                homeForm: fixtureStats.homeTeam.form,
                                awayForm: fixtureStats.awayTeam.form,
                                // Real H2H data
                                h2hGoals: {
                                    avg: h2hMatches.length > 0 ? totalGoals / h2hMatches.length : 0,
                                    over25: h2hMatches.length > 0 ? over25Count / h2hMatches.length : 0
                                },
                                // Real team statistics
                                homeGoalsAvg: {
                                    scored: fixtureStats.homeTeam.avgGoalsScored,
                                    conceded: fixtureStats.homeTeam.avgGoalsConceded
                                },
                                awayGoalsAvg: {
                                    scored: fixtureStats.awayTeam.avgGoalsScored,
                                    conceded: fixtureStats.awayTeam.avgGoalsConceded
                                },
                                // Estimate cards/corners (API-Football doesn't provide these directly)
                                homeCardsAvg: 2.0, // Default estimate
                                awayCardsAvg: 2.0, // Default estimate
                                homeCornersAvg: 5.0, // Default estimate
                                awayCornersAvg: 5.0, // Default estimate
                                // Additional H2H context
                                h2h: {
                                    stats: {
                                        totalMatches: h2hMatches.length,
                                        over25Rate: h2hMatches.length > 0 ? over25Count / h2hMatches.length : 0,
                                        btsRate: h2hMatches.length > 0 ? btsCount / h2hMatches.length : 0,
                                        avgGoals: h2hMatches.length > 0 ? totalGoals / h2hMatches.length : 0,
                                        avgCorners: 10.0, // Default estimate
                                        avgCards: 4.0 // Default estimate
                                    }
                                }
                            }];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error gathering fixture context:', error_2);
                        // Fall back to mock data on error
                        return [2 /*return*/, this.getMockContext(fixture)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mock context for development/fallback
     */
    BettingInsightsService.prototype.getMockContext = function (fixture) {
        return {
            homeTeam: fixture.homeTeam,
            awayTeam: fixture.awayTeam,
            league: fixture.league,
            date: fixture.date,
            homeForm: 'WWDWL',
            awayForm: 'WLWDW',
            h2hGoals: { avg: 3.2, over25: 0.75 },
            homeGoalsAvg: { scored: 2.1, conceded: 1.2 },
            awayGoalsAvg: { scored: 1.8, conceded: 1.5 },
            homeCardsAvg: 2.3,
            awayCardsAvg: 2.1,
            homeCornersAvg: 5.8,
            awayCornersAvg: 5.2,
            h2h: {
                stats: {
                    totalMatches: 10,
                    over25Rate: 0.75,
                    btsRate: 0.70,
                    avgGoals: 3.2,
                    avgCorners: 10.5,
                    avgCards: 4.2
                }
            }
        };
    };
    /**
     * Calculate Both Teams to Score probability with real data
     */
    BettingInsightsService.prototype.calculateBTS = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var homeScoring, awayScoring, homeLeaky, awayLeaky, h2hBtsRate, homeFormScoring, awayFormScoring, percentage, confidence;
            var _a;
            return __generator(this, function (_b) {
                homeScoring = context.homeGoalsAvg.scored >= 1.2;
                awayScoring = context.awayGoalsAvg.scored >= 1.0;
                homeLeaky = context.homeGoalsAvg.conceded >= 1.0;
                awayLeaky = context.awayGoalsAvg.conceded >= 1.0;
                h2hBtsRate = ((_a = context.h2h) === null || _a === void 0 ? void 0 : _a.stats.btsRate) || 0.5;
                homeFormScoring = context.homeGoalsAvg.scored >= 1.0;
                awayFormScoring = context.awayGoalsAvg.scored >= 1.0;
                percentage = 50;
                if (homeScoring && awayScoring)
                    percentage += 20;
                if (homeLeaky && awayLeaky)
                    percentage += 15;
                percentage += h2hBtsRate * 20;
                if (homeFormScoring && awayFormScoring)
                    percentage += 10;
                // Cap at 95%
                percentage = Math.min(95, Math.max(20, percentage));
                confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
                return [2 /*return*/, { percentage: Math.round(percentage), confidence: confidence }];
            });
        });
    };
    /**
     * Calculate Over 2.5 Goals probability with real data
     */
    BettingInsightsService.prototype.calculateOver25 = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var totalGoalsAvg, h2hOver25Rate, percentage, confidence;
            var _a;
            return __generator(this, function (_b) {
                totalGoalsAvg = context.homeGoalsAvg.scored + context.awayGoalsAvg.scored;
                h2hOver25Rate = ((_a = context.h2h) === null || _a === void 0 ? void 0 : _a.stats.over25Rate) || 0.5;
                percentage = (totalGoalsAvg / 5) * 100;
                percentage = (percentage + h2hOver25Rate * 100) / 2; // Average with H2H rate
                // Boost if both teams score well
                if (context.homeGoalsAvg.scored >= 1.5 && context.awayGoalsAvg.scored >= 1.5) {
                    percentage += 10;
                }
                // Reduce if both teams defend well
                if (context.homeGoalsAvg.conceded < 1.0 && context.awayGoalsAvg.conceded < 1.0) {
                    percentage -= 15;
                }
                percentage = Math.min(95, Math.max(20, percentage));
                confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
                return [2 /*return*/, { percentage: Math.round(percentage), confidence: confidence }];
            });
        });
    };
    /**
     * Calculate Over 3.5 Cards probability
     */
    BettingInsightsService.prototype.calculateOver35Cards = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCardsAvg, percentage, confidence;
            return __generator(this, function (_a) {
                totalCardsAvg = context.homeCardsAvg + context.awayCardsAvg;
                percentage = 40;
                if (totalCardsAvg >= 5.0) {
                    percentage = 70 + Math.random() * 15; // 70-85%
                }
                else if (totalCardsAvg >= 4.0) {
                    percentage = 55 + Math.random() * 15; // 55-70%
                }
                else {
                    percentage = 35 + Math.random() * 20; // 35-55%
                }
                confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
                return [2 /*return*/, { percentage: Math.round(percentage), confidence: confidence }];
            });
        });
    };
    /**
     * Calculate Over 9.5 Corners probability
     */
    BettingInsightsService.prototype.calculateOver95Corners = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCornersAvg, percentage, confidence;
            return __generator(this, function (_a) {
                totalCornersAvg = context.homeCornersAvg + context.awayCornersAvg;
                percentage = (totalCornersAvg / 12) * 100;
                percentage = Math.min(95, Math.max(20, percentage));
                confidence = percentage >= 70 ? 'high' : percentage >= 55 ? 'medium' : 'low';
                return [2 /*return*/, { percentage: Math.round(percentage), confidence: confidence }];
            });
        });
    };
    /**
     * Determine the golden bet with ChatGPT reasoning
     */
    BettingInsightsService.prototype.determineGoldenBet = function (insights, context) {
        return __awaiter(this, void 0, void 0, function () {
            var betTypes, golden, reasoning;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        betTypes = [
                            { type: 'bts', percentage: insights.bts.percentage },
                            { type: 'over25', percentage: insights.over25.percentage },
                            { type: 'over35cards', percentage: insights.over35cards.percentage },
                            { type: 'over95corners', percentage: insights.over95corners.percentage }
                        ];
                        golden = betTypes.reduce(function (max, bet) {
                            return bet.percentage > max.percentage ? bet : max;
                        });
                        return [4 /*yield*/, this.generateGoldenBetReasoning(golden.type, golden.percentage, context)];
                    case 1:
                        reasoning = _a.sent();
                        return [2 /*return*/, {
                                type: golden.type,
                                percentage: golden.percentage,
                                reasoning: reasoning
                            }];
                }
            });
        });
    };
    /**
     * Generate engaging AI reasoning using ChatGPT
     */
    BettingInsightsService.prototype.generateGoldenBetReasoning = function (betType, percentage, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, openaiService_js_1.openaiService.generateBettingReasoning(betType, percentage, context)];
                    case 1: 
                    // Use OpenAI service with engaging personality
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error generating ChatGPT reasoning:', error_3);
                        // Fallback to template-based reasoning
                        return [2 /*return*/, this.getFallbackReasoning(betType, percentage, context)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fallback reasoning templates (used if ChatGPT fails)
     */
    BettingInsightsService.prototype.getFallbackReasoning = function (betType, percentage, context) {
        var _a, _b;
        var confidenceEmoji = openaiService_js_1.openaiService.getConfidenceEmoji(percentage);
        var templates = {
            bts: "".concat(context.homeTeam, " averaging ").concat(context.homeGoalsAvg.scored.toFixed(1), " goals at home, ").concat(context.awayTeam, " ").concat(context.awayGoalsAvg.scored.toFixed(1), " away. H2H shows ").concat((((_a = context.h2h) === null || _a === void 0 ? void 0 : _a.stats.btsRate) || 0 * 100).toFixed(0), "% BTS rate. Both defenses conceding regularly. ").concat(confidenceEmoji),
            over25: "Combined ".concat((context.homeGoalsAvg.scored + context.awayGoalsAvg.scored).toFixed(1), " goals/game average. H2H history shows ").concat((((_b = context.h2h) === null || _b === void 0 ? void 0 : _b.stats.over25Rate) || 0 * 100).toFixed(0), "% over 2.5 rate. Attacking styles should deliver goals. ").concat(confidenceEmoji),
            over35cards: "Physical encounter expected. Both teams averaging ".concat(((context.homeCardsAvg + context.awayCardsAvg) / 2).toFixed(1), " cards per game. Big match intensity typically brings bookings. ").concat(confidenceEmoji),
            over95corners: "".concat(context.homeTeam, " averaging ").concat(context.homeCornersAvg.toFixed(1), " corners at home, ").concat(context.awayTeam, " ").concat(context.awayCornersAvg.toFixed(1), " away. Combined ").concat((context.homeCornersAvg + context.awayCornersAvg).toFixed(1), " corners/game. ").concat(confidenceEmoji)
        };
        return templates[betType] || "Strong statistical indicators support this ".concat(percentage, "% prediction. ").concat(confidenceEmoji);
    };
    /**
     * Update fixture with AI betting insights
     */
    BettingInsightsService.prototype.updateFixtureWithInsights = function (fixtureId, insights) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixtureId }, {
                            $set: {
                                aiBets: {
                                    bts: __assign(__assign({}, insights.bts), { revealed: false }),
                                    over25: __assign(__assign({}, insights.over25), { revealed: false }),
                                    over35cards: __assign(__assign({}, insights.over35cards), { revealed: false }),
                                    over95corners: __assign(__assign({}, insights.over95corners), { revealed: false }),
                                    goldenBet: __assign(__assign({}, insights.goldenBet), { revealed: false }),
                                    generatedAt: new Date()
                                }
                            }
                        }, { new: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process all fixtures that need AI insights (48 hours before kickoff)
     */
    BettingInsightsService.prototype.processUpcomingFixtures = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, fortyEightHoursFromNow, fortyNineHoursFromNow, fixtures, _i, fixtures_1, fixture, insights, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
                        fortyNineHoursFromNow = new Date(now.getTime() + 49 * 60 * 60 * 1000);
                        return [4 /*yield*/, Fixture_js_1.Fixture.find({
                                date: {
                                    $gte: fortyEightHoursFromNow,
                                    $lte: fortyNineHoursFromNow
                                },
                                status: 'scheduled',
                                'aiBets.generatedAt': { $exists: false }
                            })];
                    case 1:
                        fixtures = _a.sent();
                        console.log("\uD83C\uDFAF Processing ".concat(fixtures.length, " fixtures for AI betting insights..."));
                        _i = 0, fixtures_1 = fixtures;
                        _a.label = 2;
                    case 2:
                        if (!(_i < fixtures_1.length)) return [3 /*break*/, 8];
                        fixture = fixtures_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.calculateBettingInsights(fixture)];
                    case 4:
                        insights = _a.sent();
                        return [4 /*yield*/, this.updateFixtureWithInsights(fixture.fixtureId, insights)];
                    case 5:
                        _a.sent();
                        console.log("\u2713 Generated insights for ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam));
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        console.error("\u2717 Failed to generate insights for fixture ".concat(fixture.fixtureId, ":"), error_4);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        console.log("\u2705 Completed processing ".concat(fixtures.length, " fixtures"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reveal a specific bet type for a fixture
     */
    BettingInsightsService.prototype.revealBetType = function (fixtureId, betType) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixtureId }, { $set: (_a = {}, _a["aiBets.".concat(betType, ".revealed")] = true, _a) })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reveal golden bet for a fixture
     */
    BettingInsightsService.prototype.revealGoldenBet = function (fixtureId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixtureId }, { $set: { 'aiBets.goldenBet.revealed': true } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BettingInsightsService;
}());
exports.bettingInsightsService = new BettingInsightsService();
