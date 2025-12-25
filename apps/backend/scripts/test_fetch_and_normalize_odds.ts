import { fetchEventMarkets } from "../src/services/oddsApiClient.js";
import { normalizeOdds } from "../src/services/normalizeOdds.js";

const SPORT = "soccer_epl";
const EVENT_ID = "7867392310794b77294b542fcf6940cf";

(async () => {
  try {
    const raw = await fetchEventMarkets(SPORT, EVENT_ID);

    const normalized = normalizeOdds(raw);

    console.log(
      JSON.stringify(normalized, null, 2)
    );
  } catch (err: any) {
    console.error("TEST FAILED");
    console.error(
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2)
    );
    process.exit(1);
  }
})();