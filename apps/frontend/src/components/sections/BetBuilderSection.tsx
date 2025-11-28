import React from "react";
import { useBetBuilder } from "../../hooks/useBetBuilder";
import { Sparkles, CheckCircle, XCircle } from "lucide-react";

export default function BetBuilderSection() {
  const { data: bet, isLoading } = useBetBuilder();

  return (
    <section className="max-w-4xl mx-auto mt-12 px-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-blue-300" />
        <h2 className="text-3xl font-bold text-blue-200 tracking-tight">
          Bet Builder of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mt-1 ml-1">
        Our AI picks the single best multi-leg parlay each day.
      </p>

      {isLoading && (
        <div className="mt-6 text-zinc-400">Loading Bet Builder...</div>
      )}

      {!isLoading && !bet && (
        <div className="mt-6 text-zinc-500">No Bet Builder available today.</div>
      )}

      {bet && (
        <div className="mt-6 p-6 rounded-2xl bg-black border border-blue-500/40 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition">

          {/* Match */}
          <div className="text-xl font-semibold text-white">
            {bet.home_team} vs {bet.away_team}
          </div>

          <div className="text-xs text-zinc-500 mt-1">{bet.league}</div>

          {/* Odds + Confidence */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-blue-300 font-semibold text-lg">
              Combined Odds: @{bet.combined_odds.toFixed(2)}
            </div>

            <div className="text-zinc-300 text-sm">
              Confidence:{" "}
              <span className="text-blue-400 font-bold">
                {(bet.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
            {bet.ai_explanation}
          </p>

          {/* Result */}
          <div className="mt-5 flex items-center justify-end">
            {bet.result === "win" && (
              <div className="flex items-center text-green-400 text-sm gap-1">
                <CheckCircle className="w-5 h-5" /> WIN
              </div>
            )}

            {bet.result === "loss" && (
              <div className="flex items-center text-red-400 text-sm gap-1">
                <XCircle className="w-5 h-5" /> LOSS
              </div>
            )}

            {bet.result === "pending" && (
              <div className="text-blue-300 text-sm">Pending</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
