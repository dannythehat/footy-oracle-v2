import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Search, TrendingUp, TrendingDown } from 'lucide-react';

interface FeaturedSelection {
  _id: string;
  selectionType: 'golden-bet' | 'bet-builder' | 'value-bet';
  fixtureId: number;
  date: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  prediction: string;
  odds: number;
  confidence: number;
  value?: number;
  result: 'win' | 'loss' | 'pending' | 'void';
  stake: number;
  profit: number;
  aiReasoning?: string;
}

const PnLHistory: React.FC = () => {
  const [selections, setSelections] = useState<FeaturedSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    selectionType: '',
    result: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [filters, page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.selectionType && { selectionType: filters.selectionType }),
        ...(filters.result && { result: filters.result }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/pnl/history?${params}`);
      const data = await response.json();

      if (data.success) {
        setSelections(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'golden-bet': return '⭐';
      case 'bet-builder': return '🧠';
      case 'value-bet': return '💎';
      default: return '📊';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'golden-bet': return 'Golden Bet';
      case 'bet-builder': return 'Bet Builder';
      case 'value-bet': return 'Value Bet';
      default: return type;
    }
  };

  const getResultBadge = (result: string) => {
    const styles = {
      win: 'bg-green-900/30 text-green-400 border-green-500/50',
      loss: 'bg-red-900/30 text-red-400 border-red-500/50',
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
      void: 'bg-gray-900/30 text-gray-400 border-gray-500/50',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[result as keyof typeof styles]}`}>
        {result.toUpperCase()}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Match', 'League', 'Market', 'Prediction', 'Odds', 'Confidence', 'Result', 'Profit'];
    const rows = selections.map(s => [
      new Date(s.date).toLocaleDateString(),
      getTypeName(s.selectionType),
      `${s.homeTeam} vs ${s.awayTeam}`,
      s.league,
      s.market,
      s.prediction,
      s.odds,
      `${s.confidence}%`,
      s.result,
      `£${s.profit.toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pnl-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-purple-400" />
            Historical Selections
          </h2>
          <p className="text-gray-400 mt-1">Complete record of all featured bets</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.selectionType}
            onChange={(e) => setFilters({ ...filters, selectionType: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Types</option>
            <option value="golden-bet">⭐ Golden Bets</option>
            <option value="bet-builder">🧠 Bet Builders</option>
            <option value="value-bet">💎 Value Bets</option>
          </select>

          <select
            value={filters.result}
            onChange={(e) => setFilters({ ...filters, result: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Results</option>
            <option value="win">✓ Wins</option>
            <option value="loss">✗ Losses</option>
            <option value="pending">⏳ Pending</option>
            <option value="void">⊘ Void</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Selections Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : selections.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400">No selections found matching your filters</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Match</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Market</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Odds</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {selections.map((selection) => (
                  <tr key={selection._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(selection.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getTypeIcon(selection.selectionType)}</span>
                        <span className="text-white">{getTypeName(selection.selectionType)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="text-white font-medium">{selection.homeTeam} vs {selection.awayTeam}</p>
                        <p className="text-gray-400 text-xs">{selection.league}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="text-white">{selection.market}</p>
                        <p className="text-purple-400 text-xs">{selection.prediction}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">
                      {selection.odds.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-purple-400 font-semibold">{selection.confidence}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getResultBadge(selection.result)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold ${selection.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selection.profit >= 0 ? '+' : ''}£{selection.profit.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-700">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PnLHistory;
