import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, TrendingUp, TrendingDown, Search, X } from 'lucide-react';

interface HistoricalBet {
  bet_id: string;
  date: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  league: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  markup_value: number;
  result: 'win' | 'loss';
  profit_loss: number;
}

interface HistoricalFilters {
  dateFrom: string;
  dateTo: string;
  league: string;
  market: string;
  result: 'all' | 'win' | 'loss';
  minMarkup: number;
}

const HistoricalResults: React.FC = () => {
  const [bets, setBets] = useState<HistoricalBet[]>([]);
  const [filteredBets, setFilteredBets] = useState<HistoricalBet[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<HistoricalFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    league: 'all',
    market: 'all',
    result: 'all',
    minMarkup: 0
  });

  // Mock historical data
  useEffect(() => {
    const mockBets: HistoricalBet[] = [
      {
        bet_id: '1',
        date: '2025-11-22',
        fixture_id: 'f1',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        league: 'Premier League',
        market: 'over_2_5_goals',
        selection: 'Over 2.5',
        odds: 1.85,
        ai_probability: 0.78,
        markup_value: 44.3,
        result: 'win',
        profit_loss: 8.50
      },
      {
        bet_id: '2',
        date: '2025-11-22',
        fixture_id: 'f2',
        home_team: 'Man United',
        away_team: 'Liverpool',
        league: 'Premier League',
        market: 'btts',
        selection: 'Yes',
        odds: 1.70,
        ai_probability: 0.75,
        markup_value: 27.5,
        result: 'loss',
        profit_loss: -10.00
      },
      {
        bet_id: '3',
        date: '2025-11-21',
        fixture_id: 'f3',
        home_team: 'Real Madrid',
        away_team: 'Barcelona',
        league: 'La Liga',
        market: 'over_9_5_corners',
        selection: 'Over 9.5',
        odds: 1.90,
        ai_probability: 0.82,
        markup_value: 55.8,
        result: 'win',
        profit_loss: 9.00
      },
      {
        bet_id: '4',
        date: '2025-11-21',
        fixture_id: 'f4',
        home_team: 'Bayern Munich',
        away_team: 'Dortmund',
        league: 'Bundesliga',
        market: 'over_3_5_cards',
        selection: 'Over 3.5',
        odds: 2.00,
        ai_probability: 0.68,
        markup_value: 36.0,
        result: 'win',
        profit_loss: 10.00
      },
      {
        bet_id: '5',
        date: '2025-11-20',
        fixture_id: 'f5',
        home_team: 'PSG',
        away_team: 'Marseille',
        league: 'Ligue 1',
        market: 'btts',
        selection: 'Yes',
        odds: 1.75,
        ai_probability: 0.80,
        markup_value: 40.0,
        result: 'win',
        profit_loss: 7.50
      }
    ];

    setBets(mockBets);
    setFilteredBets(mockBets);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...bets];

    // Date range
    filtered = filtered.filter(bet => {
      const betDate = new Date(bet.date);
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      return betDate >= fromDate && betDate <= toDate;
    });

    // League filter
    if (filters.league !== 'all') {
      filtered = filtered.filter(bet => bet.league === filters.league);
    }

    // Market filter
    if (filters.market !== 'all') {
      filtered = filtered.filter(bet => bet.market === filters.market);
    }

    // Result filter
    if (filters.result !== 'all') {
      filtered = filtered.filter(bet => bet.result === filters.result);
    }

    // Markup value filter
    filtered = filtered.filter(bet => bet.markup_value >= filters.minMarkup);

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(bet =>
        bet.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bet.away_team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBets(filtered);
  }, [filters, bets, searchQuery]);

  const getMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      'btts': 'BTTS Yes',
      'over_2_5_goals': 'Over 2.5 Goals',
      'over_9_5_corners': 'Over 9.5 Corners',
      'over_3_5_cards': 'Over 3.5 Cards'
    };
    return labels[market] || market;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    const wins = filteredBets.filter(b => b.result === 'win').length;
    const total = filteredBets.length;
    const totalProfit = filteredBets.reduce((sum, bet) => sum + bet.profit_loss, 0);
    const winRate = total > 0 ? (wins / total * 100).toFixed(1) : '0.0';
    const avgMarkup = total > 0 
      ? (filteredBets.reduce((sum, bet) => sum + bet.markup_value, 0) / total).toFixed(1)
      : '0.0';

    return { wins, total, totalProfit, winRate, avgMarkup };
  };

  const stats = calculateStats();

  const exportToCSV = () => {
    const headers = ['Date', 'Home Team', 'Away Team', 'League', 'Market', 'Odds', 'AI %', 'Markup %', 'Result', 'P/L'];
    const rows = filteredBets.map(bet => [
      bet.date,
      bet.home_team,
      bet.away_team,
      bet.league,
      getMarketLabel(bet.market),
      bet.odds.toFixed(2),
      (bet.ai_probability * 100).toFixed(0) + '%',
      bet.markup_value.toFixed(1) + '%',
      bet.result.toUpperCase(),
      '€' + bet.profit_loss.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `footy-oracle-history-${filters.dateFrom}-to-${filters.dateTo}.csv`;
    a.click();
  };

  const leagues = ['all', ...Array.from(new Set(bets.map(b => b.league)))];
  const markets = ['all', 'btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards'];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-purple-900/50 bg-gradient-to-r from-black via-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-purple-400" />
              <h1 className="text-2xl font-bold text-purple-300">Historical Results</h1>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        <section className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
              <div className="text-purple-300 text-xs font-semibold mb-1">Total Bets</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
              <div className="text-purple-300 text-xs font-semibold mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
            </div>
            <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
              <div className="text-purple-300 text-xs font-semibold mb-1">Total P/L</div>
              <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                €{stats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
              <div className="text-purple-300 text-xs font-semibold mb-1">Wins / Losses</div>
              <div className="text-2xl font-bold text-white">
                {stats.wins} / {stats.total - stats.wins}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
              <div className="text-purple-300 text-xs font-semibold mb-1">Avg Markup</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.avgMarkup}%</div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="mb-6">
          <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-purple-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-semibold mb-3"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full bg-black/50 border border-purple-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full bg-black/50 border border-purple-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* League Filter */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">League</label>
                  <select
                    value={filters.league}
                    onChange={(e) => setFilters({ ...filters, league: e.target.value })}
                    className="w-full bg-black/50 border border-purple-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {leagues.map(league => (
                      <option key={league} value={league}>
                        {league === 'all' ? 'All Leagues' : league}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Market Filter */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">Market</label>
                  <select
                    value={filters.market}
                    onChange={(e) => setFilters({ ...filters, market: e.target.value })}
                    className="w-full bg-black/50 border border-purple-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {markets.map(market => (
                      <option key={market} value={market}>
                        {market === 'all' ? 'All Markets' : getMarketLabel(market)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Result Filter */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">Result</label>
                  <select
                    value={filters.result}
                    onChange={(e) => setFilters({ ...filters, result: e.target.value as any })}
                    className="w-full bg-black/50 border border-purple-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Results</option>
                    <option value="win">Wins Only</option>
                    <option value="loss">Losses Only</option>
                  </select>
                </div>

                {/* Markup Filter */}
                <div>
                  <label className="text-xs text-purple-300 font-semibold mb-1 block">
                    Min Markup Value: {filters.minMarkup}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minMarkup}
                    onChange={(e) => setFilters({ ...filters, minMarkup: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results List */}
        <section>
          {filteredBets.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-purple-950/20 rounded-lg border border-purple-900/50">
              No results found for the selected filters
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBets.map((bet) => (
                <div
                  key={bet.bet_id}
                  className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-4 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Fixture Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-400">{formatDate(bet.date)}</span>
                        <span className="text-xs text-purple-300 font-semibold">{bet.league}</span>
                      </div>
                      <div className="text-base font-bold mb-1">
                        {bet.home_team} <span className="text-purple-400 text-sm">vs</span> {bet.away_team}
                      </div>
                      <div className="text-sm text-gray-300">{getMarketLabel(bet.market)}</div>
                    </div>

                    {/* Right: Stats & Result */}
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Odds</div>
                          <div className="text-lg font-bold text-purple-400">{bet.odds.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">AI</div>
                          <div className="text-lg font-bold text-green-400">{(bet.ai_probability * 100).toFixed(0)}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Value</div>
                          <div className="text-lg font-bold text-yellow-400">+{bet.markup_value.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded font-bold text-sm inline-flex items-center gap-1 ${
                        bet.result === 'win'
                          ? 'bg-green-500/20 text-green-400 border border-green-500'
                          : 'bg-red-500/20 text-red-400 border border-red-500'
                      }`}>
                        {bet.result === 'win' ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            WON €{bet.profit_loss.toFixed(2)}
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4" />
                            LOST €{Math.abs(bet.profit_loss).toFixed(2)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HistoricalResults;