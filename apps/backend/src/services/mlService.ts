import fs from 'fs';
import path from 'path';

// Use environment variable or fallback to relative path
const ML_OUTPUT_DIR = process.env.ML_OUTPUT_DIR || 
  path.resolve('./shared/ml_outputs');

console.log(`📂 ML Output Directory: ${ML_OUTPUT_DIR}`);

function loadJson(file: string) {
  try {
    const full = path.join(ML_OUTPUT_DIR, file);
    
    if (!fs.existsSync(full)) {
      console.warn(`⚠️  ML file not found: ${full}`);
      return null;
    }
    
    const raw = fs.readFileSync(full, 'utf8');
    const data = JSON.parse(raw);
    
    console.log(`✅ Loaded ML file: ${file} (${Array.isArray(data) ? data.length : 0} items)`);
    return data;
  } catch (err) {
    console.error(`❌ Error loading ML JSON file: ${file}`, err);
    return null;
  }
}

export function getPredictionsToday() {
  return loadJson('predictions.json') || [];
}

export function getGoldenBetsToday() {
  return loadJson('golden_bets.json') || [];
}

export function getValueBetsToday() {
  return loadJson('value_bets.json') || [];
}
