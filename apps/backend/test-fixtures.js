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
require("dotenv/config");
var fixturesService_1 = require("../src/services/fixturesService");
// Test fixture data
var testFixture = {
    id: 'test-001',
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    league: 'Premier League',
    date: '2025-11-24T15:00:00Z',
    venue: 'Etihad Stadium',
    homeForm: ['W', 'W', 'W', 'D', 'W'],
    awayForm: ['W', 'D', 'W', 'W', 'L']
};
var testFixtures = [
    testFixture,
    {
        id: 'test-002',
        homeTeam: 'Liverpool',
        awayTeam: 'Chelsea',
        league: 'Premier League',
        date: '2025-11-24T17:30:00Z',
        venue: 'Anfield',
        homeForm: ['W', 'W', 'W', 'W', 'D'],
        awayForm: ['L', 'D', 'W', 'L', 'D']
    },
    {
        id: 'test-003',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        league: 'La Liga',
        date: '2025-11-24T20:00:00Z',
        venue: 'Santiago Bernabéu',
        homeForm: ['W', 'W', 'D', 'W', 'W'],
        awayForm: ['W', 'W', 'W', 'W', 'W']
    }
];
function testSingleAnalysis() {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🔍 Testing Single Fixture Analysis...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fixturesService_1.analyzeFixture)(testFixture)];
                case 2:
                    result = _a.sent();
                    console.log('✅ Single Analysis Success!');
                    console.log(JSON.stringify(result, null, 2));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('❌ Single Analysis Failed:', error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function testBulkAnalysis() {
    return __awaiter(this, void 0, void 0, function () {
        var results, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🔍 Testing Bulk Fixture Analysis...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fixturesService_1.analyzeBulkFixtures)(testFixtures)];
                case 2:
                    results = _a.sent();
                    console.log("\u2705 Bulk Analysis Success! Analyzed ".concat(results.length, " fixtures"));
                    results.forEach(function (result, index) {
                        console.log("\n--- Fixture ".concat(index + 1, ": ").concat(result.homeTeam, " vs ").concat(result.awayTeam, " ---"));
                        console.log("Winner: ".concat(result.prediction.winner, " (").concat(result.prediction.confidence, "% confidence)"));
                        console.log("Score: ".concat(result.prediction.scorePrediction));
                        console.log("Markets: ".concat(result.markets.length));
                        if (result.goldenBet) {
                            console.log("\uD83C\uDFC6 Golden Bet: ".concat(result.goldenBet.market, " @ ").concat(result.goldenBet.odds));
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('❌ Bulk Analysis Failed:', error_2.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function testGoldenBets() {
    return __awaiter(this, void 0, void 0, function () {
        var predictions, goldenBets, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n🏆 Testing Golden Bets Detection...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, fixturesService_1.analyzeBulkFixtures)(testFixtures)];
                case 2:
                    predictions = _a.sent();
                    return [4 /*yield*/, (0, fixturesService_1.findGoldenBets)(predictions)];
                case 3:
                    goldenBets = _a.sent();
                    console.log("\u2705 Found ".concat(goldenBets.length, " Golden Bets!"));
                    goldenBets.forEach(function (bet, index) {
                        var _a, _b, _c;
                        console.log("\n".concat(index + 1, ". ").concat(bet.homeTeam, " vs ").concat(bet.awayTeam));
                        console.log("   Market: ".concat((_a = bet.goldenBet) === null || _a === void 0 ? void 0 : _a.market));
                        console.log("   Odds: ".concat((_b = bet.goldenBet) === null || _b === void 0 ? void 0 : _b.odds));
                        console.log("   Confidence: ".concat((_c = bet.goldenBet) === null || _c === void 0 ? void 0 : _c.confidence, "%"));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('❌ Golden Bets Detection Failed:', error_3.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function testValueBets() {
    return __awaiter(this, void 0, void 0, function () {
        var predictions, valueBets, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n💎 Testing Value Bets Detection...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, fixturesService_1.analyzeBulkFixtures)(testFixtures)];
                case 2:
                    predictions = _a.sent();
                    return [4 /*yield*/, (0, fixturesService_1.findValueBets)(predictions)];
                case 3:
                    valueBets = _a.sent();
                    console.log("\u2705 Found ".concat(valueBets.length, " Value Bets!"));
                    valueBets.slice(0, 5).forEach(function (bet, index) {
                        console.log("\n".concat(index + 1, ". ").concat(bet.fixture));
                        console.log("   Market: ".concat(bet.market));
                        console.log("   Prediction: ".concat(bet.prediction));
                        console.log("   Odds: ".concat(bet.odds));
                        console.log("   Edge: ".concat(bet.edge));
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('❌ Value Bets Detection Failed:', error_4.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function runAllTests() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting Fixtures Service Tests...');
                    console.log('=====================================');
                    // Check OpenAI API Key
                    if (!process.env.OPENAI_API_KEY) {
                        console.error('❌ OPENAI_API_KEY not found in environment variables!');
                        console.log('Please create a .env file with your OpenAI API key.');
                        process.exit(1);
                    }
                    console.log('✅ OpenAI API Key found');
                    console.log("\uD83D\uDCDD Model: ".concat(process.env.OPENAI_MODEL || 'gpt-4'));
                    return [4 /*yield*/, testSingleAnalysis()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, testBulkAnalysis()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testGoldenBets()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testValueBets()];
                case 4:
                    _a.sent();
                    console.log('\n=====================================');
                    console.log('✅ All tests completed!');
                    return [2 /*return*/];
            }
        });
    });
}
// Run tests
runAllTests().catch(console.error);
