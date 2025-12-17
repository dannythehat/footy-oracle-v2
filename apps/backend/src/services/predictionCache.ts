let predictions: any[] = [];
let goldenBets: any[] = [];
let valueBets: any[] = [];
let dailyOracle: any = null;

export const predictionCache = {
  setPredictions(list: any[]) {
    predictions = list || [];
  },

  setGolden(list: any[]) {
    goldenBets = list || [];
  },
  setValue(list: any[]) {
    valueBets = list || [];
  },

  setGoldenBets(list: any[]) {
    goldenBets = list || [];
  },
  setValueBets(list: any[]) {
    valueBets = list || [];
  },

  setDailyOracle(snapshot: any) {
    dailyOracle = snapshot;
  },

  getPredictions() {
    return predictions;
  },
  getGoldenBets() {
    return goldenBets;
  },
  getValueBets() {
    return valueBets;
  },
  getDailyOracle() {
    return dailyOracle;
  },

  getStatus() {
    return {
      predictions: predictions.length,
      goldenBets: goldenBets.length,
      valueBets: valueBets.length,
      hasOracle: !!dailyOracle
    };
  },
};
