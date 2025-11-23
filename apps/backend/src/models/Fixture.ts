import mongoose, { Schema, Document } from 'mongoose';

export interface IFixture extends Document {
  fixtureId: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  odds: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    btts?: number;
    over25?: number;
    under25?: number;
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
  league: { type: String, required: true },
  country: { type: String, required: true },
  odds: {
    homeWin: Number,
    draw: Number,
    awayWin: Number,
    btts: Number,
    over25: Number,
    under25: Number,
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
FixtureSchema.index({ status: 1 });

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
