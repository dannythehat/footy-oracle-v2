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
var notificationService_js_1 = require("../services/notificationService.js");
var betBuilderService_js_1 = require("../services/betBuilderService.js");
var BetBuilder_js_1 = require("../models/BetBuilder.js");
var router = (0, express_1.Router)();
// In-memory storage for subscribers (replace with database in production)
var subscribers = new Map();
/**
 * POST /api/notifications/subscribe
 * Subscribe to bet builder notifications
 */
router.post('/subscribe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, name_1, preferences;
    return __generator(this, function (_b) {
        try {
            _a = req.body, email = _a.email, name_1 = _a.name, preferences = _a.preferences;
            if (!email || !email.includes('@')) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: 'Valid email address is required',
                    })];
            }
            subscribers.set(email, {
                email: email,
                name: name_1,
                preferences: preferences || {
                    dailyDigest: true,
                    results: true,
                    highConfidence: true,
                },
            });
            res.json({
                success: true,
                message: 'Successfully subscribed to bet builder notifications',
                data: { email: email, name: name_1 },
            });
        }
        catch (error) {
            console.error('Error subscribing to notifications:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from bet builder notifications
 */
router.post('/unsubscribe', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, existed;
    return __generator(this, function (_a) {
        try {
            email = req.body.email;
            if (!email) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: 'Email address is required',
                    })];
            }
            existed = subscribers.has(email);
            subscribers.delete(email);
            res.json({
                success: true,
                message: existed
                    ? 'Successfully unsubscribed from notifications'
                    : 'Email was not subscribed',
            });
        }
        catch (error) {
            console.error('Error unsubscribing from notifications:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * GET /api/notifications/subscribers
 * Get list of subscribers (admin only)
 */
router.get('/subscribers', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var subscriberList;
    return __generator(this, function (_a) {
        try {
            subscriberList = Array.from(subscribers.values());
            res.json({
                success: true,
                data: subscriberList,
                count: subscriberList.length,
            });
        }
        catch (error) {
            console.error('Error fetching subscribers:', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * POST /api/notifications/send-daily
 * Send daily bet builder digest to all subscribers
 */
router.post('/send-daily', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var betBuilders, subscriberList, emails, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, betBuilderService_js_1.getTodaysBetBuilders)()];
            case 1:
                betBuilders = _a.sent();
                if (betBuilders.length === 0) {
                    return [2 /*return*/, res.json({
                            success: true,
                            message: 'No bet builders to send today',
                            sent: 0,
                        })];
                }
                subscriberList = Array.from(subscribers.values())
                    .filter(function (s) { var _a; return ((_a = s.preferences) === null || _a === void 0 ? void 0 : _a.dailyDigest) !== false; });
                if (subscriberList.length === 0) {
                    return [2 /*return*/, res.json({
                            success: true,
                            message: 'No subscribers to send to',
                            sent: 0,
                        })];
                }
                emails = subscriberList.map(function (s) { return s.email; });
                return [4 /*yield*/, (0, notificationService_js_1.sendBetBuilderNotification)(emails, betBuilders)];
            case 2:
                _a.sent();
                res.json({
                    success: true,
                    message: "Daily digest sent to ".concat(emails.length, " subscriber(s)"),
                    sent: emails.length,
                    betBuilders: betBuilders.length,
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error sending daily digest:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1.message,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/notifications/send-result/:id
 * Send bet builder result notification
 */
router.post('/send-result/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var betBuilder, subscriberList, emails, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, BetBuilder_js_1.BetBuilder.findById(req.params.id)];
            case 1:
                betBuilder = _a.sent();
                if (!betBuilder) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Bet builder not found',
                        })];
                }
                if (!betBuilder.result || betBuilder.result === 'pending') {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Bet builder result is not yet available',
                        })];
                }
                subscriberList = Array.from(subscribers.values())
                    .filter(function (s) { var _a; return ((_a = s.preferences) === null || _a === void 0 ? void 0 : _a.results) !== false; });
                if (subscriberList.length === 0) {
                    return [2 /*return*/, res.json({
                            success: true,
                            message: 'No subscribers to send to',
                            sent: 0,
                        })];
                }
                emails = subscriberList.map(function (s) { return s.email; });
                return [4 /*yield*/, (0, notificationService_js_1.sendBetBuilderResult)(emails, betBuilder)];
            case 2:
                _a.sent();
                res.json({
                    success: true,
                    message: "Result notification sent to ".concat(emails.length, " subscriber(s)"),
                    sent: emails.length,
                    result: betBuilder.result,
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error sending result notification:', error_2);
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
 * POST /api/notifications/test
 * Send test notification to a specific email
 */
router.post('/test', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, betBuilders, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                email = req.body.email;
                if (!email || !email.includes('@')) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Valid email address is required',
                        })];
                }
                return [4 /*yield*/, (0, betBuilderService_js_1.getTodaysBetBuilders)()];
            case 1:
                betBuilders = _a.sent();
                if (betBuilders.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'No bet builders available to send',
                        })];
                }
                return [4 /*yield*/, (0, notificationService_js_1.sendBetBuilderNotification)([email], betBuilders.slice(0, 2))];
            case 2:
                _a.sent();
                res.json({
                    success: true,
                    message: "Test notification sent to ".concat(email),
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('Error sending test notification:', error_3);
                res.status(500).json({
                    success: false,
                    error: error_3.message,
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
