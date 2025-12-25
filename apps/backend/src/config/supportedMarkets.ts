export const SUPPORTED_MARKETS = {
  goals: ["totals", "alternate_totals"],
  btts: ["btts"],
  corners: ["alternate_totals_corners"],
  cards: ["alternate_totals_cards"],
} as const;

export type SupportedMarketGroup = keyof typeof SUPPORTED_MARKETS;