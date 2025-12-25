type NormalizedMarket = {
  line: number | null;
  bookmaker: string;
  over: number | null;
  under: number | null;
};

const BOOKMAKER_PRIORITY = ['bet365', 'pinnacle'];

export function selectBestOdds(
  markets: Record<string, NormalizedMarket | null>
) {
  const result: Record<string, NormalizedMarket> = {};

  for (const [marketKey, market] of Object.entries(markets)) {
    if (!market) continue;

    const bookmaker = market.bookmaker.toLowerCase();

    if (!BOOKMAKER_PRIORITY.includes(bookmaker)) continue;

    if (
      !market.over ||
      !market.under ||
      market.over > 15 ||
      market.under > 15
    ) {
      continue;
    }

    if (!result[marketKey]) {
      result[marketKey] = market;
    } else {
      const existingRank =
        BOOKMAKER_PRIORITY.indexOf(result[marketKey].bookmaker.toLowerCase());
      const currentRank =
        BOOKMAKER_PRIORITY.indexOf(bookmaker);

      if (currentRank < existingRank) {
        result[marketKey] = market;
      }
    }
  }

  return result;
}