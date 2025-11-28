import mongoose from 'mongoose';

const FixtureSchema = new mongoose.Schema({
  fixture_id: Number,
  date: String,
  timestamp: Number,
  league_id: Number,
  league_name: String,
  country: String,
  home_team: String,
  away_team: String,
  status: String,
  score: {
    fulltime: {
      home: Number,
      away: Number
    },
    halftime: {
      home: Number,
      away: Number
    }
  },
  events: Array
});

export default mongoose.model('Fixture', FixtureSchema);
