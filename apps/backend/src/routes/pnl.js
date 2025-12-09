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
var pnlTrackingService_js_1 = require("../services/pnlTrackingService.js");
var router = (0, express_1.Router)();
/**
 * GET /api/pnl/breakdown
 * Get P&L statistics breakdown by selection type
 * Query params: period (daily|weekly|monthly|yearly|all)
 */
router.get('/breakdown', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, breakdown, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query.period, period = _a === void 0 ? 'all' : _a;
                return [4 /*yield*/, (0, pnlTrackingService_js_1.getPnLBreakdown)(period)];
            case 1:
                breakdown = _b.sent();
                res.json({
                    success: true,
                    data: breakdown,
                    period: period,
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
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
 * GET /api/pnl/history
 * Get historical selections with filtering
 * Query params:
 *   - selectionType (golden-bet|bet-builder|value-bet)
 *   - result (win|loss|pending|void)
 *   - startDate (ISO date)
 *   - endDate (ISO date)
 *   - page (number)
 *   - limit (number)
 */
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, selectionType, result, startDate, endDate, _b, page, _c, limit, pageNum, limitNum, skip, options, data, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, selectionType = _a.selectionType, result = _a.result, startDate = _a.startDate, endDate = _a.endDate, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '50' : _c;
                pageNum = parseInt(page);
                limitNum = parseInt(limit);
                skip = (pageNum - 1) * limitNum;
                options = {
                    limit: limitNum,
                    skip: skip,
                };
                if (selectionType)
                    options.selectionType = selectionType;
                if (result)
                    options.result = result;
                if (startDate)
                    options.startDate = new Date(startDate);
                if (endDate)
                    options.endDate = new Date(endDate);
                return [4 /*yield*/, (0, pnlTrackingService_js_1.getHistoricalSelections)(options)];
            case 1:
                data = _d.sent();
                res.json({
                    success: true,
                    data: data.selections,
                    pagination: {
                        page: data.page,
                        totalPages: data.totalPages,
                        total: data.total,
                        limit: limitNum,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _d.sent();
                res.status(500).json({
                    success: false,
                    error: error_2.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/pnl/sync
 * Manually trigger sync of featured selections
 * (This should also run automatically via cron)
 */
router.post('/sync', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, pnlTrackingService_js_1.syncFeaturedSelections)()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Featured selections synced successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
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
 * PUT /api/pnl/result
 * Update a selection result
 * Body: { fixtureId, selectionType, result }
 */
router.put('/result', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fixtureId, selectionType, result, selection, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, fixtureId = _a.fixtureId, selectionType = _a.selectionType, result = _a.result;
                if (!fixtureId || !selectionType || !result) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: fixtureId, selectionType, result',
                        })];
                }
                if (!['golden-bet', 'bet-builder', 'value-bet'].includes(selectionType)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid selectionType. Must be: golden-bet, bet-builder, or value-bet',
                        })];
                }
                if (!['win', 'loss', 'void'].includes(result)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid result. Must be: win, loss, or void',
                        })];
                }
                return [4 /*yield*/, (0, pnlTrackingService_js_1.updateSelectionResult)(parseInt(fixtureId), selectionType, result)];
            case 1:
                selection = _b.sent();
                if (!selection) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Selection not found',
                        })];
                }
                res.json({
                    success: true,
                    data: selection,
                    message: 'Selection result updated successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_4.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/pnl/summary
 * Get quick summary stats for dashboard
 */
router.get('/summary', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, daily, weekly, monthly, allTime, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Promise.all([
                        (0, pnlTrackingService_js_1.getPnLBreakdown)('daily'),
                        (0, pnlTrackingService_js_1.getPnLBreakdown)('weekly'),
                        (0, pnlTrackingService_js_1.getPnLBreakdown)('monthly'),
                        (0, pnlTrackingService_js_1.getPnLBreakdown)('all'),
                    ])];
            case 1:
                _a = _b.sent(), daily = _a[0], weekly = _a[1], monthly = _a[2], allTime = _a[3];
                res.json({
                    success: true,
                    data: {
                        daily: daily.overall,
                        weekly: weekly.overall,
                        monthly: monthly.overall,
                        allTime: allTime.overall,
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                res.status(500).json({
                    success: false,
                    error: error_5.message,
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
