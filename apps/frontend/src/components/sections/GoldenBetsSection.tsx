import React from 'react';
import { useGoldenBets } from '../../hooks/useGoldenBets';
import { Trophy, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Sparkles, Brain, Target, Zap } from 'lucide-react';
import Premium3DCard from '../Premium3DCard';

export default function GoldenBetsSection() {
  const { data: bets = [], isLoading } = useGoldenBets();

  const dailyPnL = 12.5;
  const weeklyPnL = 45.2;
  const monthlyPnL = -8.3;

  return (
    <section className="max-w-7xl mx-auto mt-20 px-4 animate-fade-in">
      {/* Section Header with 3D Icon */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-500/50 mb-6 transform hover:scale-110 transition-transform duration-300">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-4">
          Golden Bets of the Day
        </h2>
        
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-6">
          Highest-confidence AI predictions with premium gold rating
        </p>

        {/* AI Explanation Card */}
        <Premium3DCard glowColor="yellow" className="max-w-4xl mx-auto p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Brain className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How Our AI Finds Golden Bets
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Our AI analyzes <span className="text-yellow-400 font-semibold">thousands of data points</span> including team form, head-to-head records, player statistics, injury reports, and historical patterns to identify the highest-confidence betting opportunities. Using advanced machine learning models trained on years of football data, we calculate precise win probabilities and only surface bets where our AI shows <span className="text-yellow-400 font-semibold">exceptional confidence (85%+)</span>.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-500/20">
                  <Target className="w-5 h-5 text-yellow-400 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Precision</div>
                  <div className="text-sm text-zinc-300">85%+ AI confidence required</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-500/20">
                  <Brain className="w-5 h-5 text-yellow-400 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Data Points</div>
                  <div className="text-sm text-zinc-300">1000+ factors analyzed</div>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-yellow-500/20">
                  <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">Real-Time</div>
                  <div className="text-sm text-zinc-300">Live updates every 30s</div>
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
              className="relative h-80 rounded-2xl bg-gradient-to-br from-yellow-950/20 to-black border border-yellow-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-shimmer" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-yellow-500/10 rounded animate-pulse" />
                <div className="h-4 bg-yellow-500/10 rounded w-2/3 animate-pulse" />
                <div className="h-24 bg-yellow-500/10 rounded animate-pulse" />
                <div className="h-4 bg-yellow-500/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && bets.length === 0 && (
        <Premium3DCard glowColor="yellow" className="text-center py-20 px-4">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 mb-6">
              <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-300 mb-3">Golden Bets Coming Soon</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Our AI is analyzing today's fixtures to find the most valuable betting opportunities. Check back soon!
            </p>
          </div>
        </Premium3DCard>
      )}

      {/* Bet Cards */}
      {!isLoading && bets.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {bets.slice(0, 3).map((bet, index) => (
            <Premium3DCard
              key={bet.bet_id}
              glowColor="yellow"
              className="p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 mb-4">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wide">
                  Golden Pick
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
              <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-gradient-to-br from-yellow-950/40 to-black border border-yellow-500/30">
                <div>
                  <div className="text-xs text-yellow-400/70 uppercase tracking-wide mb-1">
                    {bet.market}
                  </div>
                  <div className="text-base font-semibold text-yellow-300">
                    {bet.selection}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 mb-1">Odds</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {bet.odds?.toFixed(2) ?? 'N/A'}
                  </div>
                </div>
              </div>

              {/* AI Confidence */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI Confidence
                  </span>
                  <span className="text-sm font-bold text-yellow-300">
                    {bet.ai_probability ? (bet.ai_probability * 100).toFixed(0) : 'N/A'}%
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500 shadow-lg shadow-yellow-500/50"
                    style={{ width: `${(bet.ai_probability ?? 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* AI Explanation */}
              <div className="mb-4 p-4 rounded-xl bg-black/50 border border-yellow-500/10">
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
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-950/50 border border-yellow-500/30">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">PENDING</span>
                  </div>
                )}
              </div>
            </Premium3DCard>
          ))}
        </div>
      )}

      {/* P&L Performance Card */}
      <Premium3DCard glowColor="yellow" className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-yellow-300 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Golden Bets Performance
          </h3>
          <div className="text-xs text-zinc-500 uppercase tracking-wide px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            Verified Results
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Daily P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Daily</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Weekly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Weekly</div>
            <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${weeklyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {weeklyPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              {weeklyPnL >= 0 ? '+' : ''}{weeklyPnL.toFixed(1)}%
            </div>
          </div>

          {/* Monthly P&L */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
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
