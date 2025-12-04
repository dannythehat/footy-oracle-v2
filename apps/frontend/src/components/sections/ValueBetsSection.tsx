import React from 'react';
import { useValueBets } from '../../hooks/useValueBets';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Zap, Brain, Calculator, BarChart3 } from 'lucide-react';
import Premium3DCard from '../Premium3DCard';

export default function ValueBetsSection() {
  const { data: bets = [], isLoading } = useValueBets();

  const dailyPnL = 8.7;
  const weeklyPnL = 32.4;
  const monthlyPnL = 15.6;

  return (
    <section className="max-w-7xl mx-auto mt-20 px-4 animate-fade-in">
      {/* Section Header with 3D Icon */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/50 mb-6 transform hover:scale-110 transition-transform duration-300">
          <Zap className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent mb-4">
          Value Bets of the Day
        </h2>
        
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-6">
          Bets where AI probability beats bookmaker odds
        </p>

        {/* AI Explanation Card */}
        <Premium3DCard glowColor="blue" className="max-w-4xl mx-auto p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Calculator className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                How Value Betting Works
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Value betting is where our AI's probability assessment <span className="text-blue-400 font-semibold">exceeds the bookmaker's implied odds</span>. Our neural networks process real-time team data, injury reports, tactical analysis, and market movements to identify mispriced odds. When our AI calculates a higher win probability than the bookmaker's odds suggest, we've found value - giving you a <span className="text-blue-400 font-semibold">mathematical edge</span> over the market.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-black/50 border border-blue-500/20">
                  <Calculator className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">Math Edge</div>
                  <div className="text-sm text-zinc-300">AI probability {'>'}  Bookmaker odds</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-blue-500/20">
                  <Brain className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">Neural Networks</div>
                  <div className="text-sm text-zinc-300">Real-time data processing</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">Market Analysis</div>
                  <div className="text-sm text-zinc-300">Identify mispriced odds</div>
                </div>
              </div>
            </div>
          </div>
        </Premium3DCard>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gradient-to-br from-blue-950/20 to-black border border-blue-500/20 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bets.length === 0 && (
        <Premium3DCard glowColor="blue" className="text-center py-20 px-4">
          <Zap className="w-12 h-12 text-blue-500/30 mx-auto mb-3" />
          <p className="text-zinc-500">No Value Bets available today</p>
        </Premium3DCard>
      )}

      {/* Bet Cards */}
      {!isLoading && bets.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {bets.slice(0, 3).map((bet, index) => (
            <Premium3DCard
              key={bet.bet_id}
              glowColor="blue"
              className="p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Value Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 mb-4">
                <Zap className="w-4 h-4 text-blue-300" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                  Value Pick
                </span>
              </div>

              {/* Match Info */}
              <div className="mb-4">
                <div className="text-xl font-bold text-white mb-1">
                  {bet.home_team} vs {bet.away_team}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">
                  {bet.league}
                </div>
              </div>

              {/* Market & Odds */}
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-black border border-blue-500/30">
                <div>
                  <div className="text-xs text-blue-400/70 uppercase tracking-wide mb-1">
                    {bet.market}
                  </div>
                  <div className="text-base font-semibold text-blue-300">
                    {bet.selection}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 mb-1">Odds</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {bet.odds?.toFixed(2) ?? 'N/A'}
                  </div>
                </div>
              </div>

              {/* Expected Value */}
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-950/50 to-blue-900/30 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calculator className="w-3 h-3" />
                    Expected Value
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${(bet.value ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(bet.value ?? 0) > 0 ? '+' : ''}{bet.value?.toFixed(1) ?? 'N/A'}%
                    </span>
                    {(bet.value ?? 0) > 0 && <TrendingUp className="w-5 h-5 text-green-400" />}
                    {(bet.value ?? 0) < 0 && <TrendingDown className="w-5 h-5 text-red-400" />}
                  </div>
                </div>
              </div>

              {/* AI Probability */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI Probability
                  </span>
                  <span className="text-sm font-bold text-blue-300">
                    {bet.ai_probability ? (bet.ai_probability * 100).toFixed(0) : 'N/A'}%
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                    style={{ width: `${(bet.ai_probability ?? 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* AI Explanation */}
              <div className="mb-4 p-4 rounded-xl bg-black/50 border border-blue-500/10">
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {bet.ai_explanation}
                </p>
              </div>

              {/* Result Badge */}
              <div className="flex items-center justify-between">
                {bet.result === 'win' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-950/50 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">WIN</span>
                    <span className="text-sm font-bold text-green-300">
                      +${bet.profit_loss?.toFixed(2) ?? '0.00'}
                    </span>
                  </div>
                )}

                {bet.result === 'loss' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/50 border border-red-500/30">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">LOSS</span>
                    <span className="text-sm font-bold text-red-300">
                      -${Math.abs(bet.profit_loss ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}

                {bet.result === 'pending' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-950/50 border border-blue-500/30">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">PENDING</span>
                  </div>
                )}
              </div>
            </Premium3DCard>
          ))}
        </div>
      )}

      {/* P&L Performance Card */}
      <Premium3DCard glowColor="blue" className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Value Bets Performance
          </h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            Verified Results
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Daily</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Weekly</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
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