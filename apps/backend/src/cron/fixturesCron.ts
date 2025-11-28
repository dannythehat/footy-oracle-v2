import cron from 'node-cron';
import { Fixture } from '../models/Fixture.js';
import { fetchFixtures, fetchOddsForFixture } from '../services/apiFootballService.js';

/**
 * Cron job to fetch and store today's fixtures
 * Runs daily at 2 AM UTC
 */
export function startFixturesCron() {
  // Run daily at 2 AM UTC
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running fixtures cron job...');
    await loadTodaysFixtures();
  });

  // Also run on startup
  console.log('🚀 Fixtures cron initialized - loading today\'s fixtures...');
  loadTodaysFixtures().catch(console.error);
}

/**
 * Load today's fixtures from API-Football and store in database
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

    // Store each fixture in database
    let savedCount = 0;
    let updatedCount = 0;

    for (const fixtureData of fixturesData) {
      try {
        // Check if fixture already exists
        const existing = await Fixture.findOne({ fixture_id: fixtureData.fixtureId });

        if (existing) {
          // Update existing fixture
          await Fixture.updateOne(
            { fixture_id: fixtureData.fixtureId },
            {
              $set: {
                date: new Date(fixtureData.date),
                home_team: fixtureData.homeTeam,
                away_team: fixtureData.awayTeam,
                home_team_id: fixtureData.homeTeamId,
                away_team_id: fixtureData.awayTeamId,
                league: fixtureData.league,
                league_id: fixtureData.leagueId,
                country: fixtureData.country,
                season: fixtureData.season,
                status: fixtureData.status,
                odds: fixtureData.odds || {},
                updated_at: new Date(),
              }
            }
          );
          updatedCount++;
        } else {
          // Create new fixture
          await Fixture.create({
            fixture_id: fixtureData.fixtureId,
            date: new Date(fixtureData.date),
            home_team: fixtureData.homeTeam,
            away_team: fixtureData.awayTeam,
            home_team_id: fixtureData.homeTeamId,
            away_team_id: fixtureData.awayTeamId,
            league: fixtureData.league,
            league_id: fixtureData.leagueId,
            country: fixtureData.country,
            season: fixtureData.season,
            status: fixtureData.status,
            odds: fixtureData.odds || {},
            predictions: {
              btts_yes: 0,
              over_2_5: 0,
              over_9_5_corners: 0,
              over_3_5_cards: 0,
            },
            created_at: new Date(),
            updated_at: new Date(),
          });
          savedCount++;
        }

        // Fetch and update odds (with delay to avoid rate limiting)
        if (fixtureData.fixtureId) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
          const odds = await fetchOddsForFixture(fixtureData.fixtureId);
          
          if (odds) {
            await Fixture.updateOne(
              { fixture_id: fixtureData.fixtureId },
              { $set: { odds, updated_at: new Date() } }
            );
          }
        }
      } catch (error) {
        console.error(`❌ Error processing fixture ${fixtureData.fixtureId}:`, error);
      }
    }

    console.log(`✅ Fixtures loaded: ${savedCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('❌ Error loading fixtures:', error);
  }
}

/**
 * Load fixtures for a specific date (manual trigger)
 */
export async function loadFixturesForDate(date: string) {
  try {
    console.log(`📥 Loading fixtures for ${date}...`);

    const fixturesData = await fetchFixtures(date);
    
    if (!fixturesData || fixturesData.length === 0) {
      console.log(`ℹ️  No fixtures found for ${date}`);
      return { success: true, count: 0 };
    }

    let savedCount = 0;
    let updatedCount = 0;

    for (const fixtureData of fixturesData) {
      const existing = await Fixture.findOne({ fixture_id: fixtureData.fixtureId });

      if (existing) {
        await Fixture.updateOne(
          { fixture_id: fixtureData.fixtureId },
          {
            $set: {
              date: new Date(fixtureData.date),
              home_team: fixtureData.homeTeam,
              away_team: fixtureData.awayTeam,
              home_team_id: fixtureData.homeTeamId,
              away_team_id: fixtureData.awayTeamId,
              league: fixtureData.league,
              league_id: fixtureData.leagueId,
              country: fixtureData.country,
              season: fixtureData.season,
              status: fixtureData.status,
              updated_at: new Date(),
            }
          }
        );
        updatedCount++;
      } else {
        await Fixture.create({
          fixture_id: fixtureData.fixtureId,
          date: new Date(fixtureData.date),
          home_team: fixtureData.homeTeam,
          away_team: fixtureData.awayTeam,
          home_team_id: fixtureData.homeTeamId,
          away_team_id: fixtureData.awayTeamId,
          league: fixtureData.league,
          league_id: fixtureData.leagueId,
          country: fixtureData.country,
          season: fixtureData.season,
          status: fixtureData.status,
          predictions: {
            btts_yes: 0,
            over_2_5: 0,
            over_9_5_corners: 0,
            over_3_5_cards: 0,
          },
          created_at: new Date(),
          updated_at: new Date(),
        });
        savedCount++;
      }
    }

    return { success: true, count: savedCount + updatedCount, new: savedCount, updated: updatedCount };
  } catch (error) {
    console.error('❌ Error loading fixtures for date:', error);
    throw error;
  }
}
