import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 10000;

console.log("?? SERVER ENTRY REACHED");
console.log("?? MONGODB_URI =", process.env.MONGODB_URI);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log("?? Connected to MongoDB:", mongoose.connection.name);
    console.log("?? Collections:", Object.keys(mongoose.connection.collections));
  } catch (err: any) {
    console.error("?? MongoDB connection failed:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Footy Oracle API running on port ${PORT}`);
  });
})();
