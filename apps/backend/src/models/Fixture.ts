import mongoose, { Schema, Document } from 'mongoose';

export interface IAIBettingInsight {
  percentage: number;
  confidence: 'high' | 'medium' | 'low';
  revealed: boolean;
}

export interface IGoldenBet {
  type: 'bts' | 'over25' | 'over35cards' | 'over95corners';
  percentage: number;
  reasoning: string;
  revealed: boolean;
}

export interface IFixture extends Document {
  fixtureId: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;  // NEW: Required for H2H and stats
  awayTeamId: number;  // NEW: Required for H2H and stats
  league: string;
  leagueId: number;    // NEW: Required for stats and filtering
  country: string;
  season: number;      // NEW: Required for stats queries
  odds: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    btts?: number;
    over25?: number;
    under25?: number;
    over35cards?: number;
    over95corners?: number;
  };
  // AI Betting Insights (generated 48 hours before kickoff)
  aiBets?: {
    bts: IAIBettingInsight;
    over25: IAIBettingInsight;
    over35cards: IAIBettingInsight;
    over95corners: IAIBettingInsight;
    goldenBet: IGoldenBet;
    generatedAt?: Date;
  };
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  score?: {
    home: number;
    away: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FixtureSchema = new Schema<IFixture>({
  fixtureId: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeTeamId: { type: Number, required: true },  // NEW
  awayTeamId: { type: Number, required: true },  // NEW
  league: { type: String, required: true },
  leagueId: { type: Number, required: true },    // NEW
  country: { type: String, required: true },
  season: { type: Number, required: true },      // NEW
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
  score: {
    home: Number,
    away: Number,
  }
}, {
  timestamps: true
});

// Indexes
FixtureSchema.index({ date: 1 });
FixtureSchema.index({ league: 1 });
FixtureSchema.index({ leagueId: 1 });  // NEW: For efficient filtering
FixtureSchema.index({ status: 1 });
FixtureSchema.index({ homeTeamId: 1 });  // NEW: For team queries
FixtureSchema.index({ awayTeamId: 1 });  // NEW: For team queries
FixtureSchema.index({ 'aiBets.generatedAt': 1 });

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
