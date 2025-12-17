import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";
import { startDailyOracleCron } from "./cron/dailyOracleCron.js";

const PORT = process.env.PORT || 10000;
const MONGO = process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGO) {
      throw new Error("MONGODB_URI is missing from environment variables.");
    }

    await mongoose.connect(MONGO);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log("Backend running on port", PORT);
    });

    startDailyOracleCron();

  } catch (err) {
    console.error("Server start error:", err);
  }
}

start();
