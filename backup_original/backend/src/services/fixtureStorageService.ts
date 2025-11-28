import { Fixture, IFixture } from '../models/Fixture.js';
import { fetchFixturesWithOdds, FixtureData } from './apiFootballService.js';

/**
 * Fetch and store fixtures for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @returns Number of fixtures stored
 */
export async function fetchAndStoreFixtures(date: string): Promise<number> {
  try {
    console.log(`\n🔄 Starting fixture fetch and store for ${date}...`);
    
    // Fetch fixtures with odds from API-Football
    const fixturesData = await fetchFixturesWithOdds(date);
    
    if (fixturesData.length === 0) {
      console.log(`ℹ️  No fixtures to store for ${date}`);
      return 0;
    }

    console.log(`💾 Storing ${fixturesData.length} fixtures in database...`);

    // Store each fixture in MongoDB (upsert to avoid duplicates)
    let storedCount = 0;
    
    for (const fixtureData of fixturesData) {
      try {
        await Fixture.findOneAndUpdate(
          { fixtureId: fixtureData.fixtureId },
          {
            fixtureId: fixtureData.fixtureId,
            date: new Date(fixtureData.date),
            homeTeam: fixtureData.homeTeam,
            awayTeam: fixtureData.awayTeam,
            league: fixtureData.league,
            country: fixtureData.country,
            odds: fixtureData.odds,
            status: fixtureData.status || 'scheduled',
          },
          { upsert: true, new: true }
        );
        storedCount++;
      } catch (error: any) {
        console.error(`❌ Error storing fixture ${fixtureData.fixtureId}:`, error.message);
      }
    }

    console.log(`✅ Successfully stored ${storedCount}/${fixturesData.length} fixtures`);
    return storedCount;
  } catch (error: any) {
    console.error('❌ Error in fetchAndStoreFixtures:', error.message);
    throw error;
  }
}

/**
 * Fetch and store fixtures for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Total number of fixtures stored
 */
export async function fetchAndStoreFixturesRange(startDate: string, endDate: string): Promise<number> {
  try {
    console.log(`\n📅 Fetching fixtures from ${startDate} to ${endDate}...`);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalStored = 0;

    // Loop through each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const stored = await fetchAndStoreFixtures(dateStr);
      totalStored += stored;
      
      // Rate limiting: Wait 1 second between dates
      if (date < end) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Total fixtures stored: ${totalStored}`);
    return totalStored;
  } catch (error: any) {
    console.error('❌ Error in fetchAndStoreFixturesRange:', error.message);
    throw error;
  }
}

/**
 * Get fixtures from database by date
 * @param date - Date in YYYY-MM-DD format
 * @returns Array of fixtures
 */
export async function getFixturesByDate(date: string): Promise<IFixture[]> {
  try {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const fixtures = await Fixture.find({
      date: { $gte: targetDate, $lt: nextDate }
    }).sort({ date: 1 });

    return fixtures;
  } catch (error: any) {
    console.error('❌ Error getting fixtures by date:', error.message);
    throw error;
  }
}

/**
 * Get fixtures from database by date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of fixtures
 */
export async function getFixturesByDateRange(startDate: string, endDate: string): Promise<IFixture[]> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); // Include end date

    const fixtures = await Fixture.find({
      date: { $gte: start, $lt: end }
    }).sort({ date: 1 });

    return fixtures;
  } catch (error: any) {
    console.error('❌ Error getting fixtures by date range:', error.message);
    throw error;
  }
}

/**
 * Get fixtures by league
 * @param league - League name
 * @returns Array of fixtures
 */
export async function getFixturesByLeague(league: string): Promise<IFixture[]> {
  try {
    const fixtures = await Fixture.find({ league }).sort({ date: 1 });
    return fixtures;
  } catch (error: any) {
    console.error('❌ Error getting fixtures by league:', error.message);
    throw error;
  }
}

/**
 * Update fixture result
 * @param fixtureId - Fixture ID
 * @param homeScore - Home team score
 * @param awayScore - Away team score
 * @param status - Fixture status
 */
export async function updateFixtureResult(
  fixtureId: number,
  homeScore: number,
  awayScore: number,
  status: string
): Promise<void> {
  try {
    await Fixture.findOneAndUpdate(
      { fixtureId },
      {
        score: { home: homeScore, away: awayScore },
        status
      }
    );
    console.log(`✅ Updated result for fixture ${fixtureId}: ${homeScore}-${awayScore}`);
  } catch (error: any) {
    console.error(`❌ Error updating fixture result for ${fixtureId}:`, error.message);
    throw error;
  }
}

/**
 * Get all available leagues in database
 * @returns Array of league names
 */
export async function getAvailableLeagues(): Promise<string[]> {
  try {
    const leagues = await Fixture.distinct('league');
    return leagues;
  } catch (error: any) {
    console.error('❌ Error getting available leagues:', error.message);
    throw error;
  }
}

/**
 * Count fixtures by status
 * @returns Object with counts by status
 */
export async function getFixtureCountsByStatus(): Promise<any> {
  try {
    const counts = await Fixture.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return counts.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  } catch (error: any) {
    console.error('❌ Error getting fixture counts:', error.message);
    throw error;
  }
}
