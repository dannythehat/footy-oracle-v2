import React, { useState, useEffect } from 'react';
import BetBuilderCard from '../components/BetBuilderCard';
import { betBuilderApi } from '../services/api';

interface BetBuilderStats {
  total: number;
  wins: number;
  losses: number;
  pending: number;
  settled: number;
  winRate: number;
  avgOdds: number;
  totalProfit: number;
}

interface MarketPrediction {
  market: string;
  marketName: string;
  confidence: number;
  probability: number;
  estimatedOdds: number;
}

interface BetBuilder {
  _id: string;
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  markets: MarketPrediction[];
  combinedOdds: number;
  combinedConfidence: number;
  convergenceScore: number;
  status?: 'pending' | 'won' | 'lost';
  result?: {
    settled: boolean;
    won: boolean;
    profit: number;
  };
}

const BetBuilderHistory: React.FC = () => {
  const [betBuilders, setBetBuilders] = useState<BetBuilder[]>([]);
  const [stats, setStats] = useState<BetBuilderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'odds' | 'confidence'>('date');

  useEffect(() => {
    fetchBetBuilders();
    fetchStats();
  }, [filter, sortBy]);

  const fetchBetBuilders = async () => {
    try {
      setLoading(true);
      const data = await betBuilderApi.getHistory(filter, sortBy);
      setBetBuilders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bet builder history');
      console.error('Error fetching bet builders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await betBuilderApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'won': return 'text-green-400';
      case 'lost': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'won': return '✅ Won';
      case 'lost': return '❌ Lost';
      default: return '⏳ Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Bet Builder History
          </h1>
          <p className="text-purple-300">
            Track your multi-market convergence predictions
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/30">
              <div className="text-purple-300 text-sm mb-1">Total Bets</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-6 border border-green-500/30">
              <div className="text-green-300 text-sm mb-1">Win Rate</div>
              <div className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-500/30">
              <div className="text-blue-300 text-sm mb-1">Avg Odds</div>
              <div className="text-3xl font-bold text-white">{stats.avgOdds.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-6 border border-yellow-500/30">
              <div className="text-yellow-300 text-sm mb-1">Total Profit</div>
              <div className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}u
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/30 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="text-purple-300 text-sm mb-2 block">Filter by Status</label>
              <div className="flex gap-2">
                {(['all', 'pending', 'won', 'lost'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="text-purple-300 text-sm mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 text-white border border-purple-500/30 focus:outline-none focus:border-purple-500"
              >
                <option value="date">Date (Newest First)</option>
                <option value="odds">Odds (Highest First)</option>
                <option value="confidence">Confidence (Highest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bet Builders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-purple-300 mt-4">Loading bet builders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchBetBuilders}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : betBuilders.length === 0 ? (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Bet Builders Found</h3>
            <p className="text-purple-300">
              {filter === 'all' 
                ? 'No bet builders have been generated yet. Check back tomorrow!'
                : `No ${filter} bet builders found. Try a different filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {betBuilders.map((betBuilder) => (
              <div key={betBuilder._id} className="relative">
                {/* Status Badge */}
                {betBuilder.status && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(betBuilder.status)} bg-black/50 backdrop-blur-sm`}>
                      {getStatusBadge(betBuilder.status)}
                    </span>
                  </div>
                )}
                
                {/* Bet Builder Card */}
                <BetBuilderCard betBuilder={betBuilder} />

                {/* Result Details */}
                {betBuilder.result?.settled && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    betBuilder.result.won 
                      ? 'bg-green-900/20 border-green-500/30' 
                      : 'bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${betBuilder.result.won ? 'text-green-400' : 'text-red-400'}`}>
                        {betBuilder.result.won ? '✅ Bet Won!' : '❌ Bet Lost'}
                      </span>
                      <span className={`text-lg font-bold ${betBuilder.result.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {betBuilder.result.profit >= 0 ? '+' : ''}{betBuilder.result.profit.toFixed(2)}u
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && betBuilders.length > 0 && betBuilders.length % 10 === 0 && (
          <div className="text-center mt-8">
            <button
              onClick={fetchBetBuilders}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetBuilderHistory;
