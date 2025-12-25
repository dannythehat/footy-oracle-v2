import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBetStats } from '../../hooks/useBetHistory';
import { TrendingUp, Trophy, ArrowRight, DollarSign, Target } from 'lucide-react';
import Premium3DCard from '../Premium3DCard';

export default function PnLHubSection() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useBetStats();

  const monthStats = stats?.month;

  return (
    <section className="max-w-7xl mx-auto mt-20 px-4 animate-fade-in">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-2xl shadow-green-500/50 mb-6 transform hover:scale-110 transition-transform duration-300">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent mb-4">
          P&L Transparency Hub
        </h2>
        
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-6">
          Every bet tracked, timestamped, and verified with AI commentary
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto"></div>
        </div>
      ) : monthStats ? (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Total P&L */}
            <Premium3DCard glowColor={monthStats.totalProfitLoss >= 0 ? 'green' : 'red'} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400 uppercase tracking-wide">30-Day P&L</span>
                <DollarSign className="w-5 h-5 text-zinc-400" />
              </div>
              <div className={`text-4xl font-bold ${monthStats.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthStats.totalProfitLoss >= 0 ? '+' : ''}£{monthStats.totalProfitLoss.toFixed(2)}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {monthStats.totalBets} total bets
              </div>
            </Premium3DCard>

            {/* Win Rate */}
            <Premium3DCard glowColor="purple" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400 uppercase tracking-wide">Win Rate</span>
                <Target className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-4xl font-bold text-purple-400">
                {monthStats.winRate.toFixed(1)}%
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {monthStats.wins} wins / {monthStats.losses} losses
              </div>
            </Premium3DCard>

            {/* Verified Bets */}
            <Premium3DCard glowColor="yellow" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-400 uppercase tracking-wide">ROI</span>
                <Trophy className="w-5 h-5 text-zinc-400" />
              </div>
              <div className={`text-4xl font-bold ${monthStats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {monthStats.roi >= 0 ? '+' : ''}{monthStats.roi.toFixed(1)}%
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                on £{monthStats.totalStake} staked
              </div>
            </Premium3DCard>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/pnl-hub')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
            >
              View Full P&L History
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <Premium3DCard glowColor="green" className="p-20 text-center">
          <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-zinc-400 mb-2">No Data Yet</h3>
          <p className="text-zinc-500">P&L tracking will begin once bets are placed</p>
        </Premium3DCard>
      )}
    </section>
  );
}
