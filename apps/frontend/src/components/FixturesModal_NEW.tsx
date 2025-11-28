import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ChevronDown, ChevronUp, Star, TrendingUp, Calendar, History, BarChart3, Users, AlertCircle } from 'lucide-react';
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

interface FixtureStats {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  h2h: H2HData;
}

interface FixturesModalProps {
  onClose: () => void;
}

type TabType = 'markets' | 'h2h' | 'stats' | 'form';

const FixturesModal: React.FC<FixturesModalProps> = ({ onClose }) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('markets');
  const [fixtureStats, setFixtureStats] = useState<Record<string, FixtureStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      console.log('Fetching fixtures for date:', today);
      const response = await fixturesApi.getByDate(today);
      
      console.log('Fixtures API response:', response);
      
      if (response && response.data) {
        setFixtures(response.data);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setError(err.message || 'Failed to load fixtures. Please try again.');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMarketShortLabel = (market: string) => {
    const labels: Record<string, string> = {
      'btts_yes': 'BTTS',
      'over_2_5': 'O2.5',
      'over_9_5_corners': 'O9.5C',
      'over_3_5_cards': 'O3.5Y'
    };
    return labels[market] || market;
  };

  const calculateMarkupValue = (probability: number, odds: number) => {
    const impliedProbability = 1 / odds;
    return ((probability - impliedProbability) / impliedProbability) * 100;
  };

  const toggleFixture = async (fixtureId: string) => {
    if (expandedFixture === fixtureId) {
      setExpandedFixture(null);
      setActiveTab('markets');
    } else {
      setExpandedFixture(fixtureId);
      setActiveTab('markets');
      
      // Load stats if not already loaded
      if (!fixtureStats[fixtureId]) {
        await loadFixtureStats(fixtureId);
      }
    }
  };

  const loadFixtureStats = async (fixtureId: string) => {
    const fixture = fixtures.find(f => f.fixture_id === fixtureId);
    if (!fixture || !fixture.home_team_id || !fixture.away_team_id) return;

    setLoadingStats(prev => ({ ...prev, [fixtureId]: true }));

    try {
      // Mock H2H and stats data (replace with actual API calls when available)
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
              homeTeam: fixture.home_team,
              awayTeam: fixture.away_team,
              homeScore: 2,
              awayScore: 1,
              league: fixture.league
            },
            {
              date: '2023-11-20',
              homeTeam: fixture.away_team,
              awayTeam: fixture.home_team,
              homeScore: 1,
              awayScore: 1,
              league: fixture.league
            },
            {
              date: '2023-08-10',
              homeTeam: fixture.home_team,
              awayTeam: fixture.away_team,
              homeScore: 3,
              awayScore: 2,
              league: fixture.league
            }
          ]
        }
      };

      setFixtureStats(prev => ({ ...prev, [fixtureId]: mockStats }));
    } catch (error) {
      console.error('Error loading fixture stats:', error);
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
      <span className={`inline-block w-6 h-6 text-xs font-bold rounded border ${colors[result as keyof typeof colors]} flex items-center justify-center`}>
        {result}
      </span>
    );
  };

  const leagues = ['all', ...Array.from(new Set(fixtures.map(f => f.league)))];

  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = searchQuery === '' || 
      fixture.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.away_team.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLeague = selectedLeague === 'all' || fixture.league === selectedLeague;
    
    return matchesSearch && matchesLeague;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border-b border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Today's Fixtures</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filter */}
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
                className="pl-10 pr-8 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer"
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

        {/* Fixtures List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-gray-400">Loading fixtures from API...</div>
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
          ) : filteredFixtures.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {fixtures.length === 0 ? 'No fixtures available for today' : 'No fixtures found matching your search'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFixtures.map((fixture) => (
                <div
                  key={fixture.fixture_id}
                  className="bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/40 transition-all"
                >
                  {/* Fixture content - keeping existing UI structure */}
                  <button
                    onClick={() => toggleFixture(fixture.fixture_id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-sm text-gray-400 w-16">
                        {formatTime(fixture.kickoff)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                            {fixture.league}
                          </span>
                          {fixture.golden_bet && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        <div className="font-semibold text-left">
                          {fixture.home_team} vs {fixture.away_team}
                        </div>
                      </div>
                    </div>
                    {expandedFixture === fixture.fixture_id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Expanded content would go here - keeping existing structure */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixturesModal;
