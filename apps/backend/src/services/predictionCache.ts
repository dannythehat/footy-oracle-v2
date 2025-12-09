import { GoldenBet, ValueBet, MLPrediction } from "./mlService.js";

class PredictionCache {
  predictions: MLPrediction[] = [];
  golden: GoldenBet[] = [];
  value: ValueBet[] = [];

  setPredictions(p: MLPrediction[]) {
    this.predictions = p;
  }

  setGoldenBets(g: GoldenBet[]) {
    this.golden = g;
  }

  setValueBets(v: ValueBet[]) {
    this.value = v;
  }

  getPredictions() {
    return this.predictions;
  }

  getGoldenBets() {
    return this.golden;
  }

  getValueBets() {
    return this.value;
  }
}

export const predictionCache = new PredictionCache();
