import React from 'react';
import { useValueBets } from '../../hooks/useValueBets';
import { Tag, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function ValueBetsSection() {
  const { data: bets = [], isLoading } = useValueBets();

  return (
    <section className="max-w-5xl mx-auto mt-12 px-4">
      <div className="flex items-center gap-3">
        <Tag className="w-7 h-7 text-purple-400" />
        <h2 className="text-3xl font-bold text-purple-300 tracking-tight">
          Value Bets of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mt-1 ml-1">
        Bets where AI probability beats bookmaker odds.
      </p>

      {isLoading && (
        <div className="mt-6 text-zinc-400">Loading Value Bets...</div>
      )}

      {!isLoading && bets.length === 0 && (
        <div className="mt-6 text-zinc-500">No Value Bets today.</div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {bets.slice(0, 3).map((bet) => (
          <div
            key={bet.bet_id}
            className="p-4 rounded-2xl bg-black border border-purple-500/40 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-transform"
          >
            <div className="font-semibold text-lg text-white">
              {bet.home_team} vs {bet.away_team}
            </div>

            <div className="text-xs text-zinc-500 mt-1">
              {bet.league}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-300">
                {bet.market.toUpperCase()} ? {bet.selection}
              </span>
              <span className="text-sm text-purple-400 font-bold">
                @{bet.odds.toFixed(2)}
              </span>
            </div>

            <div className="mt-2 text-sm text-zinc-300">
              Expected Value:{' '}
              <span
                className={`font-semibold ${
                  bet.value > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {bet.value > 0 ? '+' : ''}
                {bet.value.toFixed(1)}%
              </span>
            </div>

            <div className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">
              {bet.ai_explanation}
            </div>

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
                <div className="text-purple-300 text-sm">Pending</div>
              )}

              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
