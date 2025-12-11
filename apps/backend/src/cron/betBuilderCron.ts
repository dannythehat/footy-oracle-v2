import cron from "node-cron";
import { predictionCache } from "../services/predictionCache.js";
import { isPremiumLeague } from "../services/leagueFilter.js";


export function startBetBuilderCron() {
  cron.schedule("0 6 * * *", async () => {
    try {
      const preds = predictionCache.getPredictions() || [];

      const candidates = preds.filter(p =>
        p && p.fixture && isPremiumLeague(p.fixture.leagueId)
      ).map(p => {
        const probs = [
          p.markets?.btts,
          p.markets?.over25,
          p.markets?.cardsOver35,
          p.markets?.cornersOver95
        ].filter(x => x >= 0.7);

        return {
          fixture: p.fixture,
          count: probs.length,
          probs
        };
      }).filter(x => x.count >= 3);

      if (candidates.length === 0) {
        console.log("NO Bet Builder of the Day.");
        return;
      }

      const sorted = candidates.sort((a, b) => {
        const aMax = Math.max(...a.probs);
        const bMax = Math.max(...b.probs);
        if (bMax !== aMax) return bMax - aMax;

        const aSum = a.probs.sort((x, y) => y - x).slice(0, 3).reduce((s, n) => s + n, 0);
        const bSum = b.probs.sort((x, y) => y - x).slice(0, 3).reduce((s, n) => s + n, 0);
        return bSum - aSum;
      });

      const chosen = sorted[0];

      await 

      console.log("Bet Builder OF THE DAY saved:", chosen.fixture?.homeTeam, "vs", chosen.fixture?.awayTeam);

    } catch (err) {
      console.error("BetBuilderCron error:", err);
    }
  });

  console.log("BetBuilderCron scheduled for 06:00 UTC daily.");
}

