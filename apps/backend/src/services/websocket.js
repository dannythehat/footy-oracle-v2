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
exports.wsService = void 0;
var ws_1 = require("ws");
var LiveScoreWebSocketService = /** @class */ (function () {
    function LiveScoreWebSocketService() {
        this.wss = null;
        this.clients = new Map();
        this.updateInterval = null;
    }
    LiveScoreWebSocketService.prototype.initialize = function (server) {
        var _this = this;
        this.wss = new ws_1.WebSocketServer({ server: server, path: '/ws' });
        this.wss.on('connection', function (ws) {
            console.log('✅ New WebSocket client connected');
            var client = {
                ws: ws,
                subscribedFixtures: new Set(),
            };
            _this.clients.set(ws, client);
            ws.on('message', function (data) {
                try {
                    var message = JSON.parse(data.toString());
                    _this.handleMessage(client, message);
                }
                catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            });
            ws.on('close', function () {
                console.log('Client disconnected');
                _this.clients.delete(ws);
            });
            ws.on('error', function (error) {
                console.error('WebSocket error:', error);
                _this.clients.delete(ws);
            });
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Footy Oracle live scores',
            }));
        });
        // Start periodic updates
        this.startPeriodicUpdates();
        console.log('🚀 WebSocket server initialized');
    };
    LiveScoreWebSocketService.prototype.handleMessage = function (client, message) {
        switch (message.type) {
            case 'subscribe':
                if (message.fixtureId) {
                    client.subscribedFixtures.add(message.fixtureId);
                    console.log("Client subscribed to fixture ".concat(message.fixtureId));
                }
                break;
            case 'unsubscribe':
                if (message.fixtureId) {
                    client.subscribedFixtures.delete(message.fixtureId);
                    console.log("Client unsubscribed from fixture ".concat(message.fixtureId));
                }
                break;
            case 'ping':
                client.ws.send(JSON.stringify({ type: 'pong' }));
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    };
    LiveScoreWebSocketService.prototype.startPeriodicUpdates = function () {
        var _this = this;
        // Update every 30 seconds
        this.updateInterval = setInterval(function () {
            _this.fetchAndBroadcastUpdates();
        }, 30000);
    };
    LiveScoreWebSocketService.prototype.fetchAndBroadcastUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var subscribedFixtures, _i, subscribedFixtures_1, fixtureId, liveScore, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        subscribedFixtures = new Set();
                        this.clients.forEach(function (client) {
                            client.subscribedFixtures.forEach(function (fixtureId) {
                                subscribedFixtures.add(fixtureId);
                            });
                        });
                        if (subscribedFixtures.size === 0)
                            return [2 /*return*/];
                        _i = 0, subscribedFixtures_1 = subscribedFixtures;
                        _a.label = 1;
                    case 1:
                        if (!(_i < subscribedFixtures_1.length)) return [3 /*break*/, 6];
                        fixtureId = subscribedFixtures_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.fetchLiveScore(fixtureId)];
                    case 3:
                        liveScore = _a.sent();
                        if (liveScore) {
                            this.broadcastToSubscribers(fixtureId, liveScore);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to fetch live score for fixture ".concat(fixtureId, ":"), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    LiveScoreWebSocketService.prototype.fetchLiveScore = function (fixtureId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Integrate with API-Football to get real-time scores
                // For now, return mock data structure
                return [2 /*return*/, {
                        fixtureId: fixtureId,
                        homeScore: 0,
                        awayScore: 0,
                        status: 'LIVE',
                        elapsed: 45,
                        events: [],
                    }];
            });
        });
    };
    LiveScoreWebSocketService.prototype.broadcastToSubscribers = function (fixtureId, data) {
        this.clients.forEach(function (client) {
            if (client.subscribedFixtures.has(fixtureId)) {
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.send(JSON.stringify(data));
                }
            }
        });
    };
    // Manual broadcast method for external triggers
    LiveScoreWebSocketService.prototype.broadcast = function (fixtureId, data) {
        this.broadcastToSubscribers(fixtureId, data);
    };
    LiveScoreWebSocketService.prototype.shutdown = function () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.wss) {
            this.wss.close();
        }
        this.clients.clear();
    };
    return LiveScoreWebSocketService;
}());
exports.wsService = new LiveScoreWebSocketService();
