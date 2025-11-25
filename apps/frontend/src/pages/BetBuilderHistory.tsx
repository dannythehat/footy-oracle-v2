import React, { useState, useEffect } from 'react';
import { BetBuilderCard } from '../components/BetBuilderCard';
import { betBuilderApi } from '../services/api';

interface BetBuilderStats {
  total: number;
  wins: number;
  losses: number;
  pending: number;
  settled: number;
  winRate: number;
  totalProfit: number;
  avgConfidence: number;
  avgOdds: number;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  result: 'all' | 'win' | 'loss' | 'pending';
  minConfidence: number;
  sortBy: 'date' | 'confidence' | 'odds' | 'profit';
  sortOrder: 'asc' | 'desc';
}

export const BetBuilderHistory: React.FC = () => {
  const [betBuilders, setBetBuilders] = useState<any[]>([]);
  const [stats, setStats] = useState<BetBuilderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    result: 'all',
    minConfidence: 0,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bet builders
      const response = await betBuilderApi.getHistorical({
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        limit: 10,
      });

      let builders = response.data.data || [];

      // Apply client-side filters
      if (filters.result !== 'all') {
        builders = builders.filter((b: any) => b.result === filters.result);
      }
      if (filters.minConfidence > 0) {
        builders = builders.filter((b: any) => b.combinedConfidence >= filters.minConfidence);
      }

      // Apply sorting
      builders.sort((a: any, b: any) => {
        let aVal, bVal;
        switch (filters.sortBy) {
          case 'date':
            aVal = new Date(a.date).getTime();
            bVal = new Date(b.date).getTime();
            break;
          case 'confidence':
            aVal = a.combinedConfidence;
            bVal = b.combinedConfidence;
            break;
          case 'odds':
            aVal = a.estimatedCombinedOdds;
            bVal = b.estimatedCombinedOdds;
            break;
          case 'profit':
            aVal = a.profit || 0;
            bVal = b.profit || 0;
            break;
          default:
            aVal = 0;
            bVal = 0;
        }
        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });

      setBetBuilders(builders);
      setTotalPages(response.data.pagination?.pages || 1);

      // Fetch stats
      const statsResponse = await betBuilderApi.getStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Error fetching bet builder history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Home Team', 'Away Team', 'League', 'Markets', 'Combined Confidence', 'Combined Odds', 'Result', 'Profit'].join(','),
      ...betBuilders.map(bb => [
        new Date(bb.date).toLocaleDateString(),
        bb.homeTeam,
        bb.awayTeam,
        bb.league,
        bb.markets.length,
        bb.combinedConfidence,
        bb.estimatedCombinedOdds,
        bb.result || 'pending',
        bb.profit || 0,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bet-builders-${filters.startDate}-to-${filters.endDate}.csv`;
    a.click();
  };

  const resetFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      result: 'all',
      minConfidence: 0,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🧠</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bet Builder History
              </h1>
              <p className="text-gray-400 text-sm">Multi-market convergence results & analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔍</span>
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-xl border border-purple-500/30">
              <div className="text-gray-400 text-sm mb-1">Total Bet Builders</div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-xl border border-green-500/30">
              <div className="text-gray-400 text-sm mb-1">Win Rate</div>
              <div className="text-3xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">{stats.wins}W / {stats.losses}L</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 p-4 rounded-xl border border-yellow-500/30">
              <div className="text-gray-400 text-sm mb-1">Total Profit</div>
              <div className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                €{stats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 p-4 rounded-xl border border-pink-500/30">
              <div className="text-gray-400 text-sm mb-1">Avg Confidence</div>
              <div className="text-3xl font-bold text-pink-400">{stats.avgConfidence}%</div>
              <div className="text-xs text-gray-400 mt-1">Avg Odds: {stats.avgOdds.toFixed(2)}x</div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Result</label>
                <select
                  value={filters.result}
                  onChange={(e) => setFilters({ ...filters, result: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Results</option>
                  <option value="win">Wins Only</option>
                  <option value="loss">Losses Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Min Confidence (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minConfidence}
                  onChange={(e) => setFilters({ ...filters, minConfidence: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="date">Date</option>
                  <option value="confidence">Confidence</option>
                  <option value="odds">Odds</option>
                  <option value="profit">Profit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sort Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bet Builder Cards */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading bet builders...</p>
          </div>
        ) : betBuilders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-xl text-gray-400">No bet builders found for selected filters</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {betBuilders.map((betBuilder) => (
                <BetBuilderCard key={betBuilder._id} betBuilder={betBuilder} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BetBuilderHistory;
