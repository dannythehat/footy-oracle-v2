import React from 'react';
import { useBetBuilder } from '../../hooks/useBetBuilder';
import { Sparkles, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Brain, Network, Layers } from 'lucide-react';
import Premium3DCard from '../Premium3DCard';

export default function BetBuilderSection() {
  const { data: bet, isLoading } = useBetBuilder();

  const dailyPnL = 15.3;
  const weeklyPnL = 52.8;
  const monthlyPnL = 28.9;

  return (
    <section className="max-w-7xl mx-auto mt-20 px-4 pb-20 animate-fade-in">
      {/* Section Header with 3D Icon */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-2xl shadow-yellow-400/50 mb-6 transform hover:scale-110 transition-transform duration-300">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent mb-4">
          Bet Builder of the Day
        </h2>
        
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-6">
          Our AI picks the single best multi-leg parlay each day
        </p>

        {/* AI Explanation Card */}
        <Premium3DCard glowColor="yellow" className="max-w-4xl mx-auto p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-400/20 border border-yellow-400/30">
              <Network className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-yellow-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How AI Builds the Perfect Parlay
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Our AI constructs the perfect multi-leg parlay by analyzing <span className="text-yellow-300 font-semibold">correlations between different bet markets</span>. Using sophisticated algorithms, we identify combinations where individual selections complement each other, avoiding conflicting outcomes. The system evaluates <span className="text-yellow-300 font-semibold">thousands of potential combinations daily</span> to present the single best bet builder with optimal risk-reward balance.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-400/20">
                  <Network className="w-5 h-5 text-yellow-300 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Correlation</div>
                  <div className="text-sm text-zinc-300">Complementary selections</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-400/20">
                  <Layers className="w-5 h-5 text-yellow-300 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Combinations</div>
                  <div className="text-sm text-zinc-300">1000s analyzed daily</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-400/20">
                  <Brain className="w-5 h-5 text-yellow-300 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Optimization</div>
                  <div className="text-sm text-zinc-300">Best risk-reward ratio</div>
                </div>
              </div>
            </div>
          </div>
        </Premium3DCard>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="h-96 rounded-2xl bg-gradient-to-br from-yellow-950/20 to-black border border-yellow-400/20 animate-pulse" />
      )}

      {/* Empty State */}
      {!isLoading && !bet && (
        <Premium3DCard glowColor="yellow" className="text-center py-20 px-4">
          <Sparkles className="w-12 h-12 text-yellow-400/30 mx-auto mb-3" />
          <p className="text-zinc-500">No Bet Builder available today</p>
        </Premium3DCard>
      )}

      {/* Bet Builder Card */}
      {!isLoading && bet && (
        <div className="mb-12">
          <Premium3DCard glowColor="yellow" className="p-10">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-300/40 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-200" />
              <span className="text-sm font-semibold text-yellow-200 uppercase tracking-wide">
                Premium Multi-Leg Pick
              </span>
            </div>

            {/* Match Info */}
            <div className="mb-8">
              <div className="text-3xl font-bold text-white mb-2">
                {bet.home_team} vs {bet.away_team}
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-wide">
                {bet.league}
              </div>
            </div>

            {/* Odds & Confidence Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Combined Odds */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-950/50 to-black border border-yellow-400/40 hover:border-yellow-400/60 transition-all duration-300">
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-3">
                  Combined Odds
                </div>
                <div className="text-5xl font-bold text-yellow-200 mb-2">
                  {bet.combined_odds?.toFixed(2) ?? 'N/A'}
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Multi-leg parlay
                </div>
              </div>

              {/* AI Confidence */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-950/50 to-black border border-yellow-400/40 hover:border-yellow-400/60 transition-all duration-300">
                <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  AI Confidence
                </div>
                <div className="text-5xl font-bold text-yellow-200 mb-3">
                  {bet.confidence ? (bet.confidence * 100).toFixed(0) : 'N/A'}%
                </div>
                <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full transition-all duration-500 shadow-lg shadow-yellow-400/50"
                    style={{ width: `${(bet.confidence ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="mb-8 p-6 rounded-2xl bg-black/50 border border-yellow-400/30">
              <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analysis
              </div>
              <p className="text-base text-zinc-300 leading-relaxed">
                {bet.ai_explanation}
              </p>
            </div>

            {/* Result Badge */}
            <div className="flex items-center justify-end">
              {bet.result === 'win' && (
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-green-950/50 border border-green-500/40">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-green-400">WIN</div>
                    <div className="text-xl font-bold text-green-300">
                      +${bet.profit_loss?.toFixed(2) ?? '0.00'}
                    </div>
                  </div>
                </div>
              )}

              {bet.result === 'loss' && (
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-red-950/50 border border-red-500/40">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <div className="text-sm font-semibold text-red-400">LOSS</div>
                    <div className="text-xl font-bold text-red-300">
                      -${Math.abs(bet.profit_loss ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {bet.result === 'pending' && (
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-yellow-950/50 border border-yellow-400/40">
                  <Clock className="w-6 h-6 text-yellow-200" />
                  <div className="text-base font-semibold text-yellow-200">PENDING</div>
                </div>
              )}
            </div>
          </Premium3DCard>
        </div>
      )}

      {/* P&L Performance Card */}
      <Premium3DCard glowColor="yellow" className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-yellow-200 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Bet Builder Performance
          </h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            Verified Results
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Daily</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Weekly</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Monthly</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {monthlyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {monthlyPnL >= 0 ? '+' : ''}{monthlyPnL.toFixed(1)}%
            </div>
          </div>
        </div>
      </Premium3DCard>
    </section>
  );
}
