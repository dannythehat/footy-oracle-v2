import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Fixture = mongoose.model('Fixture', new mongoose.Schema({}, { strict: false, collection: 'fixtures' }));
  
  const fixtures = await Fixture.find({ kickoff: /^2025-12-26/ });
  console.log('Fixtures for Dec 26:', fixtures.length);
  
  fixtures.forEach(f => {
    console.log(f.kickoff, f.home_team, 'vs', f.away_team);
  });
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
