import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ChevronDown, ChevronUp, Star, TrendingUp, Calendar } from 'lucide-react';

interface Fixture {
  fixture_id: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
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

interface FixturesModalProps {
  onClose: () => void;
}

const FixturesModal: React.FC<FixturesModalProps> = ({ onClose }) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fixtures data
    const mockFixtures: Fixture[] = [
      {
        fixture_id: 'f1',
        home_team: 'Man City',
        away_team: 'Liverpool',
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

  const toggleFixture = (fixtureId: string) => {
    setExpandedFixture(expandedFixture === fixtureId ? null : fixtureId);
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

                  {/* Expanded Details */}
                  {expandedFixture === fixture.fixture_id && (
                    <div className="border-t border-purple-500/20 p-4 bg-black/20">
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