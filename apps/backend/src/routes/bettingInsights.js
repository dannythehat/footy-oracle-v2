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
var Fixture_js_1 = require("../models/Fixture.js");
var bettingInsightsService_js_1 = require("../services/bettingInsightsService.js");
var router = express_1.default.Router();
/**
 * GET /api/betting-insights/fixtures/upcoming
 * Get all fixtures with AI betting insights available
 * NOTE: This must be defined BEFORE /:fixtureId to avoid route conflicts
 */
router.get('/fixtures/upcoming', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var now, sevenDaysFromNow, fixtures, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                now = new Date();
                sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return [4 /*yield*/, Fixture_js_1.Fixture.find({
                        date: {
                            $gte: now,
                            $lte: sevenDaysFromNow
                        },
                        status: 'scheduled',
                        'aiBets.generatedAt': { $exists: true }
                    }).sort({ date: 1 })];
            case 1:
                fixtures = _a.sent();
                res.json({
                    count: fixtures.length,
                    fixtures: fixtures.map(function (f) { return ({
                        fixtureId: f.fixtureId,
                        homeTeam: f.homeTeam,
                        awayTeam: f.awayTeam,
                        league: f.league,
                        date: f.date,
                        aiBets: f.aiBets
                    }); })
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching upcoming fixtures with insights:', error_1);
                res.status(500).json({ error: 'Failed to fetch fixtures' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/betting-insights/:fixtureId
 * Get AI betting insights for a specific fixture
 */
router.get('/:fixtureId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixture, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                fixtureId = req.params.fixtureId;
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: parseInt(fixtureId) })];
            case 1:
                fixture = _a.sent();
                if (!fixture) {
                    return [2 /*return*/, res.status(404).json({ error: 'Fixture not found' })];
                }
                if (!fixture.aiBets) {
                    return [2 /*return*/, res.status(404).json({
                            error: 'AI betting insights not yet generated for this fixture',
                            message: 'Insights are generated 48 hours before kickoff'
                        })];
                }
                res.json({
                    fixtureId: fixture.fixtureId,
                    homeTeam: fixture.homeTeam,
                    awayTeam: fixture.awayTeam,
                    league: fixture.league,
                    date: fixture.date,
                    aiBets: fixture.aiBets
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching betting insights:', error_2);
                res.status(500).json({ error: 'Failed to fetch betting insights' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/betting-insights/:fixtureId/reveal/:betType
 * Reveal a specific bet type for a fixture
 */
router.post('/:fixtureId/reveal/:betType', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fixtureId, betType, validBetTypes, fixture, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.params, fixtureId = _a.fixtureId, betType = _a.betType;
                validBetTypes = ['bts', 'over25', 'over35cards', 'over95corners'];
                if (!validBetTypes.includes(betType)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid bet type' })];
                }
                return [4 /*yield*/, bettingInsightsService_js_1.bettingInsightsService.revealBetType(parseInt(fixtureId), betType)];
            case 1:
                _c.sent();
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: parseInt(fixtureId) })];
            case 2:
                fixture = _c.sent();
                res.json({
                    success: true,
                    betType: betType,
                    revealed: (_b = fixture === null || fixture === void 0 ? void 0 : fixture.aiBets) === null || _b === void 0 ? void 0 : _b[betType]
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _c.sent();
                console.error('Error revealing bet type:', error_3);
                res.status(500).json({ error: 'Failed to reveal bet type' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/betting-insights/:fixtureId/reveal-golden
 * Reveal the golden bet for a fixture
 */
router.post('/:fixtureId/reveal-golden', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixture, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                fixtureId = req.params.fixtureId;
                return [4 /*yield*/, bettingInsightsService_js_1.bettingInsightsService.revealGoldenBet(parseInt(fixtureId))];
            case 1:
                _b.sent();
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: parseInt(fixtureId) })];
            case 2:
                fixture = _b.sent();
                res.json({
                    success: true,
                    goldenBet: (_a = fixture === null || fixture === void 0 ? void 0 : fixture.aiBets) === null || _a === void 0 ? void 0 : _a.goldenBet
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Error revealing golden bet:', error_4);
                res.status(500).json({ error: 'Failed to reveal golden bet' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
