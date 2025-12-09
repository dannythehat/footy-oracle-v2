"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fixture = void 0;
var mongoose_1 = require("mongoose");
var FixtureSchema = new mongoose_1.Schema({
    fixtureId: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeTeamId: { type: Number, required: true }, // NEW
    awayTeamId: { type: Number, required: true }, // NEW
    league: { type: String, required: true },
    leagueId: { type: Number, required: true }, // NEW
    country: { type: String, required: true },
    season: { type: Number, required: true }, // NEW
    odds: {
        homeWin: Number,
        draw: Number,
        awayWin: Number,
        btts: Number,
        over25: Number,
        under25: Number,
        over35cards: Number,
        over95corners: Number,
    },
    aiBets: {
        bts: {
            percentage: { type: Number, min: 0, max: 100 },
            confidence: { type: String, enum: ['high', 'medium', 'low'] },
            revealed: { type: Boolean, default: false }
        },
        over25: {
            percentage: { type: Number, min: 0, max: 100 },
            confidence: { type: String, enum: ['high', 'medium', 'low'] },
            revealed: { type: Boolean, default: false }
        },
        over35cards: {
            percentage: { type: Number, min: 0, max: 100 },
            confidence: { type: String, enum: ['high', 'medium', 'low'] },
            revealed: { type: Boolean, default: false }
        },
        over95corners: {
            percentage: { type: Number, min: 0, max: 100 },
            confidence: { type: String, enum: ['high', 'medium', 'low'] },
            revealed: { type: Boolean, default: false }
        },
        goldenBet: {
            type: { type: String, enum: ['bts', 'over25', 'over35cards', 'over95corners'] },
            percentage: { type: Number, min: 0, max: 100 },
            reasoning: String,
            revealed: { type: Boolean, default: false }
        },
        generatedAt: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'finished', 'postponed'],
        default: 'scheduled'
    },
    statusShort: String,
    elapsed: Number,
    homeScore: Number, // Top-level for easy access
    awayScore: Number, // Top-level for easy access
    score: {
        home: Number,
        away: Number,
    },
    statistics: {
        home: {
            shotsOnGoal: Number,
            shotsOffGoal: Number,
            shotsInsideBox: Number,
            shotsOutsideBox: Number,
            totalShots: Number,
            blockedShots: Number,
            fouls: Number,
            cornerKicks: Number,
            offsides: Number,
            ballPossession: String,
            yellowCards: Number,
            redCards: Number,
            goalkeeperSaves: Number,
            totalPasses: Number,
            passesAccurate: Number,
            passesPercentage: String,
        },
        away: {
            shotsOnGoal: Number,
            shotsOffGoal: Number,
            shotsInsideBox: Number,
            shotsOutsideBox: Number,
            totalShots: Number,
            blockedShots: Number,
            fouls: Number,
            cornerKicks: Number,
            offsides: Number,
            ballPossession: String,
            yellowCards: Number,
            redCards: Number,
            goalkeeperSaves: Number,
            totalPasses: Number,
            passesAccurate: Number,
            passesPercentage: String,
        }
    },
    lastUpdated: Date
}, {
    timestamps: true
});
// Indexes
FixtureSchema.index({ date: 1 });
FixtureSchema.index({ league: 1 });
FixtureSchema.index({ leagueId: 1 }); // NEW: For efficient filtering
FixtureSchema.index({ status: 1 });
FixtureSchema.index({ homeTeamId: 1 }); // NEW: For team queries
FixtureSchema.index({ awayTeamId: 1 }); // NEW: For team queries
FixtureSchema.index({ 'aiBets.generatedAt': 1 });
FixtureSchema.index({ lastUpdated: 1 }); // NEW: For live updates
exports.Fixture = mongoose_1.default.model('Fixture', FixtureSchema);
