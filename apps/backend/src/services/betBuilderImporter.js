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
exports.importBetBuilders = importBetBuilders;
exports.importBetBuildersFromAPI = importBetBuildersFromAPI;
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var BetBuilder_js_1 = require("../models/BetBuilder.js");
var openai_1 = require("openai");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Generate AI reasoning for bet builder using GPT-4
 */
function generateAIReasoning(betBuilder) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "You are a professional football betting analyst. Analyze this multi-market bet builder opportunity:\n\nFixture: ".concat(betBuilder.home_team, " vs ").concat(betBuilder.away_team, "\nLeague: ").concat(betBuilder.league, "\n\nHigh Confidence Markets:\n").concat(betBuilder.high_confidence_markets.map(function (m) {
                        return "- ".concat(m.market_name, ": ").concat(m.confidence, "% confidence");
                    }).join('\n'), "\n\nCombined Confidence: ").concat(betBuilder.combined_confidence, "%\nCombined Odds: ").concat(betBuilder.estimated_combined_odds, "x\n\nProvide a concise 2-3 sentence analysis explaining WHY these markets converge with high confidence. Consider:\n- Team form and playing styles\n- Historical head-to-head data\n- Tactical factors\n- Any relevant context (injuries, referee, weather)\n\nKeep it professional, insightful, and under 150 words.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: process.env.OPENAI_MODEL || 'gpt-4',
                            messages: [{ role: 'user', content: prompt }],
                            max_tokens: 200,
                            temperature: 0.7,
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.choices[0].message.content || 'Analysis unavailable'];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error generating AI reasoning:', error_1);
                    return [2 /*return*/, 'AI analysis temporarily unavailable. Both teams show strong attacking metrics and historical data suggests high-scoring encounters.'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Import bet builders from LM System output
 */
function importBetBuilders() {
    return __awaiter(this, void 0, void 0, function () {
        var stats, filePath, data, betBuilders, _i, betBuilders_1, bb, existing, aiReasoning, error_2, betBuilder, error_3, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stats = {
                        success: true,
                        imported: 0,
                        skipped: 0,
                        errors: 0,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    filePath = path_1.default.join(__dirname, '../../../../shared/ml_outputs/bet_builders.json');
                    if (!fs_1.default.existsSync(filePath)) {
                        console.log('⚠️ No bet_builders.json found. Skipping import.');
                        console.log("Expected path: ".concat(filePath));
                        return [2 /*return*/, stats];
                    }
                    data = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
                    betBuilders = data.bet_builders || [];
                    console.log("\uD83D\uDCE5 Importing ".concat(betBuilders.length, " bet builders from LM System..."));
                    _i = 0, betBuilders_1 = betBuilders;
                    _a.label = 2;
                case 2:
                    if (!(_i < betBuilders_1.length)) return [3 /*break*/, 12];
                    bb = betBuilders_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 10, , 11]);
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.findOne({ fixtureId: bb.fixture_id })];
                case 4:
                    existing = _a.sent();
                    if (existing) {
                        console.log("\u23ED\uFE0F Bet builder for fixture ".concat(bb.fixture_id, " already exists"));
                        stats.skipped++;
                        return [3 /*break*/, 11];
                    }
                    aiReasoning = void 0;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, generateAIReasoning(bb)];
                case 6:
                    aiReasoning = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.warn("\u26A0\uFE0F Failed to generate AI reasoning for ".concat(bb.home_team, " vs ").concat(bb.away_team, ", using fallback"));
                    aiReasoning = "Multi-market convergence detected with ".concat(bb.combined_confidence, "% combined confidence across ").concat(bb.market_count, " markets. Strong indicators suggest value in this bet builder combination.");
                    return [3 /*break*/, 8];
                case 8:
                    betBuilder = new BetBuilder_js_1.BetBuilder({
                        fixtureId: bb.fixture_id,
                        date: new Date(bb.kickoff),
                        homeTeam: bb.home_team,
                        awayTeam: bb.away_team,
                        league: bb.league,
                        kickoff: new Date(bb.kickoff),
                        markets: bb.high_confidence_markets.map(function (m) { return ({
                            market: m.market,
                            marketName: m.market_name,
                            confidence: m.confidence,
                            probability: m.probability,
                            estimatedOdds: m.estimated_odds,
                        }); }),
                        combinedConfidence: bb.combined_confidence,
                        estimatedCombinedOdds: bb.estimated_combined_odds,
                        aiReasoning: aiReasoning,
                    });
                    return [4 /*yield*/, betBuilder.save()];
                case 9:
                    _a.sent();
                    console.log("\u2705 Imported bet builder: ".concat(bb.home_team, " vs ").concat(bb.away_team, " (").concat(bb.combined_confidence, "% confidence)"));
                    stats.imported++;
                    return [3 /*break*/, 11];
                case 10:
                    error_3 = _a.sent();
                    console.error("\u274C Error importing bet builder for fixture ".concat(bb.fixture_id, ":"), error_3);
                    stats.errors++;
                    return [3 /*break*/, 11];
                case 11:
                    _i++;
                    return [3 /*break*/, 2];
                case 12:
                    console.log("\u2705 Bet builder import complete: ".concat(stats.imported, " imported, ").concat(stats.skipped, " skipped, ").concat(stats.errors, " errors"));
                    return [2 /*return*/, stats];
                case 13:
                    error_4 = _a.sent();
                    console.error('❌ Error importing bet builders:', error_4);
                    stats.success = false;
                    return [2 /*return*/, stats];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * Import bet builders from API endpoint (alternative to file-based)
 */
function importBetBuildersFromAPI(apiUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, url, response, data, betBuilders, _i, betBuilders_2, bb, existing, aiReasoning, betBuilder, error_5, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stats = {
                        success: true,
                        imported: 0,
                        skipped: 0,
                        errors: 0,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    url = apiUrl || process.env.LM_SYSTEM_API_URL + '/bet-builders';
                    console.log("\uD83D\uDCE5 Fetching bet builders from API: ".concat(url));
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("API request failed: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    betBuilders = data.bet_builders || [];
                    console.log("\uD83D\uDCE5 Importing ".concat(betBuilders.length, " bet builders from API..."));
                    _i = 0, betBuilders_2 = betBuilders;
                    _a.label = 4;
                case 4:
                    if (!(_i < betBuilders_2.length)) return [3 /*break*/, 11];
                    bb = betBuilders_2[_i];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, BetBuilder_js_1.BetBuilder.findOne({ fixtureId: bb.fixture_id })];
                case 6:
                    existing = _a.sent();
                    if (existing) {
                        stats.skipped++;
                        return [3 /*break*/, 10];
                    }
                    return [4 /*yield*/, generateAIReasoning(bb)];
                case 7:
                    aiReasoning = _a.sent();
                    betBuilder = new BetBuilder_js_1.BetBuilder({
                        fixtureId: bb.fixture_id,
                        date: new Date(bb.kickoff),
                        homeTeam: bb.home_team,
                        awayTeam: bb.away_team,
                        league: bb.league,
                        kickoff: new Date(bb.kickoff),
                        markets: bb.high_confidence_markets.map(function (m) { return ({
                            market: m.market,
                            marketName: m.market_name,
                            confidence: m.confidence,
                            probability: m.probability,
                            estimatedOdds: m.estimated_odds,
                        }); }),
                        combinedConfidence: bb.combined_confidence,
                        estimatedCombinedOdds: bb.estimated_combined_odds,
                        aiReasoning: aiReasoning,
                    });
                    return [4 /*yield*/, betBuilder.save()];
                case 8:
                    _a.sent();
                    stats.imported++;
                    return [3 /*break*/, 10];
                case 9:
                    error_5 = _a.sent();
                    console.error("\u274C Error importing bet builder:", error_5);
                    stats.errors++;
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11:
                    console.log("\u2705 API import complete: ".concat(stats.imported, " imported, ").concat(stats.skipped, " skipped, ").concat(stats.errors, " errors"));
                    return [2 /*return*/, stats];
                case 12:
                    error_6 = _a.sent();
                    console.error('❌ Error importing from API:', error_6);
                    stats.success = false;
                    return [2 /*return*/, stats];
                case 13: return [2 /*return*/];
            }
        });
    });
}
