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
exports.fetchFixtures = fetchFixtures;
exports.fetchOdds = fetchOdds;
exports.fetchH2H = fetchH2H;
exports.fetchStandings = fetchStandings;
exports.fetchStatistics = fetchStatistics;
exports.fetchEvents = fetchEvents;
exports.fetchFixtureStats = fetchFixtureStats;
exports.fetchTeamLastFixtures = fetchTeamLastFixtures;
exports.fetchFixturesWithOdds = fetchFixturesWithOdds;
var axios_1 = require("axios");
var API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";
var API_KEY = process.env.API_FOOTBALL_KEY;
if (!API_KEY) {
    console.warn("⚠️ API_FOOTBALL_KEY not set!");
}
var apiClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: {
        "x-apisports-key": API_KEY,
    },
    timeout: 20000,
});
/** MAP STATUS */
function mapStatus(short) {
    var liveCodes = ["1H", "2H", "ET", "P", "BT", "HT"];
    if (short === "FT")
        return "finished";
    if (liveCodes.includes(short))
        return "live";
    return "scheduled";
}
/** Fetch Fixtures by Date */
function fetchFixtures(date) {
    return __awaiter(this, void 0, void 0, function () {
        var response, list;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCC5 Fetching fixtures for ".concat(date, "..."));
                    return [4 /*yield*/, apiClient.get("/fixtures", {
                            params: { date: date },
                        })];
                case 1:
                    response = _a.sent();
                    list = response.data.response || [];
                    return [2 /*return*/, list.map(function (f) {
                            var _a, _b;
                            return ({
                                fixtureId: f.fixture.id,
                                date: f.fixture.date,
                                homeTeam: f.teams.home.name,
                                awayTeam: f.teams.away.name,
                                homeTeamId: f.teams.home.id,
                                awayTeamId: f.teams.away.id,
                                league: f.league.name,
                                leagueId: f.league.id,
                                country: f.league.country,
                                season: f.league.season,
                                status: mapStatus(f.fixture.status.short),
                                score: {
                                    home: (_a = f.goals.home) !== null && _a !== void 0 ? _a : null,
                                    away: (_b = f.goals.away) !== null && _b !== void 0 ? _b : null,
                                },
                            });
                        })];
            }
        });
    });
}
/** Fetch Odds with fallback bookmakers */
function fetchOdds(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var bookmakers, _loop_1, _i, bookmakers_1, bookmaker, state_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    bookmakers = [
                        { id: 8, name: "Bet365" },
                        { id: 6, name: "Bwin" },
                        { id: 11, name: "Williamhill" }
                    ];
                    _loop_1 = function (bookmaker) {
                        function get(bid, value) {
                            var _a, _b;
                            var market = bets_1.find(function (b) { return b.id === bid; });
                            return (_b = (_a = market === null || market === void 0 ? void 0 : market.values) === null || _a === void 0 ? void 0 : _a.find(function (v) { return v.value === value; })) === null || _b === void 0 ? void 0 : _b.odd;
                        }
                        var response, res, bets_1, odds, hasOdds, err_1;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    console.log("\uD83D\uDCB0 Fetching odds for fixture ".concat(fixtureId, " from ").concat(bookmaker.name, "..."));
                                    return [4 /*yield*/, apiClient.get("/odds", {
                                            params: {
                                                fixture: fixtureId,
                                                bookmaker: bookmaker.id,
                                            },
                                        })];
                                case 1:
                                    response = _d.sent();
                                    res = response.data.response[0];
                                    if (!res || !((_b = (_a = res.bookmakers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.bets)) {
                                        console.log("\u26A0\uFE0F  No odds from ".concat(bookmaker.name, " for fixture ").concat(fixtureId));
                                        return [2 /*return*/, "continue"];
                                    }
                                    bets_1 = res.bookmakers[0].bets;
                                    odds = {
                                        homeWin: get(1, "Home"),
                                        draw: get(1, "Draw"),
                                        awayWin: get(1, "Away"),
                                        btts: get(8, "Yes"),
                                        over25: get(5, "Over 2.5"),
                                        under25: get(5, "Under 2.5"),
                                        over95corners: get(12, "Over 9.5"),
                                        over35cards: get(11, "Over 3.5"),
                                    };
                                    hasOdds = Object.values(odds).some(function (odd) { return odd !== undefined; });
                                    if (hasOdds) {
                                        console.log("\u2705 Got odds for fixture ".concat(fixtureId, " from ").concat(bookmaker.name));
                                        return [2 /*return*/, { value: odds }];
                                    }
                                    else {
                                        console.log("\u26A0\uFE0F  ".concat(bookmaker.name, " returned empty odds for fixture ").concat(fixtureId));
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    err_1 = _d.sent();
                                    console.warn("\u274C Error fetching odds from ".concat(bookmaker.name, ":"), err_1.message);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, bookmakers_1 = bookmakers;
                    _c.label = 1;
                case 1:
                    if (!(_i < bookmakers_1.length)) return [3 /*break*/, 4];
                    bookmaker = bookmakers_1[_i];
                    return [5 /*yield**/, _loop_1(bookmaker)];
                case 2:
                    state_1 = _c.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // No bookmaker had odds
                    console.warn("\u26A0\uFE0F  No odds available from any bookmaker for fixture ".concat(fixtureId));
                    return [2 /*return*/, null];
            }
        });
    });
}
/** Fetch H2H */
function fetchH2H(homeTeamId_1, awayTeamId_1) {
    return __awaiter(this, arguments, void 0, function (homeTeamId, awayTeamId, last) {
        var response, list;
        if (last === void 0) { last = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDD04 Fetching H2H: ".concat(homeTeamId, " vs ").concat(awayTeamId));
                    return [4 /*yield*/, apiClient.get("/fixtures/headtohead", {
                            params: {
                                h2h: "".concat(homeTeamId, "-").concat(awayTeamId),
                                last: last,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    list = response.data.response || [];
                    return [2 /*return*/, list.map(function (f) { return ({
                            fixtureId: f.fixture.id,
                            date: f.fixture.date,
                            homeTeam: f.teams.home.name,
                            awayTeam: f.teams.away.name,
                            homeScore: f.goals.home,
                            awayScore: f.goals.away,
                            status: mapStatus(f.fixture.status.short),
                        }); })];
            }
        });
    });
}
/** Fetch Standings */
function fetchStandings(leagueId, season) {
    return __awaiter(this, void 0, void 0, function () {
        var response, standings;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log("\uD83D\uDCCA Fetching standings for league ".concat(leagueId, ", season ").concat(season));
                    return [4 /*yield*/, apiClient.get("/standings", {
                            params: {
                                league: leagueId,
                                season: season,
                            },
                        })];
                case 1:
                    response = _e.sent();
                    standings = ((_d = (_c = (_b = (_a = response.data.response) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.league) === null || _c === void 0 ? void 0 : _c.standings) === null || _d === void 0 ? void 0 : _d[0]) || [];
                    return [2 /*return*/, standings.map(function (team) { return ({
                            rank: team.rank,
                            teamId: team.team.id,
                            teamName: team.team.name,
                            teamLogo: team.team.logo,
                            points: team.points,
                            played: team.all.played,
                            win: team.all.win,
                            draw: team.all.draw,
                            lose: team.all.lose,
                            goalsFor: team.all.goals.for,
                            goalsAgainst: team.all.goals.against,
                            goalsDiff: team.goalsDiff,
                            form: team.form,
                        }); })];
            }
        });
    });
}
/** Fetch Statistics */
function fetchStatistics(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        function getStat(stats, type) {
            var _a;
            var stat = stats.find(function (s) { return s.type === type; });
            return (_a = stat === null || stat === void 0 ? void 0 : stat.value) !== null && _a !== void 0 ? _a : null;
        }
        var response, data, homeStats, awayStats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCC8 Fetching statistics for fixture ".concat(fixtureId));
                    return [4 /*yield*/, apiClient.get("/fixtures/statistics", {
                            params: { fixture: fixtureId },
                        })];
                case 1:
                    response = _a.sent();
                    data = response.data.response || [];
                    if (data.length < 2) {
                        console.warn("\u26A0\uFE0F  Incomplete statistics for fixture ".concat(fixtureId));
                        return [2 /*return*/, null];
                    }
                    homeStats = data[0].statistics;
                    awayStats = data[1].statistics;
                    return [2 /*return*/, {
                            home: {
                                shotsOnGoal: getStat(homeStats, "Shots on Goal"),
                                shotsOffGoal: getStat(homeStats, "Shots off Goal"),
                                totalShots: getStat(homeStats, "Total Shots"),
                                blockedShots: getStat(homeStats, "Blocked Shots"),
                                shotsInsideBox: getStat(homeStats, "Shots insidebox"),
                                shotsOutsideBox: getStat(homeStats, "Shots outsidebox"),
                                fouls: getStat(homeStats, "Fouls"),
                                cornerKicks: getStat(homeStats, "Corner Kicks"),
                                offsides: getStat(homeStats, "Offsides"),
                                ballPossession: getStat(homeStats, "Ball Possession"),
                                yellowCards: getStat(homeStats, "Yellow Cards"),
                                redCards: getStat(homeStats, "Red Cards"),
                                goalkeeperSaves: getStat(homeStats, "Goalkeeper Saves"),
                                totalPasses: getStat(homeStats, "Total passes"),
                                passesAccurate: getStat(homeStats, "Passes accurate"),
                                passesPercentage: getStat(homeStats, "Passes %"),
                            },
                            away: {
                                shotsOnGoal: getStat(awayStats, "Shots on Goal"),
                                shotsOffGoal: getStat(awayStats, "Shots off Goal"),
                                totalShots: getStat(awayStats, "Total Shots"),
                                blockedShots: getStat(awayStats, "Blocked Shots"),
                                shotsInsideBox: getStat(awayStats, "Shots insidebox"),
                                shotsOutsideBox: getStat(awayStats, "Shots outsidebox"),
                                fouls: getStat(awayStats, "Fouls"),
                                cornerKicks: getStat(awayStats, "Corner Kicks"),
                                offsides: getStat(awayStats, "Offsides"),
                                ballPossession: getStat(awayStats, "Ball Possession"),
                                yellowCards: getStat(awayStats, "Yellow Cards"),
                                redCards: getStat(awayStats, "Red Cards"),
                                goalkeeperSaves: getStat(awayStats, "Goalkeeper Saves"),
                                totalPasses: getStat(awayStats, "Total passes"),
                                passesAccurate: getStat(awayStats, "Passes accurate"),
                                passesPercentage: getStat(awayStats, "Passes %"),
                            },
                        }];
            }
        });
    });
}
/** Fetch Events */
function fetchEvents(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, events;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u26BD Fetching events for fixture ".concat(fixtureId));
                    return [4 /*yield*/, apiClient.get("/fixtures/events", {
                            params: { fixture: fixtureId },
                        })];
                case 1:
                    response = _a.sent();
                    events = response.data.response || [];
                    return [2 /*return*/, events.map(function (e) { return ({
                            time: e.time.elapsed,
                            timeExtra: e.time.extra,
                            team: e.team.name,
                            player: e.player.name,
                            assist: e.assist.name,
                            type: e.type,
                            detail: e.detail,
                            comments: e.comments,
                        }); })];
            }
        });
    });
}
function fetchFixtureStats() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); });
}
function fetchTeamLastFixtures() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); });
}
function fetchFixturesWithOdds() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, null];
    }); });
}
