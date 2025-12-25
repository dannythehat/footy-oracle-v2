import mongoose, { Schema, Document } from 'mongoose';

export interface IBetHistory extends Document {
  date: Date;
  betType: 'golden_bet' | 'bet_builder';
  
  // For Golden Bets
  fixtureId?: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: Date;
  market?: string; // For single bets
  selection?: string;
  
  // For Bet Builders
  markets?: Array<{
    market: string;
    prediction: string;
    confidence: number;
  }>;
  
  // Common fields
  confidence: number;
  odds: number | null;
  aiCommentary: string;
  
  // Results
  result: 'win' | 'loss' | 'pending' | 'void';
  stake: number;
  profitLoss: number;
  
  // Screenshot/proof
  snapshotUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const BetHistorySchema = new Schema<IBetHistory>({
  date: { type: Date, required: true, index: true },
  betType: { 
    type: String, 
    required: true, 
    enum: ['golden_bet', 'bet_builder'],
    index: true 
  },
  
  fixtureId: { type: Number },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  league: { type: String, required: true },
  kickoff: { type: Date, required: true },
  market: { type: String },
  selection: { type: String },
  
  markets: [{
    market: { type: String, required: true },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true }
  }],
  
  confidence: { type: Number, required: true, min: 0, max: 100 },
  odds: { type: Number },
  aiCommentary: { type: String, required: true },
  
  result: { 
    type: String, 
    enum: ['win', 'loss', 'pending', 'void'], 
    default: 'pending',
    index: true
  },
  stake: { type: Number, default: 10 }, // Default £10 stake
  profitLoss: { type: Number, default: 0 },
  
  snapshotUrl: { type: String },
}, {
  timestamps: true
});

// Indexes for efficient queries
BetHistorySchema.index({ date: -1, betType: 1 });
BetHistorySchema.index({ result: 1, date: -1 });
BetHistorySchema.index({ createdAt: -1 });

export const BetHistory = mongoose.model<IBetHistory>('BetHistory', BetHistorySchema);
