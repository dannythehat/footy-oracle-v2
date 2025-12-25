import { fetchEventMarkets } from "./oddsApiClient";
import { normalizeMarket } from "./normalizeOdds";

export async function fetchAndNormalizeOdds(
  sportKey: string,
  eventId: string,
  discoveredMarkets: Record<string, string[]>
) {
  const raw = await fetchEventMarkets(sportKey, eventId);

  const normalized: Record<string, any> = {};

  for (const [marketGroup, marketKeys] of Object.entries(discoveredMarkets)) {
    const rawMarkets: any[] = [];

    for (const bookmaker of raw.bookmakers || []) {
      for (const market of bookmaker.markets || []) {
        if (marketKeys.includes(market.key)) {
          const outcomes = market.outcomes || [];
          const over = outcomes.find(o => o.name === 'Over')?.price ?? null;
          const under = outcomes.find(o => o.name === 'Under')?.price ?? null;
          const line = outcomes.find(o => o.point !== undefined)?.point ?? null;

          rawMarkets.push({
            bookmaker: bookmaker.key,
            line,
            over,
            under
          });
        }
      }
    }

    const clean = normalizeMarket(rawMarkets);
    if (clean) {
      normalized[marketGroup] = clean;
    }
  }

  return normalized;
}