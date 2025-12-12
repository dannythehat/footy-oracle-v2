import { Fixture } from "../models/Fixture.js";

/**
 * Enriches predictions with full fixture data and odds
 * 
 * Input: ML predictions with just { fixtureId, market, probability }
 * Output: Enriched predictions with { fixtureId, market, probability, fixture: {...}, odds: number }
 * 
 * This enables route filters like:
 * - isPremiumLeague(g.fixture.leagueId)
 * - g.odds >= 1.60
 */
export async function attachOdds(predictions: any[]) {
  if (!predictions || predictions.length === 0) {
    return [];
  }

  const fixtureIds = predictions.map(p => p.fixtureId);

  // Fetch all fixtures from DB
  const fixtures = await Fixture.find({ fixtureId: { $in: fixtureIds } });

  // Create lookup map
  const fixtureMap = new Map();
  for (const f of fixtures) {
    fixtureMap.set(f.fixtureId, f);
  }

  // Enrich each prediction
  return predictions.map(p => {
    const fixture = fixtureMap.get(p.fixtureId);
    
    if (!fixture) {
      console.warn(`⚠️ No fixture found for fixtureId: ${p.fixtureId}`);
      return null;
    }

    // Extract the odds value for this specific market
    let oddsValue = null;
    if (fixture.odds && p.market) {
      // Map market names to odds fields
      const marketToOddsField: Record<string, string> = {
        'btts': 'btts',
        'over25': 'over25',
        'over95corners': 'over95corners',
        'cornersOver95': 'over95corners',
        'over35cards': 'over35cards',
        'cardsOver35': 'over35cards'
      };
      
      const oddsField = marketToOddsField[p.market];
      if (oddsField && fixture.odds[oddsField]) {
        oddsValue = fixture.odds[oddsField];
      }
    }

    return {
      ...p,
      fixture: {
        fixtureId: fixture.fixtureId,
        leagueId: fixture.leagueId,
        league: fixture.league,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        date: fixture.date,
        status: fixture.status
      },
      odds: oddsValue
    };
  }).filter(p => p !== null); // Remove predictions without fixtures
}
