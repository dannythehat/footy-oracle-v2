import { Fixture } from "../models/Fixture.js";

export async function attachOdds(predictions: any[]) {
  const fixtureIds = predictions.map(p => p.fixtureId);

  const fixtures = await Fixture.find({ fixtureId: { $in: fixtureIds } });

  const map = new Map();
  for (const f of fixtures) map.set(f.fixtureId, f.odds || {});

  return predictions.map(p => ({
    ...p,
    odds: map.get(p.fixtureId) || {}
  }));
}
