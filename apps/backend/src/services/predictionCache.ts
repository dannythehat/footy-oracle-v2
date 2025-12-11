let predictions: any[] = [];
let goldenBets: any[] = [];
let valueBets: any[] = [];

export const predictionCache = {
  // SETTERS
  setPredictions(list: any[]) {
    predictions = list || [];
  },

  // Legacy setter names
  setGolden(list: any[]) {
    goldenBets = list || [];
  },
  setValue(list: any[]) {
    valueBets = list || [];
  },

  // New setter names used by cron
  setGoldenBets(list: any[]) {
    goldenBets = list || [];
  },
  setValueBets(list: any[]) {
    valueBets = list || [];
  },

  // GETTERS
  getPredictions() {
    return predictions;
  },
  getGoldenBets() {
    return goldenBets;
  },
  getValueBets() {
    return valueBets;
  },

  getStatus() {
    return {
      predictions: predictions.length,
      goldenBets: goldenBets.length,
      valueBets: valueBets.length,
    };
  },

  // Property-style access (used in routes like goldenBets.js / valueBets.js)
  get predictions() {
    return predictions;
  },
  get goldenBets() {
    return goldenBets;
  },
  get valueBets() {
    return valueBets;
  },
};
