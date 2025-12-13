import cron from "node-cron";
import { getBetBuilderOfTheDay } from "../services/betBuilderOfTheDayService.js";

export function startBetBuilderCron() {
  // Run at 08:00 UTC daily (8am GMT)
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("🎯 Running Bet Builder of the Day cron...");
      
      const result = await getBetBuilderOfTheDay();
      
      if (!result.betBuilder) {
        console.log("⚠️ No Bet Builder of the Day available");
        return;
      }

      console.log(
        "✅ Bet Builder of the Day generated:",
        result.betBuilder.homeTeam,
        "vs",
        result.betBuilder.awayTeam,
        `(Composite Score: ${result.compositeScore})`
      );
      
      console.log(`   Markets: ${result.betBuilder.markets.length}`);
      console.log(`   Combined Confidence: ${result.betBuilder.combinedConfidence}%`);
      console.log(`   Combined Odds: ${result.betBuilder.estimatedCombinedOdds}x`);
      
    } catch (err) {
      console.error("❌ BetBuilderCron error:", err);
    }
  });

  console.log("✅ BetBuilderCron scheduled for 08:00 UTC daily");
}
