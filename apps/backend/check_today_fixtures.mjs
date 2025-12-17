import mongoose from "mongoose";
import "dotenv/config";
import Fixture from "./src/models/Fixture.js";

const MONGO = process.env.MONGO || process.env.MONGO_URI;

async function run() {
  console.log("Connecting to:", MONGO);
  await mongoose.connect(MONGO);

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const fixtures = await Fixture.find({
    date: { $gte: start, $lte: end }
  }).select("fixtureId homeTeam awayTeam league date odds");

  console.log("TODAY FIXTURES COUNT:", fixtures.length);
  console.log(JSON.stringify(fixtures, null, 2));

  process.exit(0);
}

run();
