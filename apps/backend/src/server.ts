import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

console.log("🔌 SERVER ENTRY REACHED");
console.log("🔌 MONGODB_URI =", process.env.MONGODB_URI);

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI missing");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ MongoDB connected");
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }

  const port = process.env.PORT || 10000;

  app.listen(port, () =>
    console.log("🚀 Footy Oracle API running on port " + port)
  );
}

start();
