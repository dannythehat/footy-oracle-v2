import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";
import { startMlCron } from "./cron/mlPredictionsCron.js";
import { startBetBuilderCron } from "./cron/betBuilderCron.js";

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

    startMlCron();
    startBetBuilderCron();

  } catch (err) {
    console.error("Server start error:", err);
  }
}

start();
