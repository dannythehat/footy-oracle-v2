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
exports.startMLPredictionsCron = startMLPredictionsCron;
exports.generateDailyPredictions = generateDailyPredictions;
exports.runMLPredictionsNow = runMLPredictionsNow;
var node_cron_1 = require("node-cron");
var axios_1 = require("axios");
var Fixture_js_1 = require("../models/Fixture.js");
var mlService_js_1 = require("../services/mlService.js");
var predictionCache_js_1 = require("../services/predictionCache.js");
var ML_API_URL = process.env.ML_API_URL || 'https://football-ml-api.onrender.com';
/**
 * Start ML predictions cron job
 * Runs daily at 6:00 AM UTC (after odds update at 5 AM, before bet builder at 6:30 AM)
 */
function startMLPredictionsCron() {
    var _this = this;
    // Run daily at 6:00 AM UTC
    node_cron_1.default.schedule('0 6 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🤖 Running daily ML predictions generation (6:00 AM UTC)...');
                    return [4 /*yield*/, generateDailyPredictions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Keep ML API awake - ping every 10 minutes during business hours (6 AM - 11 PM UTC)
    // This prevents Render free tier from sleeping
    node_cron_1.default.schedule('*/10 6-23 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("".concat(ML_API_URL, "/api/health"), { timeout: 5000 })];
                case 1:
                    _a.sent();
                    console.log('💓 ML API keep-alive ping successful');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.warn('⚠️ ML API keep-alive ping failed (API may be sleeping)');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    console.log('✅ ML predictions cron job scheduled: 6:00 AM UTC daily');
    console.log('   Runs after odds update (5 AM) and before bet builder (6:30 AM)');
    console.log('   Predictions cached for 24 hours');
    console.log('💓 ML API keep-alive: Every 10 minutes (6 AM - 11 PM UTC)');
}
/**
 * Generate ML predictions for today's fixtures and cache them for 24 hours
 * This pre-generates predictions so they're cached when users visit the site
 */
function generateDailyPredictions() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2, today, endOfDay, fixtures, goldenBets, valueBets, cacheStatus, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    // First, wake up ML API if it's sleeping
                    console.log('💓 Waking up ML API...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(ML_API_URL, "/api/health"), { timeout: 30000 })];
                case 2:
                    _a.sent();
                    console.log('✅ ML API is awake');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.warn('⚠️ ML API health check failed, but continuing anyway...');
                    return [3 /*break*/, 4];
                case 4:
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    endOfDay = new Date(today);
                    endOfDay.setHours(23, 59, 59, 999);
                    return [4 /*yield*/, Fixture_js_1.Fixture.find({
                            date: { $gte: today, $lte: endOfDay },
                            status: { $in: ['scheduled', 'live'] }
                        })];
                case 5:
                    fixtures = _a.sent();
                    console.log("\uD83D\uDCCA Found ".concat(fixtures.length, " fixtures for today"));
                    if (fixtures.length === 0) {
                        console.log('⚠️ No fixtures found for today - skipping ML predictions');
                        return [2 /*return*/];
                    }
                    // Generate Golden Bets and cache for 24 hours
                    console.log('🏆 Generating Golden Bets...');
                    return [4 /*yield*/, (0, mlService_js_1.loadGoldenBets)(fixtures)];
                case 6:
                    goldenBets = _a.sent();
                    predictionCache_js_1.predictionCache.setGoldenBets(goldenBets);
                    console.log("\u2705 Generated and cached ".concat(goldenBets.length, " Golden Bets"));
                    // Generate Value Bets and cache for 24 hours
                    console.log('💰 Generating Value Bets...');
                    return [4 /*yield*/, (0, mlService_js_1.loadValueBets)(fixtures)];
                case 7:
                    valueBets = _a.sent();
                    predictionCache_js_1.predictionCache.setValueBets(valueBets);
                    console.log("\u2705 Generated and cached ".concat(valueBets.length, " Value Bets"));
                    console.log('🎉 Daily ML predictions generation complete!');
                    console.log("   Golden Bets: ".concat(goldenBets.length, " (cached for 24h)"));
                    console.log("   Value Bets: ".concat(valueBets.length, " (cached for 24h)"));
                    console.log("   Fixtures analyzed: ".concat(fixtures.length));
                    cacheStatus = predictionCache_js_1.predictionCache.getStatus();
                    console.log('📊 Cache status:', JSON.stringify(cacheStatus, null, 2));
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    console.error('❌ ML predictions generation failed:', error_3.message);
                    console.error('Stack trace:', error_3.stack);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Run ML predictions generation immediately (for testing/manual trigger)
 */
function runMLPredictionsNow() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🤖 Running immediate ML predictions generation...');
                    return [4 /*yield*/, generateDailyPredictions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
