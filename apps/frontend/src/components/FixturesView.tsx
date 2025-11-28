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
          const leagues = new Set(response.data.map((f: Fixture) => f.league));
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

  const goToToday = () => {
    setSelectedDate(new Date());
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

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMatchStatus = (fixture: Fixture) => {
    if (fixture.status === 'FT') return 'FT';
    if (fixture.status === 'LIVE') return 'LIVE';
    if (fixture.status === 'HT') return 'HT';
    
    const kickoffTime = new Date(fixture.kickoff);
    const now = new Date();
    
    if (kickoffTime > now) return formatTime(fixture.kickoff);
    if (kickoffTime < now && !fixture.status) return 'LIVE';
    
    return formatTime(fixture.kickoff);
  };

  const isLive = (fixture: Fixture) => {
    return fixture.status === 'LIVE' || fixture.status === 'HT';
  };

  const isFinished = (fixture: Fixture) => {
    return fixture.status === 'FT';
  };

  const groupFixturesByLeague = (): GroupedFixtures => {
    return fixtures.reduce((acc, fixture) => {
      const league = fixture.league || 'Other';
      if (!acc[league]) acc[league] = [];
      acc[league].push(fixture);
      return acc;
    }, {} as GroupedFixtures);
  };

  const groupedFixtures = groupFixturesByLeague();
  const leagueCount = Object.keys(groupedFixtures).length;
  const totalFixtures = fixtures.length;

  const getTopMarket = (fixture: Fixture) => {
    const markets = [
      { name: 'BTTS', prob: fixture.predictions.btts_yes, odds: fixture.odds.btts_yes },
      { name: 'O2.5', prob: fixture.predictions.over_2_5, odds: fixture.odds.over_2_5 },
      { name: 'O9.5C', prob: fixture.predictions.over_9_5_corners, odds: fixture.odds.over_9_5_corners },
      { name: 'O3.5Y', prob: fixture.predictions.over_3_5_cards, odds: fixture.odds.over_3_5_cards },
    ];
    
    return markets.reduce((best, current) => 
      current.prob > best.prob ? current : best
    );
  };

  return (
    <div className={embedded ? "" : "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"}>
      <div className={`bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl ${embedded ? 'w-full' : 'w-full max-w-6xl'} max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20`}>
        
        {/* Header with Date Navigation */}
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border-b border-purple-500/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Fixtures</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-all ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
              </button>
              {!embedded && onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg font-semibold transition-all border border-purple-500/30"
              >
                Today
              </button>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>{formatDate(selectedDate)}</span>
                <span className="text-sm text-gray-400">
                  {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>{leagueCount} Leagues</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{totalFixtures} Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Live Updates</span>
            </div>
          </div>
        </div>

        {/* Fixtures List */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-gray-400">Loading fixtures...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Fixtures</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchFixtures}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
              >
                Retry
              </button>
            </div>
          ) : totalFixtures === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Fixtures</h3>
              <p className="text-gray-500">No matches scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
                <div key={league} className="bg-gradient-to-r from-purple-900/10 to-transparent border border-purple-500/20 rounded-lg overflow-hidden">
                  
                  {/* League Header */}
                  <button
                    onClick={() => toggleLeague(league)}
                    className="w-full p-3 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-lg">{league}</span>
                      <span className="text-sm text-gray-400">({leagueFixtures.length})</span>
                    </div>
                    {expandedLeagues.has(league) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* League Fixtures */}
                  {expandedLeagues.has(league) && (
                    <div className="border-t border-purple-500/10">
                      {leagueFixtures.map((fixture) => {
                        const status = getMatchStatus(fixture);
                        const live = isLive(fixture);
                        const finished = isFinished(fixture);
                        const topMarket = getTopMarket(fixture);
                        const hasGoldenBet = fixture.golden_bet && fixture.golden_bet.probability > 0;

                        return (
                          <div key={fixture.fixture_id} className="border-b border-purple-500/10 last:border-b-0">
                            <button
                              onClick={() => toggleFixture(fixture.fixture_id)}
                              className="w-full p-4 hover:bg-purple-500/5 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                
                                {/* Time/Status */}
                                <div className={`w-16 text-center text-sm font-semibold ${
                                  live ? 'text-green-400 animate-pulse' : 
                                  finished ? 'text-gray-400' : 
                                  'text-purple-400'
                                }`}>
                                  {status}
                                </div>

                                {/* Teams and Score */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold">{fixture.home_team}</span>
                                    {(finished || live) && fixture.home_score !== undefined && (
                                      <span className="text-xl font-bold">{fixture.home_score}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">{fixture.away_team}</span>
                                    {(finished || live) && fixture.away_score !== undefined && (
                                      <span className="text-xl font-bold">{fixture.away_score}</span>
                                    )}
                                  </div>
                                </div>

                                {/* AI Predictions */}
                                <div className="flex items-center gap-2">
                                  {hasGoldenBet && (
                                    <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">
                                      <Star className="w-4 h-4 fill-yellow-400" />
                                      <span className="text-xs font-semibold">Golden</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-semibold">{topMarket.name}</span>
                                    <span className="text-xs">{topMarket.prob}%</span>
                                  </div>
                                </div>

                                {/* Expand Icon */}
                                {expandedFixture === fixture.fixture_id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </button>

                            {/* Expanded Details */}
                            {expandedFixture === fixture.fixture_id && (
                              <div className="bg-black/20 p-4 border-t border-purple-500/10">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                    <div className="text-xs text-gray-400 mb-1">BTTS</div>
                                    <div className="text-lg font-bold text-purple-400">{fixture.predictions.btts_yes}%</div>
                                    <div className="text-xs text-gray-500">@ {fixture.odds.btts_yes}</div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                    <div className="text-xs text-gray-400 mb-1">Over 2.5</div>
                                    <div className="text-lg font-bold text-purple-400">{fixture.predictions.over_2_5}%</div>
                                    <div className="text-xs text-gray-500">@ {fixture.odds.over_2_5}</div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                    <div className="text-xs text-gray-400 mb-1">O9.5 Corners</div>
                                    <div className="text-lg font-bold text-purple-400">{fixture.predictions.over_9_5_corners}%</div>
                                    <div className="text-xs text-gray-500">@ {fixture.odds.over_9_5_corners}</div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                                    <div className="text-xs text-gray-400 mb-1">O3.5 Cards</div>
                                    <div className="text-lg font-bold text-purple-400">{fixture.predictions.over_3_5_cards}%</div>
                                    <div className="text-xs text-gray-500">@ {fixture.odds.over_3_5_cards}</div>
                                  </div>
                                </div>
                                
                                {hasGoldenBet && (
                                  <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                      <span className="font-semibold text-yellow-400">Golden Bet</span>
                                    </div>
                                    <div className="text-sm text-gray-300">{fixture.golden_bet.ai_explanation || 'AI-powered prediction with high confidence'}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixturesView;
