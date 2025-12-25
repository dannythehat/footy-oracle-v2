import mongoose from "mongoose";
import { Fixture } from "../src/models/Fixture.ts";

const uri = process.env.MONGO_URI || process.env.MONGO;
if (!uri) {
  console.error("❌ MONGO_URI not set");
  process.exit(1);
}

await mongoose.connect(uri);

const start = new Date();
start.setUTCHours(0, 0, 0, 0);

const end = new Date(start);
end.setUTCDate(end.getUTCDate() + 1);

const count = await Fixture.countDocuments({
  date: { $gte: start, $lt: end }
});

console.log("✅ TODAY FIXTURES IN DB:", count);

process.exit(0);
