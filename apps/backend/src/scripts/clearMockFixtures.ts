/**
 * Clear Mock Fixtures Script
 * 
 * Removes all mock/seed fixtures with "Unknown" team names
 * and loads real fixtures from API-Football
 * 
 * Usage:
 *   npx tsx src/scripts/clearMockFixtures.ts
 */

import mongoose from 'mongoose';
import { Fixture } from '../models/Fixture.js';
import { loadFixturesWindow } from '../cron/fixturesCron.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/footy-oracle';

async function clearMockFixtures() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count total fixtures before
    const totalBefore = await Fixture.countDocuments();
    console.log(`📊 Total fixtures before: ${totalBefore}`);

    // Find and count mock fixtures
    const mockFixtures = await Fixture.find({
      $or: [
        { homeTeam: /Unknown/i },
        { awayTeam: /Unknown/i },
        { league: /Unknown/i },
        { country: /Unknown/i }
      ]
    });

    console.log(`🗑️  Found ${mockFixtures.length} mock fixtures to delete`);

    if (mockFixtures.length > 0) {
      // Show sample of what will be deleted
      console.log('\n📋 Sample mock fixtures:');
      mockFixtures.slice(0, 5).forEach(f => {
        console.log(`  - ${f.homeTeam} vs ${f.awayTeam} (${f.league})`);
      });

      // Delete mock fixtures
      const deleteResult = await Fixture.deleteMany({
        $or: [
          { homeTeam: /Unknown/i },
          { awayTeam: /Unknown/i },
          { league: /Unknown/i },
          { country: /Unknown/i }
        ]
      });

      console.log(`\n✅ Deleted ${deleteResult.deletedCount} mock fixtures`);
    } else {
      console.log('✅ No mock fixtures found - database is clean');
    }

    // Count remaining fixtures
    const totalAfter = await Fixture.countDocuments();
    console.log(`📊 Total fixtures after cleanup: ${totalAfter}`);

    // Load real fixtures from API-Football
    console.log('\n🔄 Loading real fixtures from API-Football...');
    console.log('⏳ This will take 2-3 minutes (14 days of fixtures)...\n');
    
    await loadFixturesWindow();

    // Count final fixtures
    const finalCount = await Fixture.countDocuments();
    console.log(`\n✅ Final fixture count: ${finalCount}`);

    // Show sample of real fixtures
    const realFixtures = await Fixture.find()
      .sort({ date: 1 })
      .limit(5)
      .lean();

    console.log('\n📋 Sample real fixtures loaded:');
    realFixtures.forEach(f => {
      const date = new Date(f.date).toISOString().split('T')[0];
      console.log(`  - ${f.homeTeam} vs ${f.awayTeam} (${f.league}) - ${date}`);
    });

    console.log('\n🎉 Database cleanup and reload complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
clearMockFixtures();
