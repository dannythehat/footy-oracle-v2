import axios from "axios";

const KEY = process.env.FOOTBALL_API_KEY!;
const BASE = "https://v3.football.api-sports.io";

interface ApiSportsOddsValue {
  value?: string;
  odd?: string | number;
}

interface ApiSportsOddsBet {
  name?: string;
  values?: ApiSportsOddsValue[];
}

interface ApiSportsOddsBookmaker {
  bets?: ApiSportsOddsBet[];
}

interface ApiSportsOddsFixture {
  bookmakers?: ApiSportsOddsBookmaker[];
}

interface ApiSportsOddsResponse {
  response?: ApiSportsOddsFixture[];
}

/**
 * Fetch odds for a fixture and extract:
 * - over25         => Over 2.5 Goals
 * - btts           => Both Teams To Score (Yes)
 * - over95corners  => Over 9.5 Corners
 * - over35cards    => Over 3.5 Cards
 */
export async function fetchOddsForFixture(fixtureId: number) {
  try {
    const res = await axios.get<ApiSportsOddsResponse>(`${BASE}/odds`, {
      headers: { "x-apisports-key": KEY },
      params: {
        fixture: fixtureId,
        bookmaker: 6, // Bet365 (stable market coverage)
        // IMPORTANT: no "bet" filter here - we want all markets
      },
    });

    const fixture = res.data.response?.[0];
    const bookmakers = fixture?.bookmakers || [];
    const odds: any = {};

    for (const bm of bookmakers) {
      const bets = bm.bets || [];
      for (const bet of bets) {
        const betName = (bet.name || "").toLowerCase();
        const values = bet.values || [];

        for (const val of values) {
          const label = (val.value || "").toLowerCase();
          const oddNum = Number(val.odd);

          if (!isFinite(oddNum)) continue;

          // --- Over 2.5 Goals ---
          if (
            odds.over25 === undefined &&
            (betName.includes("goals over/under") ||
              betName.includes("total goals") ||
              betName.includes("over/under goals")) &&
            label.includes("over 2.5")
          ) {
            odds.over25 = oddNum;
          }

          // --- BTTS Yes ---
          if (
            odds.btts === undefined &&
            (betName.includes("both teams to score") || betName.includes("btts")) &&
            (label === "yes" || label.includes("yes"))
          ) {
            odds.btts = oddNum;
          }

          // --- Over 9.5 Corners ---
          if (
            odds.over95corners === undefined &&
            betName.includes("corners") &&
            label.includes("over 9.5")
          ) {
            odds.over95corners = oddNum;
          }

          // --- Over 3.5 Cards ---
          if (
            odds.over35cards === undefined &&
            (betName.includes("cards") || betName.includes("bookings")) &&
            label.includes("over 3.5")
          ) {
            odds.over35cards = oddNum;
          }
        }
      }
    }

    console.log("🎯 Fetched odds for fixture", fixtureId, odds);
    return odds;
  } catch (err: any) {
    console.error("❌ Odds fetch failed for fixture", fixtureId, err?.message || err);
    return {};
  }
}
