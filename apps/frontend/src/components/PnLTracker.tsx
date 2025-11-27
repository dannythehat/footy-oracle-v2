import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Filter } from 'lucide-react';

interface PnLStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  voids: number;
  totalStaked: number;
  totalProfit: number;
  winRate: number;
  roi: number;
  averageOdds: number;
}

interface PnLBreakdown {
  overall: PnLStats;
  goldenBets: PnLStats;
  betBuilders: PnLStats;
  valueBets: PnLStats;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

const PnLTracker: React.FC = () => {
  const [period, setPeriod] = useState<Period>('all');
  const [breakdown, setBreakdown] = useState<PnLBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPnLData();
  }, [period]);

  const fetchPnLData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pnl/breakdown?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setBreakdown(data.data);
      } else {
        setError(data.error || 'Failed to fetch P&L data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ 
    title: string; 
    stats: PnLStats; 
    color: string;
    icon: React.ReactNode;
  }> = ({ title, stats, color, icon }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <span className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          £{stats.totalProfit.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Bets</p>
          <p className="text-white font-semibold text-xl">{stats.totalBets}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-white font-semibold text-xl">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">ROI</p>
          <p className={`font-semibold text-xl ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Avg Odds</p>
          <p className="text-white font-semibold text-xl">{stats.averageOdds.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-green-400">✓ {stats.wins} Wins</span>
          <span className="text-red-400">✗ {stats.losses} Losses</span>
          <span className="text-gray-400">⏳ {stats.pending} Pending</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-400">Error loading P&L data: {error}</p>
        <button 
          onClick={fetchPnLData}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!breakdown) return null;

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-purple-400" />
            P&L Performance Tracker
          </h2>
          <p className="text-gray-400 mt-1">Track all featured selections and performance</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly', 'yearly', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <StatCard 
        title="Overall Performance" 
        stats={breakdown.overall} 
        color="purple"
        icon={<Target className="w-5 h-5 text-purple-400" />}
      />

      {/* Breakdown by Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Golden Bets" 
          stats={breakdown.goldenBets} 
          color="yellow"
          icon={<span className="text-yellow-400">⭐</span>}
        />
        <StatCard 
          title="Bet Builders" 
          stats={breakdown.betBuilders} 
          color="blue"
          icon={<span className="text-blue-400">🧠</span>}
        />
        <StatCard 
          title="Value Bets" 
          stats={breakdown.valueBets} 
          color="green"
          icon={<span className="text-green-400">💎</span>}
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-400" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Best Performing Type</p>
            <p className="text-white font-semibold text-lg">
              {breakdown.goldenBets.roi > breakdown.betBuilders.roi && breakdown.goldenBets.roi > breakdown.valueBets.roi
                ? '⭐ Golden Bets'
                : breakdown.betBuilders.roi > breakdown.valueBets.roi
                ? '🧠 Bet Builders'
                : '💎 Value Bets'}
            </p>
            <p className="text-purple-400 text-sm mt-1">
              {Math.max(breakdown.goldenBets.roi, breakdown.betBuilders.roi, breakdown.valueBets.roi).toFixed(1)}% ROI
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Staked</p>
            <p className="text-white font-semibold text-lg">£{breakdown.overall.totalStaked.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">
              Across {breakdown.overall.totalBets} selections
            </p>
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-200 text-sm">
          <strong>Full Transparency:</strong> All featured selections are tracked and recorded. 
          Every bet is calculated with a £10 stake for consistent P&L tracking. 
          Historical data is never deleted.
        </p>
      </div>
    </div>
  );
};

export default PnLTracker;
