import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketPrediction {
  market: string;
  marketName: string;
  confidence: number;
  probability: number;
  estimatedOdds: number;
}

export interface IBetBuilder extends Document {
  fixtureId: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: Date;
  markets: IMarketPrediction[];
  combinedConfidence: number;
  estimatedCombinedOdds: number;
  aiReasoning?: string;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketPredictionSchema = new Schema<IMarketPrediction>({
  market: { type: String, required: true },
  marketName: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  probability: { type: Number, required: true, min: 0, max: 1 },
  estimatedOdds: { type: Number, required: true, min: 1 },
}, { _id: false });

const BetBuilderSchema = new Schema<IBetBuilder>({
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

export const BetBuilder = mongoose.model<IBetBuilder>('BetBuilder', BetBuilderSchema);
