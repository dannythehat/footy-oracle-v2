import React from 'react';
import { useBetBuilder } from '../../hooks/useBetBuilder';
import { Sparkles, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BetBuilderSection() {
  const { data: bet, isLoading } = useBetBuilder();

  // Calculate P&L (mock data for now - replace with real API)
  const dailyPnL = 15.3;
  const weeklyPnL = 52.8;
  const monthlyPnL = 28.9;

  return (
    <section className="max-w-7xl mx-auto mt-16 px-4 pb-16 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30">
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
          Bet Builder of the Day
        </h2>
      </div>

      <p className="text-sm text-zinc-400 mb-6 ml-1">
        Our AI picks the single best multi-leg parlay each day
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="h-80 rounded-2xl bg-gradient-to-br from-yellow-950/20 to-black border border-yellow-400/20 animate-pulse" />
      )}

      {/* Empty State */}
      {!isLoading && !bet && (
        <div className="text-center py-20 px-4 rounded-2xl bg-gradient-to-br from-yellow-950/10 to-black border border-yellow-400/20">
          <Sparkles className="w-12 h-12 text-yellow-400/30 mx-auto mb-3" />
          <p className="text-zinc-500">No Bet Builder available today</p>
        </div>
      )}

      {/* Bet Builder Card */}
      {!isLoading && bet && (
        <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-yellow-950/20 via-black to-black border border-yellow-400/50 shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:border-yellow-300/70 transition-all duration-300">
          {/* Premium glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/10 group-hover:to-yellow-400/5 transition-all duration-300" />

          <div className="relative">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
                Premium Pick
              </span>
            </div>

            {/* Match Info */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-white mb-2">
                {bet.home_team} vs {bet.away_team}
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                {bet.league}
              </div>
            </div>

            {/* Odds & Confidence Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Combined Odds */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-950/40 to-black border border-yellow-400/30">
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-2">
                  Combined Odds
                </div>
                <div className="text-4xl font-bold text-yellow-300">
                  {bet.combined_odds?.toFixed(2) ?? 'N/A'}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Multi-leg parlay
                </div>
              </div>

              {/* AI Confidence */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-950/40 to-black border border-yellow-400/30">
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-2">
                  AI Confidence
                </div>
                <div className="text-4xl font-bold text-yellow-300">
                  {bet.confidence ? (bet.confidence * 100).toFixed(0) : 'N/A'}%
                </div>
                <div className="mt-3 h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${(bet.confidence ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="mb-6 p-5 rounded-xl bg-black/50 border border-yellow-400/20">
              <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-3">
                AI Analysis
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {bet.ai_explanation}
              </p>
            </div>

            {/* Result Badge */}
            <div className="flex items-center justify-end">
              {bet.result === 'win' && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-950/50 border border-green-500/40">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-green-400">WIN</div>
                    <div className="text-lg font-bold text-green-300">
                      +${bet.profit_loss?.toFixed(2) ?? '0.00'}
                    </div>
                  </div>
                </div>
              )}

              {bet.result === 'loss' && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-950/50 border border-red-500/40">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <div className="text-sm font-semibold text-red-400">LOSS</div>
                    <div className="text-lg font-bold text-red-300">
                      -${Math.abs(bet.profit_loss ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {bet.result === 'pending' && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-yellow-950/50 border border-yellow-400/40">
                  <Clock className="w-6 h-6 text-yellow-300" />
                  <div className="text-sm font-semibold text-yellow-300">PENDING</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* P&L Strip */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-950/10 to-black border border-yellow-400/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-300">Bet Builder Performance</h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Verified Results</div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-400/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Daily</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-400/10">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Weekly</div>
            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-4 rounded-xl bg-black/50 border border-yellow-400/10">
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
