import mongoose, { Schema, Document } from 'mongoose';

export interface IFixture extends Document {
  fixtureId: number;
  date: Date;
  leagueId: number;
  league: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: string;
  awayTeam: string;
  odds: any;
  status: string;
  score?: { home: number | null; away: number | null };
}

const FixtureSchema = new Schema<IFixture>({
  fixtureId: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  leagueId: Number,
  league: String,
  homeTeamId: Number,
  awayTeamId: Number,
  homeTeam: String,
  awayTeam: String,
  odds: Object,
  status: String,
  score: {
    home: { type: Number, default: null },
    away: { type: Number, default: null }
  }
});

// Indexed for fast date queries
FixtureSchema.index({ date: 1 });

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
