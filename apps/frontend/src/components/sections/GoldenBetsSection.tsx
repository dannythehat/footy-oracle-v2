import React from 'react';
import { useGoldenBets } from '../../hooks/useGoldenBets';
import { Trophy, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function GoldenBetsSection() {
  const { data: bets = [], isLoading } = useGoldenBets();

  return (
    <section className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-yellow-400" />
        <h2 className="text-3xl font-bold text-yellow-300 tracking-tight">
          Golden Bets of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mt-1 ml-1">
        Highest-confidence AI predictions with premium gold rating.
      </p>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-6 text-zinc-400">Loading Golden Bets...</div>
      )}

      {/* Empty state */}
      {!isLoading && bets.length === 0 && (
        <div className="mt-6 text-zinc-500">No Golden Bets available today.</div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {bets.map((bet) => (
          <div
            key={bet.bet_id}
            className="p-4 rounded-2xl bg-black border border-yellow-500/40 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-transform"
          >
            {/* Match */}
            <div className="font-semibold text-lg text-white">
              {bet.home_team} vs {bet.away_team}
            </div>

            <div className="text-xs text-zinc-500 mt-1">
              {bet.league}
            </div>

            {/* Market + odds */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-yellow-300">
                {bet.market.toUpperCase()} → {bet.selection}
              </span>
              <span className="text-sm text-yellow-400 font-bold">
                @{bet.odds?.toFixed(2) ?? 'N/A'}
              </span>
            </div>

            {/* Probability */}
            <div className="mt-2 text-sm text-zinc-300">
              AI Probability:{' '}
              <span className="text-yellow-300 font-semibold">
                {bet.ai_probability ? (bet.ai_probability * 100).toFixed(0) : 'N/A'}%
              </span>
            </div>

            {/* AI explanation */}
            <div className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">
              {bet.ai_explanation}
            </div>

            {/* Result badge */}
            <div className="mt-4 flex items-center justify-between">
              {bet.result === 'win' && (
                <div className="flex items-center text-green-400 text-sm gap-1">
                  <CheckCircle className="w-4 h-4" /> WIN
                </div>
              )}

              {bet.result === 'loss' && (
                <div className="flex items-center text-red-400 text-sm gap-1">
                  <XCircle className="w-4 h-4" /> LOSS
                </div>
              )}

              {bet.result === 'pending' && (
                <div className="text-yellow-300 text-sm">Pending</div>
              )}

              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
