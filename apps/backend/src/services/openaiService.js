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
exports.openaiService = void 0;
var openai_1 = require("openai");
var OpenAIService = /** @class */ (function () {
    function OpenAIService() {
        this.client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    /**
     * Generate engaging, fact-driven betting reasoning with human touch
     */
    OpenAIService.prototype.generateBettingReasoning = function (betType, percentage, context) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, completion, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        prompt = this.buildReasoningPrompt(betType, percentage, context);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.chat.completions.create({
                                model: process.env.OPENAI_MODEL || 'chatgpt-4o-latest',
                                messages: [
                                    {
                                        role: 'system',
                                        content: this.getSystemPrompt(percentage)
                                    },
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                temperature: 0.8, // Higher for more personality
                                max_tokens: 150
                            })];
                    case 2:
                        completion = _b.sent();
                        return [2 /*return*/, ((_a = completion.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || 'Analysis unavailable'];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error generating AI reasoning:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * System prompt with personality and confidence tiers
     */
    OpenAIService.prototype.getSystemPrompt = function (percentage) {
        var confidenceLevel = this.getConfidenceLevel(percentage);
        return "You are a sharp football betting analyst with personality. You're knowledgeable, engaging, and occasionally witty.\n\nCONFIDENCE TIERS:\n- Below 60%: LOW \uD83D\uDD35 (cautious, mention risks)\n- 60-75%: WARM \uD83D\uDFE1 (solid pick, good value)\n- 75%+: HOT \uD83D\uDD25 (strong conviction, back it confidently)\n\nCurrent prediction: ".concat(percentage, "% (").concat(confidenceLevel, ")\n\nYOUR STYLE:\n\u2705 Engaging and conversational (like talking to a mate who knows their stuff)\n\u2705 Fact-driven - ALWAYS include specific numbers from the data\n\u2705 Human touch - show personality, can be humorous when appropriate\n\u2705 Lead with the strongest stat that supports the bet\n\u2705 Reference actual form strings (WWDWL), goal averages, H2H rates\n\u2705 40-60 words MAXIMUM - be punchy and impactful\n\n\u274C Don't be boring or robotic\n\u274C Don't hedge excessively (\"might\", \"could\", \"possibly\")\n\u274C Don't ignore the data - numbers are your credibility\n\u274C Don't go over 60 words\n\nEXAMPLES:\n\nHOT (78%): \"Both teams are leaking goals like sieves. Arsenal conceding 1.8/game at home, Liverpool 1.6 away, and both averaging 2+ goals scored. Their last 5 H2H meetings? All had BTS. This one's a banker. \uD83D\uDD25\"\n\nWARM (68%): \"Solid value here. Combined 3.9 goals/game average between these two, and their H2H shows 70% over 2.5 rate. Not a guarantee, but the numbers are singing. \uD83D\uDFE1\"\n\nLOW (52%): \"Bit of a coin flip, honestly. Home form suggests it (WWDWL, 2.1 goals/game) but away team's defensive record (0.9 conceded) makes this risky. Proceed with caution. \uD83D\uDD35\"\n\nRemember: Show your research with REAL NUMBERS from the data. That's what separates us from guesswork.");
    };
    /**
     * Build detailed prompt with all context data
     */
    OpenAIService.prototype.buildReasoningPrompt = function (betType, percentage, context) {
        var betDescriptions = {
            bts: 'Both Teams to Score (BTS)',
            over25: 'Over 2.5 Goals',
            over35cards: 'Over 3.5 Cards',
            over95corners: 'Over 9.5 Corners'
        };
        var confidenceLevel = this.getConfidenceLevel(percentage);
        return "Generate betting reasoning for: ".concat(betDescriptions[betType], "\n\nMATCH: ").concat(context.homeTeam, " vs ").concat(context.awayTeam, "\nLEAGUE: ").concat(context.league, "\nPREDICTION: ").concat(percentage, "% (").concat(confidenceLevel, ")\n\nHOME TEAM (").concat(context.homeTeam, "):\n- Recent Form: ").concat(context.homeForm, "\n- Goals Scored: ").concat(context.homeGoalsAvg.scored, "/game (home)\n- Goals Conceded: ").concat(context.homeGoalsAvg.conceded, "/game (home)\n- Cards Average: ").concat(context.homeCardsAvg, "/game\n- Corners Average: ").concat(context.homeCornersAvg, "/game\n").concat(context.homeStanding ? "- League Position: ".concat(context.homeStanding.rank) : '', "\n").concat(context.homeInjuries ? "- Key Injuries: ".concat(context.homeInjuries.length) : '', "\n\nAWAY TEAM (").concat(context.awayTeam, "):\n- Recent Form: ").concat(context.awayForm, "\n- Goals Scored: ").concat(context.awayGoalsAvg.scored, "/game (away)\n- Goals Conceded: ").concat(context.awayGoalsAvg.conceded, "/game (away)\n- Cards Average: ").concat(context.awayCardsAvg, "/game\n- Corners Average: ").concat(context.awayCornersAvg, "/game\n").concat(context.awayStanding ? "- League Position: ".concat(context.awayStanding.rank) : '', "\n").concat(context.awayInjuries ? "- Key Injuries: ".concat(context.awayInjuries.length) : '', "\n\nHEAD-TO-HEAD:\n").concat(context.h2h ? "- Last ".concat(context.h2h.stats.totalMatches, " meetings\n- Average Goals: ").concat(context.h2h.stats.avgGoals, "\n- Over 2.5 Rate: ").concat((context.h2h.stats.over25Rate * 100).toFixed(0), "%\n- BTS Rate: ").concat((context.h2h.stats.btsRate * 100).toFixed(0), "%\n- Average Corners: ").concat(context.h2h.stats.avgCorners, "\n- Average Cards: ").concat(context.h2h.stats.avgCards) : '- Limited H2H data available', "\n\nWrite an engaging, fact-driven analysis (40-60 words) that:\n1. Leads with the strongest stat supporting this ").concat(percentage, "% prediction\n2. Includes 2-3 specific numbers from the data above\n3. Matches the ").concat(confidenceLevel, " confidence level in tone\n4. Has personality - be conversational, can add humor if it fits\n5. Shows we did our research with real data\n\nRemember: ").concat(confidenceLevel === 'HOT 🔥' ? 'Be confident and punchy!' : confidenceLevel === 'WARM 🟡' ? 'Solid pick, show the value!' : 'Be cautious, mention the risks!');
    };
    /**
     * Determine confidence level based on percentage
     */
    OpenAIService.prototype.getConfidenceLevel = function (percentage) {
        if (percentage >= 75)
            return 'HOT 🔥';
        if (percentage >= 60)
            return 'WARM 🟡';
        return 'LOW 🔵';
    };
    /**
     * Get confidence emoji for display
     */
    OpenAIService.prototype.getConfidenceEmoji = function (percentage) {
        if (percentage >= 75)
            return '🔥';
        if (percentage >= 60)
            return '🟡';
        return '🔵';
    };
    /**
     * Get confidence label for display
     */
    OpenAIService.prototype.getConfidenceLabel = function (percentage) {
        if (percentage >= 75)
            return 'HOT';
        if (percentage >= 60)
            return 'WARM';
        return 'LOW';
    };
    return OpenAIService;
}());
exports.openaiService = new OpenAIService();
