type NormalizedMarket = {
  line: number;
  over?: number;
  under?: number;
  bookmaker: string;
};

type NormalizedOdds = {
  [market: string]: NormalizedMarket;
};

export function normalizeEventOdds(raw: any): NormalizedOdds {
  const normalized: NormalizedOdds = {};

  for (const bookmaker of raw.bookmakers ?? []) {
    for (const market of bookmaker.markets ?? []) {
      const key = market.key;

      if (!market.outcomes || market.outcomes.length === 0) continue;

      const line = market.outcomes[0].point;
      if (line === undefined) continue;

      if (!normalized[key]) {
        normalized[key] = {
          line,
          bookmaker: bookmaker.key,
        };
      }

      for (const outcome of market.outcomes) {
        if (outcome.name === 'Over') {
          if (
            !normalized[key].over ||
            outcome.price > normalized[key].over
          ) {
            normalized[key].over = outcome.price;
            normalized[key].bookmaker = bookmaker.key;
          }
        }

        if (outcome.name === 'Under') {
          if (
            !normalized[key].under ||
            outcome.price > normalized[key].under
          ) {
            normalized[key].under = outcome.price;
            normalized[key].bookmaker = bookmaker.key;
          }
        }
      }
    }
  }

  return normalized;
}