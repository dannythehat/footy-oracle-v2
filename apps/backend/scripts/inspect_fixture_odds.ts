import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import { Fixture } from "../src/models/Fixture.js";

const MONGO = process.env.MONGODB_URI;

async function run() {
  console.log("Loaded MONGO =", MONGO);

  if (!MONGO) {
    console.error("No MONGODB_URI in env");
    process.exit(1);
  }

  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB");

  const doc = await Fixture.findOne().sort({ date: 1 }).lean();
  if (!doc) {
    console.log("No fixtures found in DB");
  } else {
    console.log(JSON.stringify(doc, null, 2));
  }

  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
