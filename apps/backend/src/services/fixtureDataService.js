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
exports.getCompleteFixtureData = getCompleteFixtureData;
exports.fetchFixtureById = fetchFixtureById;
exports.fetchFixtureStatistics = fetchFixtureStatistics;
exports.fetchFixtureEvents = fetchFixtureEvents;
exports.fetchH2H = fetchH2H;
exports.fetchStandings = fetchStandings;
exports.fetchTeamUpcoming = fetchTeamUpcoming;
var axios_1 = require("axios");
var API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io';
var API_KEY = process.env.API_FOOTBALL_KEY;
if (!API_KEY) {
    console.warn('⚠️ API_FOOTBALL_KEY not set!');
}
var apiClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: {
        'x-apisports-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    timeout: 15000,
});
/**
 * Fetch complete match data for a fixture from MongoDB
 * This is the MAIN function you should use
 */
function getCompleteFixtureData(fixtureDoc) {
    return __awaiter(this, void 0, void 0, function () {
        var fixtureId, leagueId, season, homeId, awayId, _a, fixture, statistics, events, h2h, standings, homeUpcoming, awayUpcoming, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fixtureId = fixtureDoc.fixtureId;
                    leagueId = fixtureDoc.leagueId;
                    season = fixtureDoc.season;
                    homeId = fixtureDoc.homeTeamId;
                    awayId = fixtureDoc.awayTeamId;
                    console.log("\uD83D\uDCCA Fetching complete data for fixture ".concat(fixtureId));
                    console.log("   Teams: ".concat(homeId, " vs ").concat(awayId));
                    console.log("   League: ".concat(leagueId, ", Season: ").concat(season));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.allSettled([
                            fetchFixtureById(fixtureId),
                            fetchFixtureStatistics(fixtureId),
                            fetchFixtureEvents(fixtureId),
                            fetchH2H(homeId, awayId),
                            fetchStandings(leagueId, season),
                            fetchTeamUpcoming(homeId),
                            fetchTeamUpcoming(awayId)
                        ])];
                case 2:
                    _a = _b.sent(), fixture = _a[0], statistics = _a[1], events = _a[2], h2h = _a[3], standings = _a[4], homeUpcoming = _a[5], awayUpcoming = _a[6];
                    return [2 /*return*/, {
                            fixture: fixture.status === 'fulfilled' ? fixture.value : null,
                            statistics: statistics.status === 'fulfilled' ? statistics.value : null,
                            events: events.status === 'fulfilled' ? events.value : [],
                            h2h: h2h.status === 'fulfilled' ? h2h.value : { matches: [], stats: { totalMatches: 0, homeWins: 0, awayWins: 0, draws: 0, bttsCount: 0, over25Count: 0 } },
                            standings: standings.status === 'fulfilled' && standings.value ? standings.value : [],
                            odds: fixtureDoc.odds ? [fixtureDoc.odds] : [],
                            homeUpcoming: homeUpcoming.status === 'fulfilled' ? homeUpcoming.value : [],
                            awayUpcoming: awayUpcoming.status === 'fulfilled' ? awayUpcoming.value : []
                        }];
                case 3:
                    error_1 = _b.sent();
                    console.error('❌ Error fetching complete fixture data:', error_1.message);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch fixture by ID
 */
function fetchFixtureById(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, fixture, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("\uD83C\uDFAF Fetching fixture ".concat(fixtureId));
                    return [4 /*yield*/, apiClient.get('/fixtures', {
                            params: { id: fixtureId }
                        })];
                case 1:
                    response = _b.sent();
                    fixture = (_a = response.data.response) === null || _a === void 0 ? void 0 : _a[0];
                    if (!fixture) {
                        throw new Error('Fixture not found');
                    }
                    return [2 /*return*/, fixture];
                case 2:
                    error_2 = _b.sent();
                    console.error("\u274C Error fetching fixture ".concat(fixtureId, ":"), error_2.message);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch fixture statistics (shots, possession, corners, etc.)
 * CRITICAL: Use parameter 'fixture' not 'fixture_id'
 * Returns data in format matching frontend MatchStats component
 */
function fetchFixtureStatistics(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, stats, homeStats, awayStats, getStat, parsePossession, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("\uD83D\uDCCA Fetching statistics for fixture ".concat(fixtureId));
                    return [4 /*yield*/, apiClient.get('/fixtures/statistics', {
                            params: { fixture: fixtureId } // ✅ CORRECT: 'fixture' parameter
                        })];
                case 1:
                    response = _a.sent();
                    stats = response.data.response;
                    if (!stats || stats.length < 2) {
                        console.log("\u2139\uFE0F  No statistics available for fixture ".concat(fixtureId));
                        return [2 /*return*/, null];
                    }
                    homeStats = stats[0];
                    awayStats = stats[1];
                    getStat = function (teamStats, key) {
                        var _a;
                        var stat = (_a = teamStats === null || teamStats === void 0 ? void 0 : teamStats.statistics) === null || _a === void 0 ? void 0 : _a.find(function (s) { return s.type === key; });
                        return stat === null || stat === void 0 ? void 0 : stat.value;
                    };
                    parsePossession = function (possessionStr) {
                        if (typeof possessionStr === 'number')
                            return possessionStr;
                        if (typeof possessionStr === 'string') {
                            return parseInt(possessionStr.replace('%', '')) || 0;
                        }
                        return 0;
                    };
                    // Transform to match frontend interface:
                    // interface TeamStats {
                    //   shots?: { total: number; on: number };
                    //   corners?: number;
                    //   fouls?: number;
                    //   yellowCards?: number;
                    //   redCards?: number;
                    //   possession?: number;
                    //   attacks?: number;
                    //   dangerousAttacks?: number;
                    // }
                    return [2 /*return*/, {
                            home: {
                                shots: {
                                    total: parseInt(getStat(homeStats, 'Total Shots')) || 0,
                                    on: parseInt(getStat(homeStats, 'Shots on Goal')) || 0,
                                },
                                possession: parsePossession(getStat(homeStats, 'Ball Possession')),
                                corners: parseInt(getStat(homeStats, 'Corner Kicks')) || 0,
                                fouls: parseInt(getStat(homeStats, 'Fouls')) || 0,
                                yellowCards: parseInt(getStat(homeStats, 'Yellow Cards')) || 0,
                                redCards: parseInt(getStat(homeStats, 'Red Cards')) || 0,
                                attacks: parseInt(getStat(homeStats, 'Total attacks')) || 0,
                                dangerousAttacks: parseInt(getStat(homeStats, 'Dangerous attacks')) || 0,
                            },
                            away: {
                                shots: {
                                    total: parseInt(getStat(awayStats, 'Total Shots')) || 0,
                                    on: parseInt(getStat(awayStats, 'Shots on Goal')) || 0,
                                },
                                possession: parsePossession(getStat(awayStats, 'Ball Possession')),
                                corners: parseInt(getStat(awayStats, 'Corner Kicks')) || 0,
                                fouls: parseInt(getStat(awayStats, 'Fouls')) || 0,
                                yellowCards: parseInt(getStat(awayStats, 'Yellow Cards')) || 0,
                                redCards: parseInt(getStat(awayStats, 'Red Cards')) || 0,
                                attacks: parseInt(getStat(awayStats, 'Total attacks')) || 0,
                                dangerousAttacks: parseInt(getStat(awayStats, 'Dangerous attacks')) || 0,
                            },
                        }];
                case 2:
                    error_3 = _a.sent();
                    console.error("\u274C Error fetching statistics for fixture ".concat(fixtureId, ":"), error_3.message);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch fixture events (goals, cards, substitutions)
 * CRITICAL: Use parameter 'fixture' not 'fixture_id'
 */
function fetchFixtureEvents(fixtureId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, events, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("\u26BD Fetching events for fixture ".concat(fixtureId));
                    return [4 /*yield*/, apiClient.get('/fixtures/events', {
                            params: { fixture: fixtureId } // ✅ CORRECT: 'fixture' parameter
                        })];
                case 1:
                    response = _a.sent();
                    events = response.data.response || [];
                    console.log("\u2705 Found ".concat(events.length, " events for fixture ").concat(fixtureId));
                    return [2 /*return*/, events];
                case 2:
                    error_4 = _a.sent();
                    console.error("\u274C Error fetching events for fixture ".concat(fixtureId, ":"), error_4.message);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch head-to-head matches
 * CRITICAL: Use parameter 'h2h' with format 'homeId-awayId'
 */
function fetchH2H(homeTeamId_1, awayTeamId_1) {
    return __awaiter(this, arguments, void 0, function (homeTeamId, awayTeamId, last) {
        var response, matches, transformedMatches, homeWins_1, awayWins_1, draws_1, bttsCount_1, over25Count_1, error_5;
        if (last === void 0) { last = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("\uD83D\uDD04 Fetching H2H: ".concat(homeTeamId, " vs ").concat(awayTeamId));
                    return [4 /*yield*/, apiClient.get('/fixtures/headtohead', {
                            params: {
                                h2h: "".concat(homeTeamId, "-").concat(awayTeamId), // ✅ CORRECT: 'h2h' parameter with dash format
                                last: last,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    matches = response.data.response || [];
                    if (matches.length === 0) {
                        return [2 /*return*/, {
                                matches: [],
                                stats: {
                                    totalMatches: 0,
                                    homeWins: 0,
                                    awayWins: 0,
                                    draws: 0,
                                    bttsCount: 0,
                                    over25Count: 0,
                                },
                            }];
                    }
                    transformedMatches = matches.map(function (m) {
                        var _a, _b;
                        return ({
                            date: m.fixture.date,
                            homeTeam: m.teams.home.name,
                            awayTeam: m.teams.away.name,
                            score: {
                                home: (_a = m.goals.home) !== null && _a !== void 0 ? _a : 0,
                                away: (_b = m.goals.away) !== null && _b !== void 0 ? _b : 0,
                            },
                            league: m.league.name,
                        });
                    });
                    homeWins_1 = 0;
                    awayWins_1 = 0;
                    draws_1 = 0;
                    bttsCount_1 = 0;
                    over25Count_1 = 0;
                    transformedMatches.forEach(function (match) {
                        var homeScore = match.score.home;
                        var awayScore = match.score.away;
                        if (homeScore > awayScore)
                            homeWins_1++;
                        else if (awayScore > homeScore)
                            awayWins_1++;
                        else
                            draws_1++;
                        if (homeScore > 0 && awayScore > 0)
                            bttsCount_1++;
                        if (homeScore + awayScore > 2.5)
                            over25Count_1++;
                    });
                    console.log("\u2705 Found ".concat(transformedMatches.length, " H2H matches"));
                    return [2 /*return*/, {
                            matches: transformedMatches,
                            stats: {
                                totalMatches: transformedMatches.length,
                                homeWins: homeWins_1,
                                awayWins: awayWins_1,
                                draws: draws_1,
                                bttsCount: bttsCount_1,
                                over25Count: over25Count_1,
                            },
                        }];
                case 2:
                    error_5 = _a.sent();
                    console.error('❌ Error fetching H2H:', error_5.message);
                    return [2 /*return*/, {
                            matches: [],
                            stats: {
                                totalMatches: 0,
                                homeWins: 0,
                                awayWins: 0,
                                draws: 0,
                                bttsCount: 0,
                                over25Count: 0,
                            },
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch league standings
 * CRITICAL: Use parameters 'league' and 'season'
 * Returns empty array [] instead of null when not available
 */
function fetchStandings(leagueId, season) {
    return __awaiter(this, void 0, void 0, function () {
        var response, standings, error_6;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    console.log("\uD83C\uDFC6 Fetching standings for league ".concat(leagueId, ", season ").concat(season));
                    return [4 /*yield*/, apiClient.get('/standings', {
                            params: {
                                league: leagueId, // ✅ CORRECT: 'league' parameter
                                season: season // ✅ CORRECT: 'season' parameter
                            },
                        })];
                case 1:
                    response = _d.sent();
                    standings = (_c = (_b = (_a = response.data.response) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.league) === null || _c === void 0 ? void 0 : _c.standings;
                    if (!standings || standings.length === 0) {
                        console.log("\u2139\uFE0F  No standings available for league ".concat(leagueId));
                        return [2 /*return*/, []]; // ✅ Return empty array instead of null
                    }
                    console.log("\u2705 Found standings for league ".concat(leagueId));
                    return [2 /*return*/, standings];
                case 2:
                    error_6 = _d.sent();
                    console.error("\u274C Error fetching standings for league ".concat(leagueId, ":"), error_6.message);
                    return [2 /*return*/, []]; // ✅ Return empty array instead of null
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch upcoming fixtures for a team
 * CRITICAL: Use parameters 'team' and 'next'
 */
function fetchTeamUpcoming(teamId_1) {
    return __awaiter(this, arguments, void 0, function (teamId, next) {
        var response, fixtures, error_7;
        if (next === void 0) { next = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("\uD83D\uDCC5 Fetching upcoming fixtures for team ".concat(teamId));
                    return [4 /*yield*/, apiClient.get('/fixtures', {
                            params: {
                                team: teamId, // ✅ CORRECT: 'team' parameter
                                next: next, // ✅ CORRECT: 'next' parameter
                            },
                        })];
                case 1:
                    response = _a.sent();
                    fixtures = response.data.response || [];
                    console.log("\u2705 Found ".concat(fixtures.length, " upcoming fixtures for team ").concat(teamId));
                    return [2 /*return*/, fixtures];
                case 2:
                    error_7 = _a.sent();
                    console.error("\u274C Error fetching upcoming fixtures for team ".concat(teamId, ":"), error_7.message);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
