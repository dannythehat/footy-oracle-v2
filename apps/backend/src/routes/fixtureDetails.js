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
var express_1 = require("express");
var Fixture_js_1 = require("../models/Fixture.js");
var fixtureDataService_js_1 = require("../services/fixtureDataService.js");
var router = express_1.default.Router();
/**
 * Get head-to-head matches by team IDs (query params)
 * GET /fixtures/h2h?homeTeamId=123&awayTeamId=456
 */
router.get('/fixtures/h2h', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var homeTeamId, awayTeamId, h2hData, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                homeTeamId = Number(req.query.homeTeamId);
                awayTeamId = Number(req.query.awayTeamId);
                if (!homeTeamId || !awayTeamId) {
                    res.status(400).json({ error: 'homeTeamId and awayTeamId query parameters are required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchH2H)(homeTeamId, awayTeamId)];
            case 1:
                h2hData = _a.sent();
                res.json({
                    success: true,
                    data: h2hData
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error('[fixtureDetails] H2H (query) error:', err_1.message || err_1);
                res.status(500).json({ error: 'Failed to fetch H2H data' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get complete fixture data (all endpoints in one call)
 * GET /fixtures/:fixtureId/complete
 */
router.get('/fixtures/:fixtureId/complete', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixtureDoc, completeData, mergedData, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: fixtureId }).lean()];
            case 1:
                fixtureDoc = _a.sent();
                if (!fixtureDoc) {
                    res.status(404).json({ error: 'Fixture not found in database' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.getCompleteFixtureData)(fixtureDoc)];
            case 2:
                completeData = _a.sent();
                mergedData = __assign(__assign({}, completeData), { 
                    // Include odds from MongoDB
                    odds: fixtureDoc.odds || {}, 
                    // Include AI predictions from MongoDB
                    aiBets: fixtureDoc.aiBets || null, 
                    // Include basic fixture info
                    fixtureId: fixtureDoc.fixtureId, homeTeam: fixtureDoc.homeTeam, awayTeam: fixtureDoc.awayTeam, homeTeamId: fixtureDoc.homeTeamId, awayTeamId: fixtureDoc.awayTeamId, league: fixtureDoc.league, leagueName: fixtureDoc.league, leagueId: fixtureDoc.leagueId, country: fixtureDoc.country, season: fixtureDoc.season, date: fixtureDoc.date, kickoff: fixtureDoc.date, status: fixtureDoc.status, statusShort: fixtureDoc.statusShort, elapsed: fixtureDoc.elapsed, homeScore: fixtureDoc.homeScore, awayScore: fixtureDoc.awayScore, score: fixtureDoc.score });
                res.json({
                    success: true,
                    data: mergedData
                });
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error('[fixtureDetails] Complete data error:', err_2.message || err_2);
                res.status(500).json({ error: 'Failed to fetch complete fixture data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Get fixture by ID
 * GET /fixtures/:fixtureId
 */
router.get('/fixtures/:fixtureId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixture, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureById)(fixtureId)];
            case 1:
                fixture = _a.sent();
                res.json({
                    success: true,
                    data: fixture
                });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error('[fixtureDetails] Fixture error:', err_3.message || err_3);
                res.status(500).json({ error: 'Failed to fetch fixture' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get head-to-head matches by fixture ID
 * GET /fixtures/:fixtureId/h2h
 */
router.get('/fixtures/:fixtureId/h2h', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, fixtureDoc, homeId, awayId, h2hData, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Fixture_js_1.Fixture.findOne({ fixtureId: fixtureId }).lean()];
            case 1:
                fixtureDoc = _a.sent();
                if (!fixtureDoc) {
                    res.status(404).json({ error: 'Fixture not found in database' });
                    return [2 /*return*/];
                }
                homeId = fixtureDoc.homeTeamId;
                awayId = fixtureDoc.awayTeamId;
                if (!homeId || !awayId) {
                    res.status(400).json({ error: 'Cannot determine teams for H2H' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchH2H)(homeId, awayId)];
            case 2:
                h2hData = _a.sent();
                res.json({
                    success: true,
                    data: h2hData
                });
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                console.error('[fixtureDetails] H2H error:', err_4.message || err_4);
                res.status(500).json({ error: 'Failed to fetch H2H data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Get fixture statistics
 * GET /fixtures/:fixtureId/stats
 */
router.get('/fixtures/:fixtureId/stats', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, stats, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureStatistics)(fixtureId)];
            case 1:
                stats = _a.sent();
                res.json({
                    success: true,
                    data: stats
                });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                console.error('[fixtureDetails] Stats error:', err_5.message || err_5);
                res.status(500).json({ error: 'Failed to fetch fixture statistics' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get fixture events (goals, cards, subs)
 * GET /fixtures/:fixtureId/events
 */
router.get('/fixtures/:fixtureId/events', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, events, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchFixtureEvents)(fixtureId)];
            case 1:
                events = _a.sent();
                res.json({
                    success: true,
                    data: events
                });
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                console.error('[fixtureDetails] Events error:', err_6.message || err_6);
                res.status(500).json({ error: 'Failed to fetch fixture events' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get league standings
 * GET /leagues/:leagueId/standings?season=2024
 */
router.get('/leagues/:leagueId/standings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leagueId, season, standings, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                leagueId = Number(req.params.leagueId);
                season = Number(req.query.season);
                if (!leagueId) {
                    res.status(400).json({ error: 'Invalid leagueId' });
                    return [2 /*return*/];
                }
                if (!season) {
                    res.status(400).json({ error: 'season query parameter is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, fixtureDataService_js_1.fetchStandings)(leagueId, season)];
            case 1:
                standings = _a.sent();
                res.json({
                    success: true,
                    data: standings
                });
                return [3 /*break*/, 3];
            case 2:
                err_7 = _a.sent();
                console.error('[fixtureDetails] Standings error:', err_7.message || err_7);
                res.status(500).json({ error: 'Failed to fetch league standings' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get live fixture data (fixture + events)
 * GET /fixtures/:fixtureId/live
 */
router.get('/fixtures/:fixtureId/live', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fixtureId, _a, fixture, events, stats, err_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                fixtureId = Number(req.params.fixtureId);
                if (!fixtureId) {
                    res.status(400).json({ error: 'Invalid fixtureId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Promise.all([
                        (0, fixtureDataService_js_1.fetchFixtureById)(fixtureId),
                        (0, fixtureDataService_js_1.fetchFixtureEvents)(fixtureId),
                        (0, fixtureDataService_js_1.fetchFixtureStatistics)(fixtureId)
                    ])];
            case 1:
                _a = _b.sent(), fixture = _a[0], events = _a[1], stats = _a[2];
                res.json({
                    success: true,
                    data: {
                        fixture: fixture,
                        events: events,
                        stats: stats
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                err_8 = _b.sent();
                console.error('[fixtureDetails] Live error:', err_8.message || err_8);
                res.status(500).json({ error: 'Failed to fetch live data' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
