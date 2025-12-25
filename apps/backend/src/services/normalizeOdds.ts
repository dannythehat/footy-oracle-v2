type NormalizedOdds = {
  goals?: Record<string, any>;
  cards?: Record<string, any>;
  corners?: Record<string, any>;
};

const ALLOWED_BOOKMAKERS = ["pinnacle", "bet365"];

const GOALS_LINES = [1.5, 2.5, 3.5, 4.5];
const CARDS_LINES = [2.5, 3.5, 4.5];
const CORNERS_LINES = [8.5, 9.5, 10.5];

export function normalizeOdds(raw: any): NormalizedOdds {
  const out: NormalizedOdds = {
    goals: {},
    cards: {},
    corners: {}
  };

  if (!raw || !raw.bookmakers) {
    return out;
  }

  for (const bookmaker of raw.bookmakers) {
    if (!ALLOWED_BOOKMAKERS.includes(bookmaker.key)) continue;

    for (const market of bookmaker.markets || []) {
      const outcomes = market.outcomes || [];
      if (outcomes.length !== 2) continue;

      const over = outcomes.find((o: any) => o.name === "Over");
      const under = outcomes.find((o: any) => o.name === "Under");
      if (!over || !under) continue;

      const line = Number(over.point);
      if (!line || line === 0.5) continue;

      if (market.key === "totals" || market.key === "alternate_totals") {
        if (!GOALS_LINES.includes(line)) continue;
        out.goals![line] = { over: over.price, under: under.price, bookmaker: bookmaker.key };
      }

      if (market.key === "alternate_totals_cards") {
        if (!CARDS_LINES.includes(line)) continue;
        out.cards![line] = { over: over.price, under: under.price, bookmaker: bookmaker.key };
      }

      if (market.key === "alternate_totals_corners") {
        if (!CORNERS_LINES.includes(line)) continue;
        out.corners![line] = { over: over.price, under: under.price, bookmaker: bookmaker.key };
      }
    }
  }

  return out;
}