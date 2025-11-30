import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  TrendingUp, 
  Calendar,
  Radio,
  BarChart3,
  Users,
  History,
  ArrowLeft,
  Trophy,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { fixturesApi } from '../services/api';

// CLEAN FLAT STRUCTURE - matches backend EXACTLY
interface Fixture {
  id: number;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  leagueId: number;
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: number;
  awayTeamId: number;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  predictions?: {
    btts_yes: number;
    over_2_5: number;
    over_9_5_corners: number;
    over_3_5_cards: number;
  };
  odds?: {
    btts_yes: number;
    over_2_5: number;
    over_9_5_corners: number;
    over_3_5_cards: number;
  };
  golden_bet?: {
    market: string;
    selection: string;
    probability: number;
    markup_value: number;
    ai_explanation: string;
  };
}

interface TeamStats {
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  failedToScore: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bttsPercentage: number;
  over25Percentage: number;
}

interface H2HData {
  played: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  lastMeetings: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    league: string;
  }>;
}

interface FixtureStats {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  h2h: H2HData;
}

type TabType = 'today' | 'tomorrow' | 'results';
type StatsTabType = 'markets' | 'h2h' | 'stats' | 'form';

export default function FixturesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTabType>('markets');
  const [fixtureStats, setFixtureStats] = useState<Record<number, FixtureStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchFixtures();
  }, [activeTab]);

  const fetchFixtures = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      let targetDate: Date;

      if (activeTab === 'today') {
        targetDate = today;
      } else if (activeTab === 'tomorrow') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
      } else {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
      }

      const dateStr = targetDate.toISOString().split('T')[0];
      const response = await fixturesApi.getByDate(dateStr);

      if (response && response.data) {
        setFixtures(response.data);
        setRetryCount(0);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load fixtures';
      setError(errorMessage);
      setFixtures([]);
      
      // Auto-retry logic (max 3 attempts)
      if (!isRetry && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchFixtures(true);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchFixtures();
  };

  const isLive = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('live') || s.includes('1h') || s.includes('2h');
  };

  const isFinished = (status: string) => {
    return status.toLowerCase().includes('ft');
  };

  const toggleFixture = async (fixtureId: number) => {
    if (expandedFixture === fixtureId) {
      setExpandedFixture(null);
      setActiveStatsTab('markets');
    } else {
      setExpandedFixture(fixtureId);
      setActiveStatsTab('markets');
      
      if (!fixtureStats[fixtureId]) {
        await loadFixtureStats(fixtureId);
      }
    }
  };

  const loadFixtureStats = async (fixtureId: number) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture) return;

    setLoadingStats(prev => ({ ...prev, [fixtureId]: true }));

    try {
      const mockStats: FixtureStats = {
        homeTeam: {
          form: 'WWDWL',
          goalsFor: 28,
          goalsAgainst: 12,
          cleanSheets: 6,
          failedToScore: 2,
          avgGoalsScored: 2.3,
          avgGoalsConceded: 1.0,
          bttsPercentage: 58,
          over25Percentage: 67
        },
        awayTeam: {
          form: 'WLWDW',
          goalsFor: 24,
          goalsAgainst: 15,
          cleanSheets: 4,
          failedToScore: 3,
          avgGoalsScored: 2.0,
          avgGoalsConceded: 1.3,
          bttsPercentage: 62,
          over25Percentage: 58
        },
        h2h: {
          played: 10,
          homeWins: 4,
          awayWins: 3,
          draws: 3,
          lastMeetings: [
            {
              date: '2024-03-15',
              homeTeam: fixture.homeTeamName,
              awayTeam: fixture.awayTeamName,
              homeScore: 2,
              awayScore: 1,
              league: fixture.leagueName
            },
            {
              date: '2023-11-20',
              homeTeam: fixture.awayTeamName,
              awayTeam: fixture.homeTeamName,
              homeScore: 1,
              awayScore: 1,
              league: fixture.leagueName
            }
          ]
        }
      };

      setFixtureStats(prev => ({ ...prev, [fixtureId]: mockStats }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [fixtureId]: false }));
    }
  };

  const renderFormBadge = (result: string) => {
    const colors = {
      W: 'bg-green-500/20 text-green-400 border-green-500/30',
      D: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      L: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`inline-block w-7 h-7 text-xs font-bold rounded border ${colors[result as keyof typeof colors]} flex items-center justify-center`}>
        {result}
      </span>
    );
  };

  const calculateMarkupValue = (probability: number, odds: number) => {
    const impliedProbability = 1 / odds;
    return ((probability - impliedProbability) / impliedProbability) * 100;
  };

  const groupedFixtures = useMemo(() => {
    const filtered = fixtures.filter(fixture => {
      const matchesSearch = searchQuery === '' || 
        fixture.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLeague = selectedLeague === 'all' || fixture.leagueName === selectedLeague;
      
      return matchesSearch && matchesLeague;
    });

    const grouped: Record<string, Fixture[]> = {};
    filtered.forEach(fixture => {
      if (!grouped[fixture.leagueName]) {
        grouped[fixture.leagueName] = [];
      }
      grouped[fixture.leagueName].push(fixture);
    });

    // Sort fixtures by time within each league
    Object.keys(grouped).forEach(league => {
      grouped[league].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  }, [fixtures, searchQuery, selectedLeague]);

  const leagues = ['all', ...Array.from(new Set(fixtures.map(f => f.leagueName)))];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-black border-b border-purple-500/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold">Fixtures & Results</h1>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {error ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('tomorrow')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'tomorrow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'results'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Results
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="pl-10 pr-8 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer min-w-[200px]"
              >
                {leagues.map(league => (
                  <option key={league} value={league} className="bg-gray-900">
                    {league === 'all' ? 'All Leagues' : league}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse"></div>
            </div>
            <div className="text-gray-400 mb-2">Loading fixtures...</div>
            {retryCount > 0 && (
              <div className="text-sm text-purple-400">Retry attempt {retryCount}/3</div>
            )}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Fixtures</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
              <div className="mt-6 p-4 rounded-lg bg-black/50 border border-purple-500/20 text-left">
                <p className="text-sm text-gray-400 mb-2">Troubleshooting tips:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Backend may be starting up (Render free tier)</li>
                  <li>• Try refreshing in a few moments</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && Object.keys(groupedFixtures).length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Fixtures Found</h3>
            <p className="text-gray-500">No matches scheduled for this date</p>
          </div>
        )}

        {/* Fixtures List */}
        {!loading && !error && Object.keys(groupedFixtures).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-gradient-to-br from-purple-950/20 to-black border border-purple-500/20 rounded-2xl overflow-hidden">
                {/* League Header */}
                <div className="bg-purple-900/30 border-b border-purple-500/20 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-purple-300">{league}</h2>
                    <span className="text-sm text-purple-400">{leagueFixtures.length} matches</span>
                  </div>
                </div>

                {/* Fixtures */}
                <div className="divide-y divide-purple-500/10">
                  {leagueFixtures.map((fixture) => (
                    <div key={fixture.id} className="transition-all">
                      {/* Fixture Row */}
                      <button
                        onClick={() => toggleFixture(fixture.id)}
                        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-purple-500/5 transition-all ${
                          fixture.golden_bet ? 'bg-yellow-500/5 border-l-4 border-yellow-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-6 flex-1">
                          {/* Time */}
                          <div className="text-sm text-gray-400 w-16 text-left">
                            {fixture.time}
                          </div>

                          {/* Live Indicator */}
                          {isLive(fixture.status) && (
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                              <span className="text-xs font-bold text-red-400">LIVE</span>
                            </div>
                          )}

                          {/* Teams */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{fixture.homeTeamName}</span>
                              {fixture.homeScore !== null && fixture.homeScore !== undefined && (
                                <span className="text-purple-400 font-bold">{fixture.homeScore}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{fixture.awayTeamName}</span>
                              {fixture.awayScore !== null && fixture.awayScore !== undefined && (
                                <span className="text-purple-400 font-bold">{fixture.awayScore}</span>
                              )}
                            </div>
                          </div>

                          {/* Golden Bet Badge */}
                          {fixture.golden_bet && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs font-bold text-yellow-400">GOLDEN BET</span>
                            </div>
                          )}

                          {/* Expand Icon */}
                          {expandedFixture === fixture.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content - Stats Tabs */}
                      {expandedFixture === fixture.id && (
                        <div className="bg-black/20 border-t border-purple-500/10 p-6">
                          <div className="text-center text-gray-400 py-8">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Detailed stats coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
