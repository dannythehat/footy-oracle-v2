import cron from 'node-cron';
import { Fixture } from '../models/Fixture.js';
import { fetchFixtures, fetchOdds } from '../services/apiFootballService.js';

/**
 * Start the fixtures cron: refreshes 7 days back + 7 days forward
 */
export function startFixturesCron() {
  // Run every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('🔄 Running fixtures update cron (every 2 hours)...');
    await loadFixturesWindow();
  });

  // Run once on startup
  console.log('🚀 Fixtures cron initialized - loading fixtures window...');
  loadFixturesWindow().catch(console.error);
}

/**
 * Load fixtures for a 14-day window (7 days back + 7 days ahead)
 */
export async function loadFixturesWindow() {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    console.log(
      `📅 Loading fixtures window: ${startDate.toISOString().split('T')[0]} → ${endDate
        .toISOString()
        .split('T')[0]}`
    );

    let totalSaved = 0;
    let totalUpdated = 0;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];

      try {
        const result = await loadFixturesForDate(dateStr);
        totalSaved += result.new || 0;
        totalUpdated += result.updated || 0;

        // Avoid API rate limits
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (err) {
        console.error(`❌ Error loading fixtures for ${dateStr}:`, err);
      }
    }

    console.log(`✅ Window update complete: ${totalSaved} new, ${totalUpdated} updated`);
  } catch (err) {
    console.error('❌ Error loading fixtures window:', err);
  }
}

/**
 * Legacy compatibility
 */
export async function loadUpcomingFixtures() {
  return loadFixturesWindow();
}

export async function loadTodaysFixtures() {
  const today = new Date().toISOString().split('T')[0];
  return loadFixturesForDate(today);
}

/**
 * Load fixtures for a single date
 */
export async function loadFixturesForDate(date: string) {
  try {
    console.log(`📥 Fetching fixtures for ${date}...`);

    const fixturesData = await fetchFixtures(date);

    if (!fixturesData || fixturesData.length === 0) {
      console.log(`ℹ️ No fixtures found for ${date}`);
      return { success: true, count: 0, new: 0, updated: 0 };
    }

    let saved = 0;
    let updated = 0;

    for (const fixture of fixturesData) {
      const existing = await Fixture.findOne({ fixtureId: fixture.fixtureId });

      if (existing) {
        await Fixture.updateOne(
          { fixtureId: fixture.fixtureId },
          {
            $set: {
              date: new Date(fixture.date),
              homeTeam: fixture.homeTeam,
              awayTeam: fixture.awayTeam,
              homeTeamId: fixture.homeTeamId,
              awayTeamId: fixture.awayTeamId,
              league: fixture.league,
              leagueId: fixture.leagueId,
              country: fixture.country,
              season: fixture.season,
              status: fixture.status,
              updatedAt: new Date(),
            },
          }
        );
        updated++;
      } else {
        await Fixture.create({
          fixtureId: fixture.fixtureId,
          date: new Date(fixture.date),
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeTeamId: fixture.homeTeamId,
          awayTeamId: fixture.awayTeamId,
          league: fixture.league,
          leagueId: fixture.leagueId,
          country: fixture.country,
          season: fixture.season,
          status: fixture.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        saved++;
      }

      // 🔥 Update odds for every fixture
      const odds = await fetchOdds(fixture.fixtureId);
      if (odds) {
        await Fixture.updateOne(
          { fixtureId: fixture.fixtureId },
          {
            $set: {
              odds,
              updatedAt: new Date(),
            },
          }
        );
      }

      // Rate limiting: API-Football gets angry otherwise
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    console.log(`✅ ${date}: ${saved} new, ${updated} updated`);
    return { success: true, count: saved + updated, new: saved, updated: updated };
  } catch (err) {
    console.error(`❌ Error loading fixtures for ${date}:`, err);
    throw err;
  }
}
