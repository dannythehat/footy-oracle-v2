import React from 'react';
import { useValueBets } from '../../hooks/useValueBets';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export default function ValueBetsSection() {
  const { data: bets = [], isLoading } = useValueBets();

  // Calculate P&L (mock data for now - replace with real API)
  const dailyPnL = 8.7;
  const weeklyPnL = 32.4;
  const monthlyPnL = 15.6;

  return (
    <section className="max-w-7xl mx-auto mt-16 px-4 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <Zap className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
          Value Bets of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mb-6 ml-1">
        Bets where AI probability beats bookmaker odds
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gradient-to-br from-blue-950/20 to-black border border-blue-500/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bets.length === 0 && (
        <div className="text-center py-16 px-4 rounded-2xl bg-gradient-to-br from-blue-950/10 to-black border border-blue-500/20">
          <Zap className="w-12 h-12 text-blue-500/30 mx-auto mb-3" />
          <p className="text-zinc-500">No Value Bets available today</p>
        </div>
      )}

      {/* Bet Cards */}
      {!isLoading && bets.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {bets.slice(0, 3).map((bet, index) => (
            <div
              key={bet.bet_id}
              className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-950/20 via-black to-black border border-blue-500/40 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300" />

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
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
                  <div>
                    <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">
                      {bet.market}
                    </div>
                    <div className="text-sm font-semibold text-blue-300">
                      {bet.selection}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 mb-1">Odds</div>
                    <div className="text-xl font-bold text-blue-400">
                      {bet.odds?.toFixed(2) ?? 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Expected Value */}
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-950/50 to-blue-900/30 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Expected Value</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${(bet.value ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(bet.value ?? 0) > 0 ? '+' : ''}{bet.value?.toFixed(1) ?? 'N/A'}%
                      </span>
                      {(bet.value ?? 0) > 0 && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {(bet.value ?? 0) < 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                </div>

                {/* AI Probability */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">AI Probability</span>
                    <span className="text-sm font-bold text-blue-300">
                      {bet.ai_probability ? (bet.ai_probability * 100).toFixed(0) : 'N/A'}%
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${(bet.ai_probability ?? 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="mb-4 p-3 rounded-lg bg-black/50 border border-blue-500/10">
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
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-950/50 border border-blue-500/30">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">PENDING</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* P&L Strip */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-950/10 to-black border border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-300">Value Bets Performance</h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Verified Results</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-blue-500/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Daily</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-blue-500/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Weekly</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-blue-500/10">
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
