import cron from "node-cron";
import { getPredictionsToday, getGoldenBetsToday, getValueBetsToday } from "../services/mlService.js";
import { predictionCache } from "../services/predictionCache.js";
import { attachOdds } from "../services/attachOddsToPredictions.js";

export async function runMLPredictionsNow() {
  const preds = await attachOdds(getPredictionsToday() || []);
  const golden = await attachOdds(getGoldenBetsToday() || []);
  const value = await attachOdds(getValueBetsToday() || []);

  predictionCache.setPredictions(preds);
  predictionCache.setGoldenBets(golden);
  predictionCache.setValueBets(value);

  return {
    predictions: preds.length,
    golden: golden.length,
    value: value.length
  };
}

export function startMlCron() {
  cron.schedule("0 6 * * *", async () => {
    console.log("⏰ ML Cron triggered");
    await runMLPredictionsNow();
  });

  console.log("⏰ ML Cron scheduled for 06:00 UTC daily.");
}
