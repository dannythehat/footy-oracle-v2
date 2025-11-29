import React from 'react';
import { useGoldenBets } from '../../hooks/useGoldenBets';
import { Trophy, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function GoldenBetsSection() {
  const { data: bets = [], isLoading } = useGoldenBets();

  // Calculate P&L (mock data for now - replace with real API)
  const dailyPnL = 12.5;
  const weeklyPnL = 45.2;
  const monthlyPnL = -8.3;

  return (
    <section className="max-w-7xl mx-auto mt-16 px-4 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          Golden Bets of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mb-6 ml-1">
        Highest-confidence AI predictions with premium gold rating
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gradient-to-br from-yellow-950/20 to-black border border-yellow-500/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bets.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-gradient-to-br from-yellow-950/10 to-black border border-yellow-500/20">
          <Trophy className="w-12 h-12 text-yellow-500/30 mx-auto mb-3" />
          <p className="text-zinc-500">No Golden Bets available today</p>
        </div>
      )}

      {/* Bet Cards */}
      {!isLoading && bets.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {bets.slice(0, 3).map((bet, index) => (
            <div
              key={bet.bet_id}
              className="group relative p-5 rounded-2xl bg-gradient-to-br from-yellow-950/20 via-black to-black border border-yellow-500/40 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:border-yellow-400/60 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-yellow-500/10 transition-all duration-300" />

              <div className="relative">
                {/* Match Info */}
                <div className="mb-4">
                  <div className="text-lg font-bold text-white mb-1">
                    {bet.home_team} vs {bet.away_team}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">
                    {bet.league}
                  </div>
                </div>

                {/* Market & Odds */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
                  <div>
                    <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">
                      {bet.market}
                    </div>
                    <div className="text-sm font-semibold text-yellow-300">
                      {bet.selection}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 mb-1">Odds</div>
                    <div className="text-xl font-bold text-yellow-400">
                      {bet.odds?.toFixed(2) ?? 'N/A'}
                    </div>
                  </div>
                </div>

                {/* AI Confidence */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">AI Confidence</span>
                    <span className="text-sm font-bold text-yellow-300">
                      {bet.ai_probability ? (bet.ai_probability * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${(bet.ai_probability ?? 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="mb-4 p-3 rounded-lg bg-black/50 border border-yellow-500/10">
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {bet.ai_explanation}
                  </p>
                </div>

                {/* Result Badge */}
                <div className="flex items-center justify-between">
                  {bet.result === 'win' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-950/50 border border-green-500/30">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">WIN</span>
                      <span className="text-sm font-bold text-green-300">
                        +${bet.profit_loss?.toFixed(2) ?? '0.00'}
                      </span>
                    </div>
                  )}

                  {bet.result === 'loss' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/50 border border-red-500/30">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">LOSS</span>
                      <span className="text-sm font-bold text-red-300">
                        -${Math.abs(bet.profit_loss ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {bet.result === 'pending' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-950/50 border border-yellow-500/30">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">PENDING</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* P&L Strip */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-950/10 to-black border border-yellow-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-300">Golden Bets Performance</h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Verified Results</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-500/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Daily</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-500/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Weekly</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-500/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Monthly</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthlyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {monthlyPnL >= 0 ? '+' : ''}{monthlyPnL.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
