import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Fixture } from '../models/Fixture.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test connection
    console.log('📡 Connecting to MongoDB...');
    console.log('   URI:', MONGODB_URI?.substring(0, 30) + '...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');
    
    // Check collections
    console.log('📊 Database info:');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Collections:', Object.keys(mongoose.connection.collections));
    console.log('');
    
    // Count fixtures
    const fixtureCount = await Fixture.countDocuments();
    console.log(`📈 Total fixtures in database: ${fixtureCount}\n`);
    
    if (fixtureCount === 0) {
      console.log('⚠️  No fixtures found! Run seeding script:');
      console.log('   npm run seed:fixtures\n');
    } else {
      // Show sample fixtures
      console.log('📋 Sample fixtures:');
      const samples = await Fixture.find().limit(5).lean();
      
      samples.forEach((f: any, i: number) => {
        console.log(`\n   ${i + 1}. ${f.homeTeam} vs ${f.awayTeam}`);
        console.log(`      League: ${f.league}`);
        console.log(`      Date: ${f.date}`);
        console.log(`      Status: ${f.status}`);
        console.log(`      Score: ${f.homeScore || 0} - ${f.awayScore || 0}`);
      });
      
      // Show fixtures by status
      console.log('\n\n📊 Fixtures by status:');
      const statusCounts = await Fixture.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      statusCounts.forEach((s: any) => {
        console.log(`   ${s._id}: ${s.count}`);
      });
      
      // Show fixtures by league
      console.log('\n📊 Fixtures by league:');
      const leagueCounts = await Fixture.aggregate([
        {
          $group: {
            _id: '$league',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      leagueCounts.forEach((l: any) => {
        console.log(`   ${l._id}: ${l.count}`);
      });
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MONGODB_URI in .env file');
    console.error('   2. Verify MongoDB Atlas IP whitelist');
    console.error('   3. Check database user permissions');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();
