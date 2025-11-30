import cron from 'node-cron';
import { Fixture } from '../models/Fixture.js';
import { fetchFixtures, fetchOddsForFixture } from '../services/apiFootballService.js';

/**
 * Cron job to fetch and store fixtures
 * Runs every 2 hours to keep fixtures updated
 */
export function startFixturesCron() {
  // Run every 2 hours to keep fixtures fresh
  cron.schedule('0 */2 * * *', async () => {
    console.log('🔄 Running fixtures update cron (every 2 hours)...');
    await loadFixturesWindow();
  });

  // Also run on startup to ensure fixtures are available immediately
  console.log('🚀 Fixtures cron initialized - loading fixtures window...');
  loadFixturesWindow().catch(console.error);
}

/**
 * Load fixtures window: 7 days back + 7 days ahead (14-day rolling window)
 * This provides context with recent results AND upcoming fixtures
 */
export async function loadFixturesWindow() {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7); // 7 days back
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7); // 7 days ahead
    
    console.log(`📅 Loading fixtures window: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (7 days back + 7 days ahead)...`);

    let totalSaved = 0;
    let totalUpdated = 0;

    // Loop through each date and fetch fixtures
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const result = await loadFixturesForDate(dateStr);
        totalSaved += result.new || 0;
        totalUpdated += result.updated || 0;
        
        // Rate limiting: Wait 1 second between dates to avoid API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error loading fixtures for ${dateStr}:`, error);
        // Continue with next date even if one fails
      }
    }

    console.log(`✅ Fixtures window update complete: ${totalSaved} new, ${totalUpdated} updated`);
  } catch (error) {
    console.error('❌ Error loading fixtures window:', error);
  }
}

/**
 * Load upcoming fixtures (legacy function - now uses window approach)
 * @deprecated Use loadFixturesWindow() instead
 */
export async function loadUpcomingFixtures() {
  return loadFixturesWindow();
}

/**
 * Load today's fixtures (legacy function for backward compatibility)
 */
export async function loadTodaysFixtures() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📥 Loading fixtures for ${today}...`);

    // Fetch fixtures from API-Football
    const fixturesData = await fetchFixtures(today);
    
    if (!fixturesData || fixturesData.length === 0) {
      console.log(`ℹ️  No fixtures found for ${today}`);
      return;
    }

    console.log(`✅ Found ${fixturesData.length} fixtures`);

    // Log first fixture for debugging
    if (fixturesData.length > 0) {
      console.log('📊 Sample fixture from API:', JSON.stringify(fixturesData[0], null, 2));
    }

    // Store each fixture in database
    let savedCount = 0;
    let updatedCount = 0;

    for (const fixtureData of fixturesData) {
      try {
        // Check if fixture already exists
        const existing = await Fixture.findOne({ fixtureId: fixtureData.fixtureId });

        if (existing) {
          // Update existing fixture - only fields that exist in model
          console.log(`🔄 Updating fixture ${fixtureData.fixtureId}: ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
          await Fixture.updateOne(
            { fixtureId: fixtureData.fixtureId },
            {
              $set: {
                date: new Date(fixtureData.date),
                homeTeam: fixtureData.homeTeam,
                awayTeam: fixtureData.awayTeam,
                league: fixtureData.league,
                country: fixtureData.country,
                status: fixtureData.status,
                odds: fixtureData.odds || {},
                updatedAt: new Date(),
              }
            }
          );
          updatedCount++;
        } else {
          // Create new fixture - only fields that exist in model
          console.log(`➕ Creating fixture ${fixtureData.fixtureId}: ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
          const newFixture = await Fixture.create({
            fixtureId: fixtureData.fixtureId,
            date: new Date(fixtureData.date),
            homeTeam: fixtureData.homeTeam,
            awayTeam: fixtureData.awayTeam,
            league: fixtureData.league,
            country: fixtureData.country,
            status: fixtureData.status,
            odds: fixtureData.odds || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`✅ Created fixture in DB:`, JSON.stringify(newFixture.toObject(), null, 2));
          savedCount++;
        }

        // Fetch and update odds (with delay to avoid rate limiting)
        if (fixtureData.fixtureId) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
          const odds = await fetchOddsForFixture(fixtureData.fixtureId);
          
          if (odds) {
            await Fixture.updateOne(
              { fixtureId: fixtureData.fixtureId },
              { $set: { odds, updatedAt: new Date() } }
            );
          }
        }
      } catch (error) {
        console.error(`❌ Error processing fixture ${fixtureData.fixtureId}:`, error);
        console.error('Fixture data:', JSON.stringify(fixtureData, null, 2));
      }
    }

    console.log(`✅ Fixtures loaded: ${savedCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('❌ Error loading fixtures:', error);
  }
}

/**
 * Load fixtures for a specific date (manual trigger)
 * Updates existing fixtures with latest data (scores, odds, status)
 */
export async function loadFixturesForDate(date: string) {
  try {
    console.log(`📥 Loading fixtures for ${date}...`);

    const fixturesData = await fetchFixtures(date);
    
    if (!fixturesData || fixturesData.length === 0) {
      console.log(`ℹ️  No fixtures found for ${date}`);
      return { success: true, count: 0, new: 0, updated: 0 };
    }

    console.log(`✅ Fetched ${fixturesData.length} fixtures from API for ${date}`);

    // Log first fixture for debugging
    if (fixturesData.length > 0) {
      console.log('📊 Sample fixture from API:', JSON.stringify(fixturesData[0], null, 2));
    }

    let savedCount = 0;
    let updatedCount = 0;

    for (const fixtureData of fixturesData) {
      try {
        const existing = await Fixture.findOne({ fixtureId: fixtureData.fixtureId });

        if (existing) {
          // Update existing fixture with latest data
          console.log(`🔄 Updating fixture ${fixtureData.fixtureId}: ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
          await Fixture.updateOne(
            { fixtureId: fixtureData.fixtureId },
            {
              $set: {
                date: new Date(fixtureData.date),
                homeTeam: fixtureData.homeTeam,
                awayTeam: fixtureData.awayTeam,
                league: fixtureData.league,
                country: fixtureData.country,
                status: fixtureData.status,
                odds: fixtureData.odds || existing.odds || {},
                updatedAt: new Date(),
              }
            }
          );
          updatedCount++;
        } else {
          // Create new fixture
          console.log(`➕ Creating fixture ${fixtureData.fixtureId}: ${fixtureData.homeTeam} vs ${fixtureData.awayTeam}`);
          const newFixture = await Fixture.create({
            fixtureId: fixtureData.fixtureId,
            date: new Date(fixtureData.date),
            homeTeam: fixtureData.homeTeam,
            awayTeam: fixtureData.awayTeam,
            league: fixtureData.league,
            country: fixtureData.country,
            status: fixtureData.status,
            odds: fixtureData.odds || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`✅ Created fixture in DB with ID: ${newFixture.fixtureId}`);
          savedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing fixture ${fixtureData.fixtureId}:`, error);
        console.error('Fixture data:', JSON.stringify(fixtureData, null, 2));
      }
    }

    console.log(`✅ ${date}: ${savedCount} new, ${updatedCount} updated`);
    return { success: true, count: savedCount + updatedCount, new: savedCount, updated: updatedCount };
  } catch (error) {
    console.error('❌ Error loading fixtures for date:', error);
    throw error;
  }
}
