import { Fixture } from '../models/Fixture.js';
import { fetchOdds } from './apiFootballService.js';

/**
 * Fetch and update odds for today's fixtures
 * This ensures odds are available for display in the UI
 */
export async function updateTodayOdds(): Promise<{ updated: number; total: number; errors: number }> {
  try {
    console.log('💰 Starting odds update for today\'s fixtures...');

    // Get today's date range (00:00 to 23:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all fixtures for today that don't have odds or have old odds
    const fixtures = await Fixture.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'live'] }
    }).lean();

    console.log(`📊 Found ${fixtures.length} fixtures for today`);

    let updated = 0;
    let errors = 0;

    // Update odds for each fixture
    for (const fixture of fixtures) {
      try {
        console.log(`💰 Fetching odds for fixture ${fixture.fixtureId}: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
        
        const odds = await fetchOdds(fixture.fixtureId);
        
        if (odds) {
          await Fixture.updateOne(
            { fixtureId: fixture.fixtureId },
            { 
              $set: { 
                odds,
                lastUpdated: new Date()
              } 
            }
          );
          updated++;
          console.log(`✅ Updated odds for fixture ${fixture.fixtureId}`);
        } else {
          console.log(`⚠️  No odds available for fixture ${fixture.fixtureId}`);
        }

        // Rate limiting: wait 1 second between requests to avoid API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error(`❌ Error fetching odds for fixture ${fixture.fixtureId}:`, err.message);
        errors++;
      }
    }

    console.log(`✅ Odds update complete: ${updated}/${fixtures.length} updated, ${errors} errors`);

    return {
      updated,
      total: fixtures.length,
      errors
    };
  } catch (err: any) {
    console.error('❌ Error in updateTodayOdds:', err.message);
    throw err;
  }
}

/**
 * Fetch and update odds for a specific fixture
 */
export async function updateFixtureOdds(fixtureId: number): Promise<boolean> {
  try {
    console.log(`💰 Fetching odds for fixture ${fixtureId}...`);
    
    const odds = await fetchOdds(fixtureId);
    
    if (odds) {
      await Fixture.updateOne(
        { fixtureId },
        { 
          $set: { 
            odds,
            lastUpdated: new Date()
          } 
        }
      );
      console.log(`✅ Updated odds for fixture ${fixtureId}`);
      return true;
    } else {
      console.log(`⚠️  No odds available for fixture ${fixtureId}`);
      return false;
    }
  } catch (err: any) {
    console.error(`❌ Error updating odds for fixture ${fixtureId}:`, err.message);
    return false;
  }
}
