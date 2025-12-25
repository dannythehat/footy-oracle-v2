import { Fixture } from "../models/Fixture.js";

/**
 * Canonical read for TODAY fixtures (UTC).
 * MongoDB is the single source of truth.
 */
export async function getTodayFixturesFromDB() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return Fixture.find({
    date: { $gte: start, $lt: end }
  }).lean();
}
