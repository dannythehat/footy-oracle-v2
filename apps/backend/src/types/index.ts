export interface Prediction { }
export interface GoldenBet { fixtureId: string; }
export interface ValueBet { fixtureId: string; }
export interface IFixture {
  _id?: any;
  kickoff?: string;
  venue?: string;
  homeForm?: any;
  awayForm?: any;
  headToHead?: any;
  homeStats?: any;
  awayStats?: any;
}
export interface IFeaturedSelection {
  calculateProfit?: () => number;
}
