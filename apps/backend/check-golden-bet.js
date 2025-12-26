import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const GoldenBet = mongoose.connection.collection('golden_bets');
  const bets = await GoldenBet.find({}).sort({ confidence: -1 }).limit(1).toArray();
  
  console.log('Golden Bet structure:');
  console.log(JSON.stringify(bets[0], null, 2));
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
