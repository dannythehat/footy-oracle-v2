import cron from "node-cron";
import { runMLPredictionsNow } from "./mlPredictionsCron.js";
import { generateDailyOracle } from "../services/oracleDailyService.js";

export function startDailyOracleCron() {
  cron.schedule("0 6 * * *", async () => {
    console.log("⏰ Daily Oracle Cron triggered");
    await runMLPredictionsNow();
    await generateDailyOracle();
    console.log("✅ Daily Oracle snapshot generated");
  });

  console.log("⏰ Daily Oracle Cron scheduled for 06:00 UTC.");
}
