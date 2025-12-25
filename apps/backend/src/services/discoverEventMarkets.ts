export function discoverEventMarkets(raw: any): Record<string, any[]> {
  const result: Record<string, any[]> = {};

  try {
    if (!raw || !Array.isArray(raw.bookmakers)) {
      return {};
    }

    for (const bookmaker of raw.bookmakers) {
      if (!bookmaker || !Array.isArray(bookmaker.markets)) continue;

      for (const market of bookmaker.markets) {
        if (!market || !Array.isArray(market.outcomes)) continue;

        const key = market.key;
        if (!key) continue;

        if (!result[key]) {
          result[key] = [];
        }

        const over = market.outcomes.find(o => o.name === 'Over');
        const under = market.outcomes.find(o => o.name === 'Under');

        result[key].push({
          bookmaker: bookmaker.key,
          line: over?.point ?? under?.point ?? null,
          over: over?.price ?? null,
          under: under?.price ?? null
        });
      }
    }

    return result;
  } catch (err) {
    // 🔒 NEVER throw raw objects
    console.error("discoverEventMarkets error:", err);
    return {};
  }
}