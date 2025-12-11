import { startMLPredictionsCron } from "./mlPredictionsCron.js";

/**
 * Backwards-compatible entry for app.ts
 * Simply delegates to the new ML predictions cron implementation.
 */
export function startMLCron() {
  startMLPredictionsCron();
}
