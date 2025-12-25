import React, { useState } from 'react';
import { useBetHistory, useBetStats } from '../hooks/useBetHistory';
import { TrendingUp, TrendingDown, Trophy, Calendar, CheckCircle, XCircle, Clock, DollarSign, Target, BarChart3 } from 'lucide-react';
import Premium3DCard from '../components/Premium3DCard';

export default function PnLHubPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'golden_bet' | 'bet_builder'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'loss' | 'pending'>('all');
  const [periodView, setPeriodView] = useState<'today' | 'week' | 'month' | 'year' | 'allTime'>('month');
  
  const { data: historyData, isLoading: historyLoading } = useBetHistory({
    betType: selectedFilter !== 'all' ? selectedFilter : undefined,
    result: resultFilter !== 'all' ? resultFilter : undefined,
    limit: 100
  });
  
  const { data: stats, isLoading: statsLoading } = useBetStats();
  
  const bets = historyData?.bets || [];
  const currentStats = stats?.[periodView];
  
  return (
    <div className="min-h-screen bg-[#0a0015] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="w-10 h-10 text-green-400" />
          <h1 className="text-4xl font-bold">P&L Hub</h1>
        </div>
        <p className="text-zinc-400 text-lg">
          Complete transparency - Every bet tracked, verified, and proven
        </p>
      </div>

      {/* Period Tabs */}
      {!statsLoading && stats && (
        <div className="max-w-7xl mx-auto mb-8">
          <Premium3DCard glowColor="purple" className="p-2">
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'year', 'allTime'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setPeriodView(period)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    periodView === period
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </Premium3DCard>
        </div>
      )}

      {/* Stats Cards */}
      {!statsLoading && stats && currentStats && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid md:grid-cols-5 gap-6">
            {/* Total P&L */}
            <Premium3DCard glowColor={currentStats.totalProfitLoss >= 0 ? 'green' : 'red'} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Total P&L</span>
                <DollarSign className="w-5 h-5 text-zinc-400" />
              </div>
              <div className={`text-3xl font-bold ${currentStats.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.totalProfitLoss >= 0 ? '+' : ''}£{currentStats.totalProfitLoss.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{currentStats.totalBets} bets</div>
            </Premium3DCard>

            {/* Win Rate */}
            <Premium3DCard glowColor="purple" className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Win Rate</span>
                <Target className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {currentStats.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">{currentStats.wins}W / {currentStats.losses}L</div>
            </Premium3DCard>

            {/* ROI */}
            <Premium3DCard glowColor="blue" className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">ROI</span>
                <BarChart3 className="w-5 h-5 text-zinc-400" />
              </div>
              <div className={`text-3xl font-bold ${currentStats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.roi >= 0 ? '+' : ''}{currentStats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">£{currentStats.totalStake} staked</div>
            </Premium3DCard>

            {/* Golden Bets */}
            <Premium3DCard glowColor="yellow" className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Golden Bets</span>
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div className={`text-3xl font-bold ${currentStats.byType.goldenBets.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.byType.goldenBets.profitLoss >= 0 ? '+' : ''}£{currentStats.byType.goldenBets.profitLoss.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{currentStats.byType.goldenBets.winRate.toFixed(0)}% WR</div>
            </Premium3DCard>

            {/* Bet Builders */}
            <Premium3DCard glowColor="cyan" className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Bet Builders</span>
                <Trophy className="w-5 h-5 text-cyan-400" />
              </div>
              <div className={`text-3xl font-bold ${currentStats.byType.betBuilders.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentStats.byType.betBuilders.profitLoss >= 0 ? '+' : ''}£{currentStats.byType.betBuilders.profitLoss.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{currentStats.byType.betBuilders.winRate.toFixed(0)}% WR</div>
            </Premium3DCard>
          </div>
        </div>
      )}

      {/* Daily Trend Chart (30 days) */}
      {!statsLoading && stats?.dailyTrend && (
        <div className="max-w-7xl mx-auto mb-8">
          <Premium3DCard glowColor="purple" className="p-6">
            <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              30-Day P&L Trend
            </h3>
            <div className="h-64 flex items-end gap-1">
              {stats.dailyTrend.map((day, idx) => {
                const maxProfit = Math.max(...stats.dailyTrend.map(d => Math.abs(d.profitLoss)));
                const height = maxProfit > 0 ? (Math.abs(day.profitLoss) / maxProfit) * 100 : 0;
                
                return (
                  <div 
                    key={idx} 
                    className="flex-1 group relative flex flex-col justify-end"
                  >
                    <div 
                      className={`w-full rounded-t transition-all ${
                        day.profitLoss >= 0 
                          ? 'bg-green-500 hover:bg-green-400' 
                          : 'bg-red-500 hover:bg-red-400'
                      }`}
                      style={{ height: `${height}%`, minHeight: day.bets > 0 ? '4px' : '0' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-900 border border-purple-500/30 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                        <div className="font-semibold">{new Date(day.date).toLocaleDateString()}</div>
                        <div className={day.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {day.profitLoss >= 0 ? '+' : ''}£{day.profitLoss.toFixed(2)}
                        </div>
                        <div className="text-zinc-500">{day.wins}W / {day.losses}L</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-xs text-zinc-500">
              <span>{stats.dailyTrend[0]?.date}</span>
              <span>{stats.dailyTrend[stats.dailyTrend.length - 1]?.date}</span>
            </div>
          </Premium3DCard>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <Premium3DCard glowColor="purple" className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Bet Type</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Bets</option>
                <option value="golden_bet">Golden Bets Only</option>
                <option value="bet_builder">Bet Builders Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Result</label>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as any)}
                className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Results</option>
                <option value="win">Wins Only</option>
                <option value="loss">Losses Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>
        </Premium3DCard>
      </div>

      {/* Bet History */}
      <div className="max-w-7xl mx-auto">
        {historyLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading bet history...</p>
          </div>
        ) : bets.length === 0 ? (
          <Premium3DCard glowColor="purple" className="p-20 text-center">
            <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No Bets Yet</h3>
            <p className="text-zinc-500">Your bet history will appear here once predictions are made</p>
          </Premium3DCard>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <Premium3DCard 
                key={bet._id} 
                glowColor={bet.betType === 'golden_bet' ? 'yellow' : 'blue'} 
                className="p-6"
              >
                <div className="grid md:grid-cols-12 gap-4 items-center">
                  {/* Date & Type */}
                  <div className="md:col-span-2">
                    <div className="text-xs text-zinc-500 mb-1">
                      {new Date(bet.kickoff).toLocaleDateString()}
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      bet.betType === 'golden_bet' 
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {bet.betType === 'golden_bet' ? 'Golden Bet' : 'Bet Builder'}
                    </div>
                  </div>

                  {/* Match */}
                  <div className="md:col-span-3">
                    <div className="font-semibold text-white">{bet.homeTeam} vs {bet.awayTeam}</div>
                    <div className="text-xs text-zinc-500">{bet.league}</div>
                  </div>

                  {/* Market */}
                  <div className="md:col-span-2">
                    {bet.market ? (
                      <div className="text-sm text-zinc-300">{bet.market.toUpperCase()}</div>
                    ) : (
                      <div className="text-sm text-zinc-300">
                        {bet.markets?.map(m => m.market.toUpperCase()).join(' + ')}
                      </div>
                    )}
                  </div>

                  {/* Confidence & Odds */}
                  <div className="md:col-span-2">
                    <div className="text-sm font-semibold text-purple-300">{bet.confidence.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500">
                      {bet.odds ? `@ ${bet.odds.toFixed(2)}` : 'No odds'}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="md:col-span-2">
                    {bet.result === 'win' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-950/50 border border-green-500/30">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">WIN</span>
                      </div>
                    )}
                    {bet.result === 'loss' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/30">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-red-400">LOSS</span>
                      </div>
                    )}
                    {bet.result === 'pending' && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-950/50 border border-yellow-500/30">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">PENDING</span>
                      </div>
                    )}
                  </div>

                  {/* P&L */}
                  <div className="md:col-span-1 text-right">
                    <div className={`text-lg font-bold ${bet.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bet.profitLoss >= 0 ? '+' : ''}£{bet.profitLoss.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* AI Commentary */}
                <div className="mt-4 p-3 rounded-lg bg-black/50 border border-purple-500/10">
                  <div className="text-xs text-purple-400 mb-1 font-semibold">AI Analysis</div>
                  <p className="text-sm text-zinc-300">{bet.aiCommentary}</p>
                </div>
              </Premium3DCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
