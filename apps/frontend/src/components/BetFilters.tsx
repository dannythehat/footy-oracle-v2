import React, { useState } from 'react';
import { Filter, X, Calendar, TrendingUp, Target, Award } from 'lucide-react';

export interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  league: string;
  market: string;
  result: 'all' | 'win' | 'loss' | 'pending';
  minMarkup: number;
  minOdds: number;
  maxOdds: number;
  minConfidence: number;
}

interface BetFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableLeagues?: string[];
  availableMarkets?: string[];
  showAdvanced?: boolean;
}

const BetFilters: React.FC<BetFiltersProps> = ({
  filters,
  onFilterChange,
  availableLeagues = [],
  availableMarkets = [],
  showAdvanced = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const defaultLeagues = availableLeagues.length > 0 ? availableLeagues : [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Champions League',
    'Europa League'
  ];

  const defaultMarkets = availableMarkets.length > 0 ? availableMarkets : [
    'btts',
    'over_2_5_goals',
    'over_9_5_corners',
    'over_3_5_cards'
  ];

  const getMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      'btts': 'BTTS Yes',
      'over_2_5_goals': 'Over 2.5 Goals',
      'over_9_5_corners': 'Over 9.5 Corners',
      'over_3_5_cards': 'Over 3.5 Cards'
    };
    return labels[market] || market;
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      league: 'all',
      market: 'all',
      result: 'all',
      minMarkup: 0,
      minOdds: 1.0,
      maxOdds: 10.0,
      minConfidence: 0
    };
    onFilterChange(resetFilters);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.league !== 'all') count++;
    if (filters.market !== 'all') count++;
    if (filters.result !== 'all') count++;
    if (filters.minMarkup > 0) count++;
    if (filters.minOdds > 1.0) count++;
    if (filters.maxOdds < 10.0) count++;
    if (filters.minConfidence > 0) count++;
    return count;
  };

  const activeCount = activeFilterCount();

  return (
    <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-semibold"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-semibold"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-2">
                <Calendar className="w-4 h-4" />
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                className="w-full bg-black/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-2">
                <Calendar className="w-4 h-4" />
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                className="w-full bg-black/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* League & Market */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-2">
                <Award className="w-4 h-4" />
                League
              </label>
              <select
                value={filters.league}
                onChange={(e) => onFilterChange({ ...filters, league: e.target.value })}
                className="w-full bg-black/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Leagues</option>
                {defaultLeagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-2">
                <Target className="w-4 h-4" />
                Market
              </label>
              <select
                value={filters.market}
                onChange={(e) => onFilterChange({ ...filters, market: e.target.value })}
                className="w-full bg-black/50 border border-purple-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Markets</option>
                {defaultMarkets.map(market => (
                  <option key={market} value={market}>{getMarketLabel(market)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs text-purple-300 font-semibold mb-2">
              <TrendingUp className="w-4 h-4" />
              Result
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['all', 'win', 'loss', 'pending'] as const).map((result) => (
                <button
                  key={result}
                  onClick={() => onFilterChange({ ...filters, result })}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filters.result === result
                      ? 'bg-purple-600 text-white border-2 border-purple-400'
                      : 'bg-black/50 text-gray-400 border border-purple-900 hover:border-purple-700'
                  }`}
                >
                  {result === 'all' ? 'All' : result.charAt(0).toUpperCase() + result.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          {showAdvanced && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-purple-400 hover:text-purple-300 font-semibold"
            >
              {showAdvancedFilters ? '− Hide' : '+ Show'} Advanced Filters
            </button>
          )}

          {/* Advanced Filters */}
          {showAdvanced && showAdvancedFilters && (
            <div className="space-y-4 pt-4 border-t border-purple-900">
              {/* Markup Value */}
              <div>
                <label className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-2">
                  <span>Min Markup Value</span>
                  <span className="text-yellow-400">{filters.minMarkup}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minMarkup}
                  onChange={(e) => onFilterChange({ ...filters, minMarkup: parseInt(e.target.value) })}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Odds Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-2">
                    <span>Min Odds</span>
                    <span className="text-purple-400">{filters.minOdds.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={filters.minOdds}
                    onChange={(e) => onFilterChange({ ...filters, minOdds: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-2">
                    <span>Max Odds</span>
                    <span className="text-purple-400">{filters.maxOdds.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="10.0"
                    step="0.5"
                    value={filters.maxOdds}
                    onChange={(e) => onFilterChange({ ...filters, maxOdds: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              {/* Confidence */}
              <div>
                <label className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-2">
                  <span>Min AI Confidence</span>
                  <span className="text-green-400">{filters.minConfidence}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minConfidence}
                  onChange={(e) => onFilterChange({ ...filters, minConfidence: parseInt(e.target.value) })}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetFilters;
