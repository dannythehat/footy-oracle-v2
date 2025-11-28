import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, 
  Star, BarChart3, History, Users, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Trophy
} from 'lucide-react';
import { fixturesApi } from '../services/api';

interface Fixture {
  fixture_id: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
  home_team_id?: number;
  away_team_id?: number;
  league_id?: number;
  season?: number;
  country?: string;
  status?: string;
  home_score?: number;
  away_score?: number;
  predictions: {
    btts_yes: number;
    over_2_5: number;
    over_9_5_corners: number;
    over_3_5_cards: number;
  };
  odds: {
    btts_yes: number;
    over_2_5: number;
    over_9_5_corners: number;
    over_3_5_cards: number;
  };
  golden_bet: {
    market: string;
    selection: string;
    probability: number;
    markup_value: number;
    ai_explanation: string;
  };
}

interface GroupedFixtures {
  [league: string]: Fixture[];
}

interface FixturesViewProps {
  onClose?: () => void;
  embedded?: boolean;
}

const FixturesView: React.FC<FixturesViewProps> = ({ onClose, embedded = false }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchFixtures();
    
    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchFixtures, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching fixtures for:', dateStr);
      
      const response = await fixturesApi.getByDate(dateStr);
      
      if (response && response.data) {
        setFixtures(response.data);
        // Auto-expand all leagues on first load
        if (expandedLeagues.size === 0) {
          const leagues = new Set<string>(
            response.data
              .map((f: Fixture) => f.league)
              .filter((league): league is string => Boolean(league))
          );
          setExpandedLeagues(leagues);
        }
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setError(err.message || 'Failed to load fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleLeague = (league: string) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLeagues(newExpanded);
  };

  const toggleFixture = (fixtureId: string) => {
    setExpandedFixture(expandedFixture === fixtureId ? null : fixtureId);
  };

  // Group fixtures by league
  const groupedFixtures: GroupedFixtures = fixtures.reduce((acc, fixture) => {
    const league = fixture.league || 'Unknown League';
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      'NS': { label: 'Not Started', className: 'bg-gray-500' },
      'LIVE': { label: 'LIVE', className: 'bg-red-500 animate-pulse' },
      '1H': { label: '1st Half', className: 'bg-green-500' },
      'HT': { label: 'Half Time', className: 'bg-yellow-500' },
      '2H': { label: '2nd Half', className: 'bg-green-500' },
      'FT': { label: 'Full Time', className: 'bg-blue-500' },
      'AET': { label: 'Extra Time', className: 'bg-purple-500' },
      'PEN': { label: 'Penalties', className: 'bg-purple-500' },
      'PST': { label: 'Postponed', className: 'bg-gray-500' },
      'CANC': { label: 'Cancelled', className: 'bg-red-500' },
      'ABD': { label: 'Abandoned', className: 'bg-red-500' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getScoreDisplay = (fixture: Fixture) => {
    if (fixture.status && ['LIVE', '1H', 'HT', '2H', 'FT', 'AET', 'PEN'].includes(fixture.status)) {
      return (
        <div className="text-lg font-bold">
          {fixture.home_score ?? 0} - {fixture.away_score ?? 0}
        </div>
      );
    }
    return null;
  };

  const getMarketIcon = (market: string) => {
    switch (market.toLowerCase()) {
      case 'btts': return <Users className="w-4 h-4" />;
      case 'goals': return <TrendingUp className="w-4 h-4" />;
      case 'corners': return <BarChart3 className="w-4 h-4" />;
      case 'cards': return <AlertCircle className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-400';
    if (probability >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getValueColor = (value: number) => {
    if (value >= 15) return 'text-green-400';
    if (value >= 10) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Match Fixtures</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Date Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-xl font-semibold text-white">
                {formatDate(selectedDate)}
              </span>
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={fetchFixtures}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-refresh
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Fixtures List */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No fixtures found for this date</p>
          </div>
        )}

        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                {/* League Header */}
                <button
                  onClick={() => toggleLeague(league)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-semibold text-white">{league}</span>
                    <span className="text-sm text-gray-400">({leagueFixtures.length} matches)</span>
                  </div>
                  {expandedLeagues.has(league) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* League Fixtures */}
                {expandedLeagues.has(league) && (
                  <div className="border-t border-gray-700">
                    {leagueFixtures.map((fixture) => (
                      <div key={fixture.fixture_id} className="border-b border-gray-700 last:border-b-0">
                        {/* Fixture Header */}
                        <button
                          onClick={() => toggleFixture(fixture.fixture_id)}
                          className="w-full px-6 py-4 hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400 w-16">
                                {formatTime(fixture.kickoff)}
                              </span>
                              
                              <div className="flex-1 text-left">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-medium">{fixture.home_team}</span>
                                  {getScoreDisplay(fixture)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-medium">{fixture.away_team}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {getStatusBadge(fixture.status)}
                                {fixture.golden_bet && (
                                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                )}
                              </div>
                            </div>
                            
                            {expandedFixture === fixture.fixture_id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 ml-4" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
                            )}
                          </div>
                        </button>

                        {/* Fixture Details */}
                        {expandedFixture === fixture.fixture_id && (
                          <div className="px-6 py-4 bg-gray-900/50 space-y-4">
                            {/* Golden Bet */}
                            {fixture.golden_bet && (
                              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                  <h3 className="text-lg font-bold text-yellow-400">Golden Bet</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-sm text-gray-400 mb-1">Market</p>
                                    <div className="flex items-center gap-2">
                                      {getMarketIcon(fixture.golden_bet.market)}
                                      <p className="text-white font-semibold">{fixture.golden_bet.selection}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-400 mb-1">Confidence</p>
                                    <p className={`text-lg font-bold ${getConfidenceColor(fixture.golden_bet.probability)}`}>
                                      {(fixture.golden_bet.probability * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-400 mb-1">Value</p>
                                    <p className={`text-lg font-bold ${getValueColor(fixture.golden_bet.markup_value)}`}>
                                      {fixture.golden_bet.markup_value.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-gray-900/50 rounded p-3">
                                  <p className="text-sm text-gray-300">{fixture.golden_bet.ai_explanation}</p>
                                </div>
                              </div>
                            )}

                            {/* Predictions */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-400 mb-3">AI Predictions</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-purple-400" />
                                    <p className="text-sm text-gray-400">BTTS</p>
                                  </div>
                                  <p className="text-lg font-bold text-white">
                                    {(fixture.predictions.btts_yes * 100).toFixed(1)}%
                                  </p>
                                  {fixture.odds.btts_yes && (
                                    <p className="text-xs text-gray-500 mt-1">Odds: {fixture.odds.btts_yes.toFixed(2)}</p>
                                  )}
                                </div>

                                <div className="bg-gray-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <p className="text-sm text-gray-400">Over 2.5</p>
                                  </div>
                                  <p className="text-lg font-bold text-white">
                                    {(fixture.predictions.over_2_5 * 100).toFixed(1)}%
                                  </p>
                                  {fixture.odds.over_2_5 && (
                                    <p className="text-xs text-gray-500 mt-1">Odds: {fixture.odds.over_2_5.toFixed(2)}</p>
                                  )}
                                </div>

                                <div className="bg-gray-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-blue-400" />
                                    <p className="text-sm text-gray-400">Over 9.5 Corners</p>
                                  </div>
                                  <p className="text-lg font-bold text-white">
                                    {(fixture.predictions.over_9_5_corners * 100).toFixed(1)}%
                                  </p>
                                  {fixture.odds.over_9_5_corners && (
                                    <p className="text-xs text-gray-500 mt-1">Odds: {fixture.odds.over_9_5_corners.toFixed(2)}</p>
                                  )}
                                </div>

                                <div className="bg-gray-800 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                                    <p className="text-sm text-gray-400">Over 3.5 Cards</p>
                                  </div>
                                  <p className="text-lg font-bold text-white">
                                    {(fixture.predictions.over_3_5_cards * 100).toFixed(1)}%
                                  </p>
                                  {fixture.odds.over_3_5_cards && (
                                    <p className="text-xs text-gray-500 mt-1">Odds: {fixture.odds.over_3_5_cards.toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FixturesView;
