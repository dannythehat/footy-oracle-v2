export const PREMIUM_LEAGUES = [
  // Top European leagues
  39, 140, 135, 78, 61, 88, 94, 144, 179, 203, 169, 218, 103, 1038, 113,

  // Second divisions
  40, 41, 42, 141, 136, 79, 62, 89, 95, 145, 180, 204, 170,

  // European competitions
  2, 3, 848
];

export function isPremiumLeague(leagueId: number): boolean {
  return PREMIUM_LEAGUES.includes(leagueId);
}
