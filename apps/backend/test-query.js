import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Fixture = mongoose.model('Fixture', new mongoose.Schema({}, { strict: false, collection: 'fixtures' }));
  
  // Test the NEW query logic (regex on string)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  console.log('Looking for date:', dateStr);
  
  const count = await Fixture.countDocuments({
    kickoff: { $regex: `^${dateStr}` }
  });
  
  console.log('Found fixtures:', count);
  
  const fixtures = await Fixture.find({
    kickoff: { $regex: `^${dateStr}` }
  }).limit(3);
  
  fixtures.forEach(f => {
    console.log(f.home_team, 'vs', f.away_team);
    console.log('  Goals confidence:', f.predictions?.goals?.confidence);
    console.log('  BTTS confidence:', f.predictions?.btts?.confidence);
  });
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
