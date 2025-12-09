"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetBuilder = void 0;
var mongoose_1 = require("mongoose");
var MarketPredictionSchema = new mongoose_1.Schema({
    market: { type: String, required: true },
    marketName: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    probability: { type: Number, required: true, min: 0, max: 1 },
    estimatedOdds: { type: Number, required: true, min: 1 },
}, { _id: false });
var BetBuilderSchema = new mongoose_1.Schema({
    fixtureId: { type: Number, required: true },
    date: { type: Date, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: { type: String, required: true },
    kickoff: { type: Date, required: true },
    markets: { type: [MarketPredictionSchema], required: true },
    combinedConfidence: { type: Number, required: true, min: 0, max: 100 },
    estimatedCombinedOdds: { type: Number, required: true, min: 1 },
    aiReasoning: { type: String },
    result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
    profit: { type: Number, default: 0 },
}, {
    timestamps: true
});
// Indexes for efficient queries
BetBuilderSchema.index({ date: -1 });
BetBuilderSchema.index({ combinedConfidence: -1 });
BetBuilderSchema.index({ league: 1, date: -1 });
BetBuilderSchema.index({ result: 1 });
// Compound index for today's bet builders
BetBuilderSchema.index({ date: 1, combinedConfidence: -1 });
exports.BetBuilder = mongoose_1.default.model('BetBuilder', BetBuilderSchema);
