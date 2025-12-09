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
exports.generateAIReasoning = generateAIReasoning;
exports.generateBulkReasoning = generateBulkReasoning;
var openai_1 = require("openai");
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function generateAIReasoning(input) {
    return __awaiter(this, void 0, void 0, function () {
        var confidenceLevel, prompt, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confidenceLevel = input.confidence >= 75 ? 'HOT 🔥' : input.confidence >= 60 ? 'SOLID 🟡' : 'RISKY 🔵';
                    prompt = "You're a sharp football betting analyst who knows their stuff AND has personality. You're like that mate down the pub who actually does their research but keeps it fun.\n\nMatch: ".concat(input.homeTeam, " vs ").concat(input.awayTeam, "\nLeague: ").concat(input.league, "\nMarket: ").concat(input.market, "\nPrediction: ").concat(input.prediction, "\nOdds: ").concat(input.odds, "\nConfidence: ").concat(input.confidence, "% (").concat(confidenceLevel, ")\n\nWrite a 3-4 sentence analysis that:\n1. Leads with the strongest stat/reason for this bet\n2. Includes specific numbers and data points\n3. Has personality - be conversational, can add humor if it fits naturally\n4. Shows confidence matching the ").concat(confidenceLevel, " level\n5. Talks like you're explaining to a friend, not writing a textbook\n\nStyle guide:\n- ").concat(input.confidence >= 75 ? 'Be confident and punchy! This is a banker.' : input.confidence >= 60 ? 'Solid pick, show the value!' : 'Be honest about the risks, but still engaging.', "\n- Use phrases like \"Look at...\", \"Here's the thing...\", \"Honestly...\", \"Let's be real...\"\n- Can use emojis sparingly (\uD83D\uDD25, \uD83D\uDCB0, \uD83D\uDC40, etc.)\n- Keep it detailed with stats but make it flow naturally\n- NO corporate speak or robotic language\n\nRemember: You're knowledgeable AND fun to listen to. Stats + personality = perfect combo.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: process.env.OPENAI_MODEL || 'chatgpt-4o-latest',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are a knowledgeable football betting analyst with personality. You combine sharp analysis with conversational, friendly tone. Think "expert mate at the pub" not "corporate analyst".'
                                },
                                { role: 'user', content: prompt }
                            ],
                            max_tokens: 250,
                            temperature: 0.8, // Higher for more personality
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.choices[0].message.content || 'AI reasoning unavailable'];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error generating AI reasoning:', error_1);
                    return [2 /*return*/, 'AI reasoning temporarily unavailable'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function generateBulkReasoning(inputs) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        return __generator(this, function (_a) {
            promises = inputs.map(function (input) { return generateAIReasoning(input); });
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
