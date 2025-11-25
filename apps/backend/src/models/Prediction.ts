import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  fixtureId: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  odds: number;
  confidence: number;
  value?: number; // Value bet percentage (AI% - Bookie%)
  aiReasoning?: string;
  isGoldenBet: boolean;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PredictionSchema = new Schema<IPrediction>({
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

export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);
