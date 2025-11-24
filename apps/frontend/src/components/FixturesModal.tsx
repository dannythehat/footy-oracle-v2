import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ChevronDown, ChevronUp, Star, TrendingUp, Calendar, History, BarChart3, Users } from 'lucide-react';

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

  useEffect(() => {
    // Mock fixtures data with team IDs for API calls
    const mockFixtures: Fixture[] = [
      {
        fixture_id: 'f1',
        home_team: 'Man City',
        away_team: 'Liverpool',
        home_team_id: 50,
        away_team_id: 40,
        league_id: 39,
        season: 2024,
        kickoff: new Date(Date.now() + 3600000).toISOString(),
        league: 'Premier League',
        predictions: {
          btts_yes: 0.72,
          over_2_5: 0.78,
          over_9_5_corners: 0.68,
          over_3_5_cards: 0.45
        },
        odds: {
          btts_yes: 1.70,
          over_2_5: 1.85,
          over_9_5_corners: 1.95,
          over_3_5_cards: 2.10
        },
        golden_bet: {
          market: 'over_2_5',
          selection: 'Over 2.5',
          probability: 0.78,
          markup_value: 44.3,
          ai_explanation: 'Both teams averaging 3.2 goals per game in last 5 matches. Historical H2H shows 4/5 games going over 2.5.'
        }
      },
      {
        fixture_id: 'f2',
        home_team: 'Real Madrid',
        away_team: 'Barcelona',
        home_team_id: 541,
        away_team_id: 529,
        league_id: 140,
        season: 2024,
        kickoff: new Date(Date.now() + 5400000).toISOString(),
        league: 'La Liga',
        predictions: {
          btts_yes: 0.82,
          over_2_5: 0.71,
          over_9_5_corners: 0.65,
          over_3_5_cards: 0.58
        },
        odds: {
          btts_yes: 1.72,
          over_2_5: 1.88,
          over_9_5_corners: 1.92,
          over_3_5_cards: 2.05
        },
        golden_bet: {
          market: 'btts_yes',
          selection: 'BTTS Yes',
          probability: 0.82,
          markup_value: 41.0,
          ai_explanation: 'El Clasico intensity guarantees goals. Both teams have scored in 8/10 recent meetings.'
        }
      },
      {
        fixture_id: 'f3',
        home_team: 'Bayern Munich',
        away_team: 'Dortmund',
        home_team_id: 157,
        away_team_id: 165,
        league_id: 78,
        season: 2024,
        kickoff: new Date(Date.now() + 7200000).toISOString(),
        league: 'Bundesliga',
        predictions: {
          btts_yes: 0.68,
          over_2_5: 0.73,
          over_9_5_corners: 0.75,
          over_3_5_cards: 0.52
        },
        odds: {
          btts_yes: 1.75,
          over_2_5: 1.82,
          over_9_5_corners: 1.90,
          over_3_5_cards: 2.15
        },
        golden_bet: {
          market: 'over_9_5_corners',
          selection: 'Over 9.5 Corners',
          probability: 0.75,
          markup_value: 42.5,
          ai_explanation: 'Der Klassiker averages 12.3 corners. Both teams play high-pressing styles forcing corners.'
        }
      },
      {
        fixture_id: 'f4',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        home_team_id: 42,
        away_team_id: 49,
        league_id: 39,
        season: 2024,
        kickoff: new Date(Date.now() + 10800000).toISOString(),
        league: 'Premier League',
        predictions: {
          btts_yes: 0.65,
          over_2_5: 0.58,
          over_9_5_corners: 0.71,
          over_3_5_cards: 0.62
        },
        odds: {
          btts_yes: 1.75,
          over_2_5: 1.90,
          over_9_5_corners: 1.88,
          over_3_5_cards: 2.00
        },
        golden_bet: {
          market: 'over_9_5_corners',
          selection: 'Over 9.5 Corners',
          probability: 0.71,
          markup_value: 33.5,
          ai_explanation: 'London derby intensity. Both teams average 11+ corners in rivalry matches.'
        }
      },
      {
        fixture_id: 'f5',
        home_team: 'PSG',
        away_team: 'Marseille',
        home_team_id: 85,
        away_team_id: 81,
        league_id: 61,
        season: 2024,
        kickoff: new Date(Date.now() + 14400000).toISOString(),
        league: 'Ligue 1',
        predictions: {
          btts_yes: 0.70,
          over_2_5: 0.76,
          over_9_5_corners: 0.63,
          over_3_5_cards: 0.72
        },
        odds: {
          btts_yes: 1.68,
          over_2_5: 1.80,
          over_9_5_corners: 2.00,
          over_3_5_cards: 1.95
        },
        golden_bet: {
          market: 'over_2_5',
          selection: 'Over 2.5 Goals',
          probability: 0.76,
          markup_value: 36.8,
          ai_explanation: 'Le Classique always delivers goals. PSG\'s attack vs Marseille\'s leaky defense.'
        }
      },
      {
        fixture_id: 'f6',
        home_team: 'Juventus',
        away_team: 'Inter Milan',
        home_team_id: 496,
        away_team_id: 505,
        league_id: 135,
        season: 2024,
        kickoff: new Date(Date.now() + 18000000).toISOString(),
        league: 'Serie A',
        predictions: {
          btts_yes: 0.62,
          over_2_5: 0.55,
          over_9_5_corners: 0.58,
          over_3_5_cards: 0.68
        },
        odds: {
          btts_yes: 1.80,
          over_2_5: 1.95,
          over_9_5_corners: 2.05,
          over_3_5_cards: 1.92
        },
        golden_bet: {
          market: 'over_3_5_cards',
          selection: 'Over 3.5 Cards',
          probability: 0.68,
          markup_value: 30.6,
          ai_explanation: 'Derby d\'Italia is always physical. Referee averages 4.5 cards in big matches.'
        }
      }
    ];

    setFixtures(mockFixtures);
    setLoading(false);
  }, []);

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
      // Mock H2H and stats data (replace with actual API calls)
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
            },
            {
              date: '2023-04-05',
              homeTeam: fixture.away_team,
              awayTeam: fixture.home_team,
              homeScore: 0,
              awayScore: 2,
              league: fixture.league
            },
            {
              date: '2022-12-18',
              homeTeam: fixture.home_team,
              awayTeam: fixture.away_team,
              homeScore: 1,
              awayScore: 1,
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
            <div className="text-center py-12 text-gray-400">Loading fixtures...</div>
          ) : filteredFixtures.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No fixtures found</div>
          ) : (
            <div className="space-y-3">
              {filteredFixtures.map((fixture) => (
                <div
                  key={fixture.fixture_id}
                  className="bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/40 transition-all"
                >
                  {/* Fixture Header - Clickable */}
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
                    <div className="flex items-center gap-2">
                      {fixture.golden_bet && (
                        <div className="text-right mr-4">
                          <div className="text-sm text-purple-400 font-semibold">
                            {getMarketShortLabel(fixture.golden_bet.market)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(fixture.golden_bet.probability * 100).toFixed(0)}% • +{fixture.golden_bet.markup_value.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {expandedFixture === fixture.fixture_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details with Tabs */}
                  {expandedFixture === fixture.fixture_id && (
                    <div className="border-t border-purple-500/20 bg-black/20">
                      {/* Tabs */}
                      <div className="flex border-b border-purple-500/20">
                        <button
                          onClick={() => setActiveTab('markets')}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'markets'
                              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Markets
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('h2h')}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'h2h'
                              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            H2H
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('stats')}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'stats'
                              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Stats
                          </div>
                        </button>
                        <button
                          onClick={() => setActiveTab('form')}
                          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                            activeTab === 'form'
                              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <History className="w-4 h-4" />
                            Form
                          </div>
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-4">
                        {activeTab === 'markets' && (
                          <div>
                            {/* All Markets Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              {Object.entries(fixture.predictions).map(([market, probability]) => {
                                const odds = fixture.odds[market as keyof typeof fixture.odds];
                                const markupValue = calculateMarkupValue(probability, odds);
                                const isGoldenBet = fixture.golden_bet.market === market;

                                return (
                                  <div
                                    key={market}
                                    className={`p-3 rounded-lg border ${
                                      isGoldenBet
                                        ? 'bg-yellow-500/10 border-yellow-500/30'
                                        : 'bg-purple-500/5 border-purple-500/20'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">
                                          {getMarketShortLabel(market)}
                                        </span>
                                        {isGoldenBet && (
                                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        )}
                                      </div>
                                      <span className="text-sm text-gray-400">@{odds.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-purple-400">
                                        AI: {(probability * 100).toFixed(0)}%
                                      </span>
                                      <span className={`font-semibold ${markupValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {markupValue > 0 ? '+' : ''}{markupValue.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Golden Bet Reasoning */}
                            {fixture.golden_bet && (
                              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-sm font-semibold text-yellow-400">
                                    GOLDEN BET: {fixture.golden_bet.selection}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {fixture.golden_bet.ai_explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'h2h' && (
                          <div>
                            {loadingStats[fixture.fixture_id] ? (
                              <div className="text-center py-8 text-gray-400">Loading H2H data...</div>
                            ) : fixtureStats[fixture.fixture_id] ? (
                              <div>
                                {/* H2H Summary */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <div className="text-2xl font-bold text-green-400">
                                      {fixtureStats[fixture.fixture_id].h2h.homeWins}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{fixture.home_team} Wins</div>
                                  </div>
                                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-400">
                                      {fixtureStats[fixture.fixture_id].h2h.draws}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Draws</div>
                                  </div>
                                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">
                                      {fixtureStats[fixture.fixture_id].h2h.awayWins}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{fixture.away_team} Wins</div>
                                  </div>
                                </div>

                                {/* Last Meetings */}
                                <div>
                                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Last 5 Meetings</h4>
                                  <div className="space-y-2">
                                    {fixtureStats[fixture.fixture_id].h2h.lastMeetings.map((meeting, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                                        <div className="flex-1">
                                          <div className="text-sm font-semibold">
                                            {meeting.homeTeam} vs {meeting.awayTeam}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(meeting.date).toLocaleDateString()} • {meeting.league}
                                          </div>
                                        </div>
                                        <div className="text-lg font-bold text-purple-400">
                                          {meeting.homeScore} - {meeting.awayScore}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">No H2H data available</div>
                            )}
                          </div>
                        )}

                        {activeTab === 'stats' && (
                          <div>
                            {loadingStats[fixture.fixture_id] ? (
                              <div className="text-center py-8 text-gray-400">Loading stats...</div>
                            ) : fixtureStats[fixture.fixture_id] ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Home Team Stats */}
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-purple-400 mb-3">{fixture.home_team}</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Goals For:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.goalsFor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Goals Against:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.goalsAgainst}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Avg Goals/Game:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.avgGoalsScored}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Clean Sheets:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.cleanSheets}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">BTTS %:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.bttsPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Over 2.5 %:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].homeTeam.over25Percentage}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Away Team Stats */}
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-purple-400 mb-3">{fixture.away_team}</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Goals For:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.goalsFor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Goals Against:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.goalsAgainst}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Avg Goals/Game:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.avgGoalsScored}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Clean Sheets:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.cleanSheets}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">BTTS %:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.bttsPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Over 2.5 %:</span>
                                      <span className="font-semibold">{fixtureStats[fixture.fixture_id].awayTeam.over25Percentage}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">No stats available</div>
                            )}
                          </div>
                        )}

                        {activeTab === 'form' && (
                          <div>
                            {loadingStats[fixture.fixture_id] ? (
                              <div className="text-center py-8 text-gray-400">Loading form...</div>
                            ) : fixtureStats[fixture.fixture_id] ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Home Team Form */}
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-purple-400 mb-3">{fixture.home_team} - Last 5</h4>
                                  <div className="flex gap-2 justify-center">
                                    {fixtureStats[fixture.fixture_id].homeTeam.form.split('').map((result, idx) => (
                                      <div key={idx}>{renderFormBadge(result)}</div>
                                    ))}
                                  </div>
                                </div>

                                {/* Away Team Form */}
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-purple-400 mb-3">{fixture.away_team} - Last 5</h4>
                                  <div className="flex gap-2 justify-center">
                                    {fixtureStats[fixture.fixture_id].awayTeam.form.split('').map((result, idx) => (
                                      <div key={idx}>{renderFormBadge(result)}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-400">No form data available</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-purple-500/30 p-4 bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{filteredFixtures.length} fixtures found</span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Golden Bet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixturesModal;