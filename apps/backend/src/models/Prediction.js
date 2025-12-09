"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prediction = void 0;
var mongoose_1 = require("mongoose");
var PredictionSchema = new mongoose_1.Schema({
    fixtureId: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: { type: String, required: true },
    market: { type: String, required: true },
    prediction: { type: String, required: true },
    odds: { type: Number, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    value: { type: Number }, // Value bet percentage
    aiReasoning: { type: String },
    isGoldenBet: { type: Boolean, default: false },
    result: { type: String, enum: ['win', 'loss', 'pending'], default: 'pending' },
    profit: { type: Number, default: 0 },
}, {
    timestamps: true
});
// Indexes for efficient queries
PredictionSchema.index({ date: -1 });
PredictionSchema.index({ isGoldenBet: 1, date: -1 });
PredictionSchema.index({ result: 1 });
PredictionSchema.index({ value: -1 }); // Index for value bet queries
exports.Prediction = mongoose_1.default.model('Prediction', PredictionSchema);
