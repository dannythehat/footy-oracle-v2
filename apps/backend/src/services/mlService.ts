import fs from "fs";
import path from "path";

/**
 * Canonical ML outputs root.
 * MUST match oracleDailyService.ts
 */
const ML_OUTPUT_DIR =
  process.env.ML_OUTPUTS_PATH ||
  path.resolve(process.cwd(), "../../shared/ml_outputs");

function loadJson(file: string) {
  try {
    const full = path.join(ML_OUTPUT_DIR, file);
    if (!fs.existsSync(full)) {
      return null;
    }
    const raw = fs.readFileSync(full, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading ML JSON file:", file, err);
    return null;
  }
}

export function getPredictionsToday() {
  return loadJson("predictions.json") || [];
}

export function getGoldenBetsToday() {
  return loadJson("golden_bets.json") || [];
}

export function getValueBetsToday() {
  return loadJson("value_bets.json") || [];
}