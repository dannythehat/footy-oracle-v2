import { Prediction, GoldenBet, ValueBet, IFixture, IFeaturedSelection } from '../types/index.js';
export async function loadGoldenBets(fixtures?: any[]): Promise<GoldenBet[]> { return []; }
export async function loadValueBets(fixtures?: any[]): Promise<ValueBet[]> { return []; }
export async function loadMLPredictions() { return []; }
export async function selectGoldenBets(predictions: any, count: number) { return []; }
