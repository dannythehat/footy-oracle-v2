"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedSelection = void 0;
var mongoose_1 = require("mongoose");
var FeaturedSelectionSchema = new mongoose_1.Schema({
    selectionType: {
        type: String,
        required: true,
        enum: ['golden-bet', 'bet-builder', 'value-bet'],
        index: true
    },
    fixtureId: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    kickoff: { type: Date, required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: { type: String, required: true, index: true },
    market: { type: String, required: true },
    prediction: { type: String, required: true },
    odds: { type: Number, required: true, min: 1 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    value: { type: Number },
    markets: [{
            market: { type: String },
            marketName: { type: String },
            confidence: { type: Number, min: 0, max: 100 },
            probability: { type: Number, min: 0, max: 1 },
            estimatedOdds: { type: Number, min: 1 },
        }],
    combinedOdds: { type: Number },
    aiReasoning: { type: String },
    result: {
        type: String,
        enum: ['win', 'loss', 'pending', 'void'],
        default: 'pending',
        index: true
    },
    settledAt: { type: Date },
    stake: { type: Number, required: true, default: 10 },
    profit: { type: Number, default: 0 },
    featured: { type: Boolean, default: true },
    featuredAt: { type: Date },
}, {
    timestamps: true
});
// Compound indexes for efficient queries
FeaturedSelectionSchema.index({ selectionType: 1, date: -1 });
FeaturedSelectionSchema.index({ result: 1, date: -1 });
FeaturedSelectionSchema.index({ selectionType: 1, result: 1 });
FeaturedSelectionSchema.index({ date: -1, featured: 1 });
// Virtual for display name
FeaturedSelectionSchema.virtual('displayName').get(function () {
    return "".concat(this.homeTeam, " vs ").concat(this.awayTeam);
});
// Method to calculate profit based on result
FeaturedSelectionSchema.methods.calculateProfit = function () {
    if (this.result === 'win') {
        this.profit = (this.odds - 1) * this.stake;
    }
    else if (this.result === 'loss') {
        this.profit = -this.stake;
    }
    else if (this.result === 'void') {
        this.profit = 0;
    }
    return this.profit;
};
exports.FeaturedSelection = mongoose_1.default.model('FeaturedSelection', FeaturedSelectionSchema);
