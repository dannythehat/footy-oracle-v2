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
exports.analyzeFixture = analyzeFixture;
exports.analyzeBulkFixtures = analyzeBulkFixtures;
exports.findGoldenBets = findGoldenBets;
exports.findValueBets = findValueBets;
var openai_1 = require("openai");
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function analyzeFixture(fixture) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, response, analysis, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Analyze this football fixture and provide detailed predictions:\n\nMatch: ".concat(fixture.homeTeam, " vs ").concat(fixture.awayTeam, "\nLeague: ").concat(fixture.league, "\nDate: ").concat(fixture.date, "\n").concat(fixture.venue ? "Venue: ".concat(fixture.venue) : '', "\n").concat(fixture.homeForm ? "Home Form: ".concat(fixture.homeForm.join(', ')) : '', "\n").concat(fixture.awayForm ? "Away Form: ".concat(fixture.awayForm.join(', ')) : '', "\n\nProvide predictions for:\n1. Match winner (home/away/draw) with confidence %\n2. Predicted score\n3. Key betting markets (Over/Under 2.5, BTTS, etc.)\n4. Identify the best \"Golden Bet\" opportunity\n\nFormat as JSON with structure:\n{\n  \"winner\": \"home|away|draw\",\n  \"confidence\": 75,\n  \"scorePrediction\": \"2-1\",\n  \"markets\": [\n    {\"market\": \"Over 2.5 Goals\", \"prediction\": \"Yes\", \"odds\": 1.85, \"confidence\": 70}\n  ],\n  \"reasoning\": \"Brief analysis\",\n  \"goldenBet\": {\"market\": \"...\", \"prediction\": \"...\", \"odds\": 0, \"confidence\": 0, \"reasoning\": \"...\"}\n}");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: process.env.OPENAI_MODEL || 'gpt-4',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are an expert football analyst and betting strategist. Provide data-driven predictions with realistic confidence levels.'
                                },
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 800,
                            temperature: 0.7,
                            response_format: { type: 'json_object' }
                        })];
                case 2:
                    response = _a.sent();
                    analysis = JSON.parse(response.choices[0].message.content || '{}');
                    return [2 /*return*/, {
                            fixtureId: fixture.id,
                            homeTeam: fixture.homeTeam,
                            awayTeam: fixture.awayTeam,
                            prediction: {
                                winner: analysis.winner || 'draw',
                                confidence: analysis.confidence || 50,
                                scorePrediction: analysis.scorePrediction || '1-1'
                            },
                            markets: analysis.markets || [],
                            reasoning: analysis.reasoning || 'Analysis unavailable',
                            goldenBet: analysis.goldenBet
                        }];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error analyzing fixture:', error_1);
                    throw new Error('Failed to analyze fixture');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function analyzeBulkFixtures(fixtures) {
    return __awaiter(this, void 0, void 0, function () {
        var batchSize, results, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batchSize = 5;
                    results = [];
                    _loop_1 = function (i) {
                        var batch, batchPromises, batchResults;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    batch = fixtures.slice(i, i + batchSize);
                                    batchPromises = batch.map(function (fixture) { return analyzeFixture(fixture); });
                                    return [4 /*yield*/, Promise.allSettled(batchPromises)];
                                case 1:
                                    batchResults = _b.sent();
                                    batchResults.forEach(function (result, index) {
                                        if (result.status === 'fulfilled') {
                                            results.push(result.value);
                                        }
                                        else {
                                            console.error("Failed to analyze fixture ".concat(batch[index].id, ":"), result.reason);
                                        }
                                    });
                                    if (!(i + batchSize < fixtures.length)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < fixtures.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i += batchSize;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
            }
        });
    });
}
function findGoldenBets(predictions) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, predictions.filter(function (p) {
                    return p.goldenBet &&
                        p.goldenBet.confidence >= 75 &&
                        p.goldenBet.odds >= 1.5;
                })];
        });
    });
}
function findValueBets(predictions) {
    return __awaiter(this, void 0, void 0, function () {
        var valueBets;
        return __generator(this, function (_a) {
            valueBets = [];
            predictions.forEach(function (prediction) {
                prediction.markets.forEach(function (market) {
                    // Simple value calculation: if confidence > implied probability
                    var impliedProbability = 1 / market.odds;
                    var ourProbability = market.confidence / 100;
                    if (ourProbability > impliedProbability * 1.1) { // 10% edge
                        valueBets.push({
                            fixture: "".concat(prediction.homeTeam, " vs ").concat(prediction.awayTeam),
                            market: market.market,
                            prediction: market.prediction,
                            odds: market.odds,
                            confidence: market.confidence,
                            edge: ((ourProbability - impliedProbability) * 100).toFixed(2) + '%'
                        });
                    }
                });
            });
            return [2 /*return*/, valueBets.sort(function (a, b) { return parseFloat(b.edge) - parseFloat(a.edge); })];
        });
    });
}
