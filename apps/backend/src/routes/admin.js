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
var express_1 = require("express");
var betBuilderImporter_js_1 = require("../services/betBuilderImporter.js");
var betBuilderCron_js_1 = require("../cron/betBuilderCron.js");
var fixtureExportService_js_1 = require("../services/fixtureExportService.js");
var liveScoresService_js_1 = require("../services/liveScoresService.js");
var mlPredictionsCron_js_1 = require("../cron/mlPredictionsCron.js");
var predictionCache_js_1 = require("../services/predictionCache.js");
var manualFixtureLoader_js_1 = require("../services/manualFixtureLoader.js");
var router = (0, express_1.Router)();
/**
 * POST /api/admin/generate-predictions
 * Manually trigger ML predictions generation (Golden Bets + Value Bets)
 */
router.post('/generate-predictions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🤖 Manual ML predictions generation triggered');
                return [4 /*yield*/, (0, mlPredictionsCron_js_1.runMLPredictionsNow)()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'ML predictions generated successfully',
                    note: 'Golden Bets and Value Bets have been generated and cached for 24 hours',
                    cache: predictionCache_js_1.predictionCache.getStatus()
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error generating predictions:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/admin/cache-status
 * Check prediction cache status
 */
router.get('/cache-status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1;
    return __generator(this, function (_a) {
        try {
            status_1 = predictionCache_js_1.predictionCache.getStatus();
            res.json({
                success: true,
                cache: status_1,
                note: 'Cache expires after 24 hours. Predictions are regenerated daily at 6 AM UTC.'
            });
        }
        catch (error) {
            console.error('Error checking cache status:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * POST /api/admin/update-live-scores
 * Manually trigger live score updates (bypasses cron)
 */
router.post('/update-live-scores', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var liveResult, finishedResult, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                console.log('🔴 Manual live score update triggered');
                return [4 /*yield*/, (0, liveScoresService_js_1.updateLiveScores)()];
            case 1:
                liveResult = _a.sent();
                return [4 /*yield*/, (0, liveScoresService_js_1.updateRecentlyFinishedFixtures)()];
            case 2:
                finishedResult = _a.sent();
                res.json({
                    success: true,
                    message: 'Live score update completed',
                    results: {
                        live_fixtures: {
                            updated: liveResult.updated,
                            total: liveResult.total,
                        },
                        recently_finished: {
                            updated: finishedResult.updated,
                            total: finishedResult.total,
                        },
                        total_updated: liveResult.updated + finishedResult.updated,
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error updating live scores:', error_2);
                res.status(500).json({
                    success: false,
                    error: error_2.message,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/admin/export-fixtures-ml
 * Export today's fixtures for ML processing
 */
router.post('/export-fixtures-ml', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('📤 Manual ML fixture export triggered');
                return [4 /*yield*/, (0, fixtureExportService_js_1.exportFixturesForML)()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Fixtures exported successfully for ML processing',
                    next_steps: [
                        '1. Run ML prediction scripts in football-betting-ai-system repo',
                        '2. ML will generate predictions for 4 markets (BTTS, Over 2.5, Corners, Cards)',
                        '3. Outputs will be written to shared/ml_outputs/',
                        '4. Frontend will display Golden Bets, Value Bets, and Bet Builders',
                    ],
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error exporting fixtures:', error_3);
                res.status(500).json({
                    success: false,
                    error: error_3.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/admin/ml-status
 * Check ML integration status
 */
router.get('/ml-status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fs, path, fileURLToPath, __filename_1, __dirname_1, inputPath, inputExists, inputData, content, outputDir, predictionsPath, goldenBetsPath, valueBetsPath, betBuilderPath, predictionsExists, goldenBetsExists, valueBetsExists, betBuilderExists, predictionsData, goldenBetsData, valueBetsData, betBuilderData, content, content, content, content, exportStatus, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('fs'); })];
            case 1:
                fs = _c.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('path'); })];
            case 2:
                path = _c.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('url'); })];
            case 3:
                fileURLToPath = (_c.sent()).fileURLToPath;
                __filename_1 = fileURLToPath(import.meta.url);
                __dirname_1 = path.dirname(__filename_1);
                inputPath = path.join(__dirname_1, '../../../../shared/ml_inputs/fixtures_today.json');
                inputExists = fs.existsSync(inputPath);
                inputData = null;
                if (inputExists) {
                    content = fs.readFileSync(inputPath, 'utf-8');
                    inputData = JSON.parse(content);
                }
                outputDir = path.join(__dirname_1, '../../../../shared/ml_outputs');
                predictionsPath = path.join(outputDir, 'predictions.json');
                goldenBetsPath = path.join(outputDir, 'golden_bets.json');
                valueBetsPath = path.join(outputDir, 'value_bets.json');
                betBuilderPath = path.join(outputDir, 'bet_builder.json');
                predictionsExists = fs.existsSync(predictionsPath);
                goldenBetsExists = fs.existsSync(goldenBetsPath);
                valueBetsExists = fs.existsSync(valueBetsPath);
                betBuilderExists = fs.existsSync(betBuilderPath);
                predictionsData = null;
                goldenBetsData = null;
                valueBetsData = null;
                betBuilderData = null;
                if (predictionsExists) {
                    content = fs.readFileSync(predictionsPath, 'utf-8');
                    predictionsData = JSON.parse(content);
                }
                if (goldenBetsExists) {
                    content = fs.readFileSync(goldenBetsPath, 'utf-8');
                    goldenBetsData = JSON.parse(content);
                }
                if (valueBetsExists) {
                    content = fs.readFileSync(valueBetsPath, 'utf-8');
                    valueBetsData = JSON.parse(content);
                }
                if (betBuilderExists) {
                    content = fs.readFileSync(betBuilderPath, 'utf-8');
                    betBuilderData = JSON.parse(content);
                }
                return [4 /*yield*/, (0, fixtureExportService_js_1.getExportStatus)()];
            case 4:
                exportStatus = _c.sent();
                res.json({
                    success: true,
                    ml_integration: {
                        input: {
                            file_exists: inputExists,
                            path: inputPath,
                            fixtures_count: (inputData === null || inputData === void 0 ? void 0 : inputData.length) || 0,
                            status: inputExists && (inputData === null || inputData === void 0 ? void 0 : inputData.length) > 0 ? '✅ Ready' : '❌ Missing',
                        },
                        outputs: {
                            predictions: {
                                file_exists: predictionsExists,
                                count: Array.isArray(predictionsData) ? predictionsData.length : 0,
                                has_data: predictionsData && predictionsData.length > 0 && ((_b = (_a = predictionsData[0]) === null || _a === void 0 ? void 0 : _a.predictions) === null || _b === void 0 ? void 0 : _b.over25) !== null,
                                status: predictionsExists && (predictionsData === null || predictionsData === void 0 ? void 0 : predictionsData.length) > 0 ? '✅ Generated' : '❌ Empty',
                            },
                            golden_bets: {
                                file_exists: goldenBetsExists,
                                count: Array.isArray(goldenBetsData) ? goldenBetsData.length : 0,
                                status: goldenBetsExists && (goldenBetsData === null || goldenBetsData === void 0 ? void 0 : goldenBetsData.length) > 0 ? '✅ Generated' : '❌ Empty',
                            },
                            value_bets: {
                                file_exists: valueBetsExists,
                                count: Array.isArray(valueBetsData) ? valueBetsData.length : 0,
                                status: valueBetsExists && (valueBetsData === null || valueBetsData === void 0 ? void 0 : valueBetsData.length) > 0 ? '✅ Generated' : '❌ Empty',
                            },
                            bet_builder: {
                                file_exists: betBuilderExists,
                                count: Array.isArray(betBuilderData) ? betBuilderData.length : 0,
                                status: betBuilderExists && (betBuilderData === null || betBuilderData === void 0 ? void 0 : betBuilderData.length) > 0 ? '✅ Generated' : '❌ Empty',
                            },
                        },
                        export_status: exportStatus,
                    },
                    instructions: {
                        step_1: 'POST /api/admin/export-fixtures-ml to export fixtures',
                        step_2: 'Run ML scripts in football-betting-ai-system repo',
                        step_3: 'Check this endpoint again to verify outputs',
                    },
                });
                return [3 /*break*/, 6];
            case 5:
                error_4 = _c.sent();
                console.error('Error checking ML status:', error_4);
                res.status(500).json({
                    success: false,
                    error: error_4.message,
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/admin/import-bet-builders
 * Manually trigger bet builder import from file
 */
router.post('/import-bet-builders', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🧠 Manual bet builder import triggered');
                return [4 /*yield*/, (0, betBuilderImporter_js_1.importBetBuilders)()];
            case 1:
                stats = _a.sent();
                res.json({
                    success: stats.success,
                    message: stats.success
                        ? 'Bet builder import completed successfully'
                        : 'Bet builder import failed',
                    stats: {
                        imported: stats.imported,
                        skipped: stats.skipped,
                        errors: stats.errors,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error in manual import:', error_5);
                res.status(500).json({
                    success: false,
                    error: error_5.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/admin/import-bet-builders-api
 * Manually trigger bet builder import from API
 */
router.post('/import-bet-builders-api', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var apiUrl, stats, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                apiUrl = req.body.apiUrl;
                console.log('🧠 Manual bet builder API import triggered');
                return [4 /*yield*/, (0, betBuilderImporter_js_1.importBetBuildersFromAPI)(apiUrl)];
            case 1:
                stats = _a.sent();
                res.json({
                    success: stats.success,
                    message: stats.success
                        ? 'Bet builder API import completed successfully'
                        : 'Bet builder API import failed',
                    stats: {
                        imported: stats.imported,
                        skipped: stats.skipped,
                        errors: stats.errors,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error in manual API import:', error_6);
                res.status(500).json({
                    success: false,
                    error: error_6.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/admin/run-bet-builder-cron
 * Manually trigger the cron job logic
 */
router.post('/run-bet-builder-cron', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🧠 Manual cron job execution triggered');
                return [4 /*yield*/, (0, betBuilderCron_js_1.runBetBuilderImportNow)()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Bet builder cron job executed successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error running cron job:', error_7);
                res.status(500).json({
                    success: false,
                    error: error_7.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/admin/bet-builder-status
 * Check bet builder import status
 */
router.get('/bet-builder-status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fs, path, fileURLToPath, __filename_2, __dirname_2, filePath, fileExists, fileData, content, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('fs'); })];
            case 1:
                fs = _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('path'); })];
            case 2:
                path = _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('url'); })];
            case 3:
                fileURLToPath = (_a.sent()).fileURLToPath;
                __filename_2 = fileURLToPath(import.meta.url);
                __dirname_2 = path.dirname(__filename_2);
                filePath = path.join(__dirname_2, '../../../../shared/ml_outputs/bet_builders.json');
                fileExists = fs.existsSync(filePath);
                fileData = null;
                if (fileExists) {
                    content = fs.readFileSync(filePath, 'utf-8');
                    fileData = JSON.parse(content);
                }
                res.json({
                    success: true,
                    status: {
                        fileExists: fileExists,
                        filePath: filePath,
                        lastGenerated: (fileData === null || fileData === void 0 ? void 0 : fileData.generated_at) || null,
                        betBuildersCount: (fileData === null || fileData === void 0 ? void 0 : fileData.bet_builders_found) || 0,
                        date: (fileData === null || fileData === void 0 ? void 0 : fileData.date) || null,
                    },
                });
                return [3 /*break*/, 5];
            case 4:
                error_8 = _a.sent();
                console.error('Error checking status:', error_8);
                res.status(500).json({
                    success: false,
                    error: error_8.message,
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
/**
 * POST /api/admin/load-today-fixtures
 * Manually load today's fixtures into MongoDB
 */
router.post("/load-today-fixtures", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var count, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, manualFixtureLoader_js_1.loadTodayFixturesManual)()];
            case 1:
                count = _a.sent();
                res.json({
                    success: true,
                    fixtures_loaded: count,
                    message: "Loaded ".concat(count, " fixtures for today")
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                res.status(500).json({ success: false, error: err_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
