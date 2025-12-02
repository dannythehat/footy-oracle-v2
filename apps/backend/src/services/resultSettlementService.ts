import { Fixture } from '../models/Fixture.js';

/**
 * Determine result of a fixture based on stored DB data.
 * No external API calls required.
 */
export async function getFixtureResultFromDB(fixtureId: number) {
  const fixture = await Fixture.findOne({ fixtureId }).lean();

  if (!fixture || !fixture.score) {
    return null;
  }

  const { home, away } = fixture.score;

  if (home === null || away === null) return null;

  let result: 'HOME' | 'AWAY' | 'DRAW' | null = null;

  if (home > away) result = 'HOME';
  else if (away > home) result = 'AWAY';
  else result = 'DRAW';

  return {
    fixtureId,
    homeScore: home,
    awayScore: away,
    result,
  };
}

/**
 * For any settlement flows or result checking
 */
export async function settleFixture(fixtureId: number) {
  const data = await getFixtureResultFromDB(fixtureId);

  if (!data) {
    console.log(`⚠️ No result yet for fixture ${fixtureId}`);
    return null;
  }

  console.log(`🏁 Result for fixture ${fixtureId}: ${data.result}`);
  return data;
}
