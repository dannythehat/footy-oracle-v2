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
exports.startCronJobs = startCronJobs;
var node_cron_1 = require("node-cron");
var mlService_js_1 = require("./mlService.js");
var apiFootballService_js_1 = require("./apiFootballService.js");
var aiService_js_1 = require("./aiService.js");
var bettingInsightsService_js_1 = require("./bettingInsightsService.js");
var resultSettlementService_js_1 = require("./resultSettlementService.js");
var pnlTrackingService_js_1 = require("./pnlTrackingService.js");
var betBuilderService_js_1 = require("./betBuilderService.js");
var betBuilderOfTheDayService_js_1 = require("./betBuilderOfTheDayService.js");
var fixturesCron_js_1 = require("../cron/fixturesCron.js");
var liveScoresService_js_1 = require("./liveScoresService.js");
var Prediction_js_1 = require("../models/Prediction.js");
var Fixture_js_1 = require("../models/Fixture.js");
function startCronJobs() {
    var _this = this;
    var schedule = process.env.PREDICTION_CRON_SCHEDULE || '0 6 * * *';
    // Fixtures loading job (2am daily) - runs BEFORE predictions
    node_cron_1.default.schedule('0 2 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📥 Starting fixtures loading...');
                    return [4 /*yield*/, (0, fixturesCron_js_1.loadTodaysFixtures)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Daily prediction update job (6am)
    node_cron_1.default.schedule(schedule, function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔄 Starting daily prediction update...');
                    return [4 /*yield*/, updateDailyPredictions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // AI Betting Insights generation (5am daily)
    node_cron_1.default.schedule('0 5 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🎯 Starting AI betting insights generation...');
                    return [4 /*yield*/, generateBettingInsights()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Bet Builder generation (8am daily - after predictions at 6am)
    node_cron_1.default.schedule('0 8 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧠 Starting Bet Builder generation...');
                    return [4 /*yield*/, generateBetBuilders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Result settlement job (runs every 2 hours)
    node_cron_1.default.schedule('0 */2 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('⚖️  Starting result settlement...');
                    return [4 /*yield*/, settleResults()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // P&L sync job (runs daily at 7am, after predictions update)
    node_cron_1.default.schedule('0 7 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📊 Starting P&L sync...');
                    return [4 /*yield*/, syncPnL()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // 🔴 LIVE SCORES UPDATE - Every minute
    node_cron_1.default.schedule('* * * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, liveScoresService_js_1.updateLiveScores)()];
                case 1:
                    result = _a.sent();
                    if (result.total > 0) {
                        console.log("\uD83D\uDD34 Live scores updated: ".concat(result.updated, "/").concat(result.total, " fixtures"));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Error updating live scores:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // 🏁 RECENTLY FINISHED FIXTURES - Every 5 minutes
    node_cron_1.default.schedule('*/5 * * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, liveScoresService_js_1.updateRecentlyFinishedFixtures)()];
                case 1:
                    result = _a.sent();
                    if (result.total > 0) {
                        console.log("\uD83C\uDFC1 Recently finished fixtures updated: ".concat(result.updated, "/").concat(result.total));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Error updating recently finished fixtures:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    console.log("\u2705 Cron jobs scheduled:");
    console.log("   - Fixtures loading: 0 2 * * * (2am daily)");
    console.log("   - Daily predictions: ".concat(schedule));
    console.log("   - AI betting insights: 0 5 * * * (5am daily)");
    console.log("   - Bet Builder generation: 0 8 * * * (8am daily)");
    console.log("   - Result settlement: 0 */2 * * * (every 2 hours)");
    console.log("   - P&L sync: 0 7 * * * (7am daily)");
    console.log("   - \uD83D\uDD34 Live scores: * * * * * (every minute)");
    console.log("   - \uD83C\uDFC1 Recently finished: */5 * * * * (every 5 minutes)");
    // Load fixtures on startup
    console.log('🚀 Loading today\'s fixtures on startup...');
    (0, fixturesCron_js_1.loadTodaysFixtures)().catch(function (err) { return console.error('❌ Error loading fixtures on startup:', err); });
    // Start live scores update immediately
    console.log('🔴 Starting live scores update...');
    (0, liveScoresService_js_1.updateLiveScores)().catch(function (err) { return console.error('❌ Error updating live scores on startup:', err); });
}
function generateBetBuilders() {
    return __awaiter(this, void 0, void 0, function () {
        var mlPredictions, betBuilderCandidates, reasoningPromises, reasoningResults, reasoningMap, savedBuilders, _a, betBuilder, compositeScore, error_3;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    console.log('🤖 Loading ML predictions for Bet Builder analysis...');
                    return [4 /*yield*/, (0, mlService_js_1.loadMLPredictions)()];
                case 1:
                    mlPredictions = _b.sent();
                    if (!mlPredictions || mlPredictions.length === 0) {
                        console.log('⚠️  No ML predictions available for Bet Builder generation');
                        return [2 /*return*/];
                    }
                    // Find bet builder candidates
                    console.log('🔍 Analyzing fixtures for multi-market convergence...');
                    betBuilderCandidates = (0, betBuilderService_js_1.findBetBuilders)(mlPredictions);
                    if (betBuilderCandidates.length === 0) {
                        console.log('ℹ️  No bet builder opportunities found today');
                        return [2 /*return*/];
                    }
                    console.log("\u2705 Found ".concat(betBuilderCandidates.length, " bet builder opportunities"));
                    // Generate AI reasoning for bet builders
                    console.log('🧠 Generating AI reasoning for bet builders...');
                    reasoningPromises = betBuilderCandidates.map(function (candidate) { return __awaiter(_this, void 0, void 0, function () {
                        var reasonings;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, aiService_js_1.generateBulkReasoning)([
                                        {
                                            homeTeam: candidate.fixture.home_team,
                                            awayTeam: candidate.fixture.away_team,
                                            league: candidate.fixture.league,
                                            market: 'Multi-Market Bet Builder',
                                            prediction: candidate.markets.map(function (m) { return m.marketName; }).join(' + '),
                                            odds: candidate.estimatedCombinedOdds,
                                            confidence: candidate.combinedConfidence,
                                        },
                                    ])];
                                case 1:
                                    reasonings = _a.sent();
                                    return [2 /*return*/, { fixtureId: candidate.fixture.fixture_id, reasoning: reasonings[0] }];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(reasoningPromises)];
                case 2:
                    reasoningResults = _b.sent();
                    reasoningMap = new Map(reasoningResults.map(function (r) { return [r.fixtureId, r.reasoning]; }));
                    // Save bet builders to database
                    console.log('💾 Saving bet builders to database...');
                    return [4 /*yield*/, (0, betBuilderService_js_1.saveBetBuilders)(betBuilderCandidates, reasoningMap)];
                case 3:
                    savedBuilders = _b.sent();
                    console.log("\u2705 Saved ".concat(savedBuilders.length, " bet builders"));
                    // Select and log Bet Builder of the Day
                    console.log('🎯 Selecting Bet Builder of the Day...');
                    return [4 /*yield*/, (0, betBuilderOfTheDayService_js_1.getBetBuilderOfTheDay)()];
                case 4:
                    _a = _b.sent(), betBuilder = _a.betBuilder, compositeScore = _a.compositeScore;
                    if (betBuilder) {
                        console.log("\uD83C\uDFC6 BET BUILDER OF THE DAY:");
                        console.log("   ".concat(betBuilder.homeTeam, " vs ").concat(betBuilder.awayTeam));
                        console.log("   League: ".concat(betBuilder.league));
                        console.log("   Confidence: ".concat(betBuilder.combinedConfidence, "%"));
                        console.log("   Odds: ".concat(betBuilder.estimatedCombinedOdds.toFixed(2), "x"));
                        console.log("   Composite Score: ".concat(compositeScore === null || compositeScore === void 0 ? void 0 : compositeScore.toFixed(2)));
                        console.log("   Markets: ".concat(betBuilder.markets.map(function (m) { return m.marketName; }).join(', ')));
                    }
                    else {
                        console.log('ℹ️  No Bet Builder of the Day selected');
                    }
                    console.log('✅ Bet Builder generation completed');
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _b.sent();
                    console.error('❌ Error generating bet builders:', error_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function syncPnL() {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, pnlTrackingService_js_1.syncFeaturedSelections)()];
                case 1:
                    _a.sent();
                    console.log('✅ P&L sync completed - all featured selections tracked');
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('❌ Error syncing P&L:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function generateBettingInsights() {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🤖 Processing fixtures for AI betting insights (48 hours before kickoff)...');
                    return [4 /*yield*/, bettingInsightsService_js_1.bettingInsightsService.processUpcomingFixtures()];
                case 1:
                    _a.sent();
                    console.log('✅ AI betting insights generation completed');
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('❌ Error generating betting insights:', error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function settleResults() {
    return __awaiter(this, void 0, void 0, function () {
        var settlements, wins, losses, totalProfit, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, resultSettlementService_js_1.settlePendingPredictions)()];
                case 1:
                    settlements = _a.sent();
                    console.log("\u2705 Settled ".concat(settlements.length, " predictions"));
                    if (!(settlements.length > 0)) return [3 /*break*/, 3];
                    wins = settlements.filter(function (s) { return s.result === 'win'; }).length;
                    losses = settlements.filter(function (s) { return s.result === 'loss'; }).length;
                    totalProfit = settlements.reduce(function (sum, s) { return sum + s.profit; }, 0);
                    console.log("   - Wins: ".concat(wins, ", Losses: ").concat(losses));
                    console.log("   - Total P&L: \u00A3".concat(totalProfit.toFixed(2)));
                    // Trigger P&L sync after settlements
                    return [4 /*yield*/, syncPnL()];
                case 2:
                    // Trigger P&L sync after settlements
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.error('❌ Error settling results:', error_6);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateDailyPredictions() {
    return __awaiter(this, void 0, void 0, function () {
        var today, fixtures_2, _i, fixtures_1, fixture, mlPredictions, goldenBets, goldenBetsWithOdds, reasonings, i, bet, error_7;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 14, , 15]);
                    today = new Date().toISOString().split('T')[0];
                    // 1. Fetch today's fixtures from API-Football
                    console.log('📥 Fetching fixtures...');
                    return [4 /*yield*/, (0, apiFootballService_js_1.fetchFixtures)(today)];
                case 1:
                    fixtures_2 = _a.sent();
                    _i = 0, fixtures_1 = fixtures_2;
                    _a.label = 2;
                case 2:
                    if (!(_i < fixtures_1.length)) return [3 /*break*/, 5];
                    fixture = fixtures_1[_i];
                    return [4 /*yield*/, Fixture_js_1.Fixture.findOneAndUpdate({ fixtureId: fixture.fixtureId }, fixture, { upsert: true, new: true })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\u2705 Saved ".concat(fixtures_2.length, " fixtures"));
                    // 3. Load ML predictions
                    console.log('🤖 Loading ML predictions...');
                    return [4 /*yield*/, (0, mlService_js_1.loadMLPredictions)()];
                case 6:
                    mlPredictions = _a.sent();
                    goldenBets = (0, mlService_js_1.selectGoldenBets)(mlPredictions, 3);
                    console.log("\u2B50 Selected ".concat(goldenBets.length, " Golden Bets"));
                    return [4 /*yield*/, Promise.all(goldenBets.map(function (bet) { return __awaiter(_this, void 0, void 0, function () {
                            var odds, fixture;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, apiFootballService_js_1.fetchOdds)(bet.fixtureId)];
                                    case 1:
                                        odds = _a.sent();
                                        fixture = fixtures_2.find(function (f) { return f.fixtureId === bet.fixtureId; });
                                        return [2 /*return*/, __assign(__assign({}, bet), { odds: getOddsForMarket(odds, bet.market), date: (fixture === null || fixture === void 0 ? void 0 : fixture.date) || new Date().toISOString(), homeTeam: (fixture === null || fixture === void 0 ? void 0 : fixture.homeTeam) || bet.homeTeam, awayTeam: (fixture === null || fixture === void 0 ? void 0 : fixture.awayTeam) || bet.awayTeam })];
                                }
                            });
                        }); }))];
                case 7:
                    goldenBetsWithOdds = _a.sent();
                    // 6. Generate AI reasoning for Golden Bets
                    console.log('🧠 Generating AI reasoning...');
                    return [4 /*yield*/, (0, aiService_js_1.generateBulkReasoning)(goldenBetsWithOdds.map(function (bet) { return ({
                            homeTeam: bet.homeTeam,
                            awayTeam: bet.awayTeam,
                            league: bet.league,
                            market: bet.market,
                            prediction: bet.prediction,
                            odds: bet.odds,
                            confidence: bet.confidence,
                        }); }))];
                case 8:
                    reasonings = _a.sent();
                    i = 0;
                    _a.label = 9;
                case 9:
                    if (!(i < goldenBetsWithOdds.length)) return [3 /*break*/, 12];
                    bet = goldenBetsWithOdds[i];
                    return [4 /*yield*/, Prediction_js_1.Prediction.findOneAndUpdate({ fixtureId: bet.fixtureId }, __assign(__assign({}, bet), { aiReasoning: reasonings[i], isGoldenBet: true, result: 'pending' }), { upsert: true, new: true })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log('✅ Daily predictions updated successfully');
                    // Sync P&L after updating predictions
                    return [4 /*yield*/, syncPnL()];
                case 13:
                    // Sync P&L after updating predictions
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14:
                    error_7 = _a.sent();
                    console.error('❌ Error updating daily predictions:', error_7);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
function getOddsForMarket(odds, market) {
    if (!odds)
        return 2.0; // Default odds
    switch (market.toLowerCase()) {
        case 'match winner':
            return odds.homeWin || odds.awayWin || 2.0;
        case 'btts':
        case 'both teams to score':
            return odds.btts || 2.0;
        case 'over 2.5':
        case 'over 2.5 goals':
            return odds.over25 || 2.0;
        case 'over 9.5 corners':
            return odds.over95corners || 2.0;
        case 'over 3.5 cards':
            return odds.over35cards || 2.0;
        default:
            return 2.0;
    }
}
