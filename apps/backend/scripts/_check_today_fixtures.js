import mongoose from "mongoose";
import { Fixture } from "../dist/models/Fixture.js";

const uri = process.env.MONGO || process.env.MONGO_URI;

if (!uri) {
  console.log("NO MONGO URI FOUND");
  process.exit(1);
}

await mongoose.connect(uri);

const start = new Date();
start.setHours(0,0,0,0);

const end = new Date();
end.setHours(23,59,59,999);

const count = await Fixture.countDocuments({
  date: { $gte: start, $lte: end }
});

console.log("TODAY FIXTURES COUNT:", count);
process.exit(0);
