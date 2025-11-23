import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, Clock, ChevronDown, ChevronUp, X, Search, Filter } from 'lucide-react';

interface GoldenBet {
  bet_id: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  league: string;
  kickoff: string;
  market: string;
  selection: string;
  odds: number;
  ai_probability: number;
  markup_value: number;
  ai_explanation: string;
  result?: 'win' | 'loss' | 'pending';
  profit_loss?: number;
}

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

interface PLStats {
  golden_bets: {
    today: { profit: number; bets: number; wins: number };
    week: { profit: number; bets: number; wins: number };
    month: { profit: number; bets: number; wins: number };
  };
  treble: {
    today: { stake: number; potential_return: number; status: 'pending' | 'won' | 'lost' };
    week: { total_staked: number; total_returned: number; wins: number; total: number };
    month: { total_staked: number; total_returned: number; wins: number; total: number };
  };
}

const HomePage: React.FC = () => {
  const [goldenBets, setGoldenBets] = useState<GoldenBet[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [plStats, setPLStats] = useState<PLStats | null>(null);
  const [showFixturesModal, setShowFixturesModal] = useState(false);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    const mockGoldenBets: GoldenBet[] = [
      {
        bet_id: '1',
        fixture_id: 'f1',
        home_team: 'Man City',
        away_team: 'Liverpool',
        league: 'Premier League',
        kickoff: new Date().toISOString(),
        market: 'over_2_5_goals',
        selection: 'Over 2.5',
        odds: 1.85,
        ai_probability: 0.78,
        markup_value: 44.3,
        ai_explanation: 'Both teams averaging 3.2 goals per game in last 5 matches. Historical H2H shows 4/5 games going over 2.5. City\'s attacking form is exceptional with 15 goals in last 4 games.',
        result: 'win',
        profit_loss: 8.50
      },
      {
        bet_id: '2',
        fixture_id: 'f2',
        home_team: 'Real Madrid',
        away_team: 'Barcelona',
        league: 'La Liga',
        kickoff: new Date().toISOString(),
        market: 'btts',
        selection: 'Yes',
        odds: 1.72,
        ai_probability: 0.82,
        markup_value: 41.0,
        ai_explanation: 'El Clasico intensity guarantees goals. Both teams have scored in 8/10 recent meetings. Madrid\'s defense has conceded in every home game this season.',
        result: 'pending'
      },
      {
        bet_id: '3',
        fixture_id: 'f3',
        home_team: 'Bayern Munich',
        away_team: 'Dortmund',
        league: 'Bundesliga',
        kickoff: new Date().toISOString(),
        market: 'over_9_5_corners',
        selection: 'Over 9.5',
        odds: 1.90,
        ai_probability: 0.75,
        markup_value: 42.5,
        ai_explanation: 'Der Klassiker averages 12.3 corners. Both teams play high-pressing styles forcing corners. Last 3 meetings all exceeded 11 corners.',
        result: 'pending'
      }
    ];

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
          market: 'over_2_5_goals',
          selection: 'Over 2.5',
          probability: 0.78,
          markup_value: 44.3,
          ai_explanation: 'Both teams averaging 3.2 goals per game in last 5 matches. Historical H2H shows 4/5 games going over 2.5.'
        }
      },
      {
        fixture_id: 'f4',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        kickoff: new Date(Date.now() + 7200000).toISOString(),
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
          selection: 'Over 9.5',
          probability: 0.71,
          markup_value: 33.5,
          ai_explanation: 'London derby intensity. Both teams average 11+ corners in rivalry matches. Arsenal\'s wide play generates high corner counts.'
        }
      },
      {
        fixture_id: 'f5',
        home_team: 'Tottenham',
        away_team: 'West Ham',
        kickoff: new Date(Date.now() + 10800000).toISOString(),
        league: 'Premier League',
        predictions: {
          btts_yes: 0.55,
          over_2_5: 0.52,
          over_9_5_corners: 0.48,
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
          selection: 'Over 3.5',
          probability: 0.68,
          markup_value: 30.6,
          ai_explanation: 'Not a standout match for goals, but referee Mike Dean averages 4.8 cards per game. Physical derby with 6 yellow cards in last meeting.'
        }
      }
    ];

    const mockPLStats: PLStats = {
      golden_bets: {
        today: { profit: 8.50, bets: 3, wins: 1 },
        week: { profit: 45.20, bets: 21, wins: 14 },
        month: { profit: 187.50, bets: 90, wins: 61 }
      },
      treble: {
        today: { stake: 10, potential_return: 61.37, status: 'pending' },
        week: { total_staked: 70, total_returned: 122.50, wins: 2, total: 7 },
        month: { total_staked: 300, total_returned: 485.00, wins: 8, total: 30 }
      }
    };

    setGoldenBets(mockGoldenBets);
    setFixtures(mockFixtures);
    setPLStats(mockPLStats);
    setLoading(false);
  }, []);

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      'btts': 'BTTS Yes',
      'over_2_5_goals': 'Over 2.5 Goals',
      'over_9_5_corners': 'Over 9.5 Corners',
      'over_3_5_cards': 'Over 3.5 Cards'
    };
    return labels[market] || market;
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

  const toggleFixture = (fixtureId: string) => {
    setExpandedFixture(expandedFixture === fixtureId ? null : fixtureId);
  };

  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = searchQuery === '' || 
      f.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.away_team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeague = selectedLeague === 'all' || f.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  const leagues = ['all', ...Array.from(new Set(fixtures.map(f => f.league)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">Loading Oracle...</div>
      </div>
    );
  }

  const trebleCombinedOdds = goldenBets.slice(0, 3).reduce((acc, bet) => acc * bet.odds, 1);
  const treblePotentialReturn = 10 * trebleCombinedOdds;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-purple-900/50 bg-gradient-to-r from-black via-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
                ⚡ THE FOOTY ORACLE
              </h1>
              <p className="text-gray-400 text-sm mt-1">AI-Powered Betting Intelligence • 300k+ Fixtures Analyzed</p>
            </div>
            <button
              onClick={() => setShowFixturesModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Calendar className="w-5 h-5" />
              View All Fixtures ({fixtures.length})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Golden Bets Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            <h2 className="text-2xl font-bold text-purple-300">Today's Golden Bets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goldenBets.slice(0, 3).map((bet, index) => (
              <div
                key={bet.bet_id}
                className="relative bg-gradient-to-br from-purple-950/40 via-black to-purple-950/40 border-2 border-purple-500 rounded-lg p-4 hover:border-purple-400 transition-all"
              >
                {/* Number Badge */}
                <div className="absolute -top-2 -left-2 bg-purple-600 border-2 border-purple-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>

                {/* AI % Badge */}
                <div className="absolute -top-2 -right-2 bg-gray-800 border-2 border-green-500 rounded-full px-2 py-1">
                  <span className="text-green-400 font-bold text-xs">{(bet.ai_probability * 100).toFixed(0)}%</span>
                </div>

                {/* Fixture */}
                <div className="text-base font-bold mb-1 mt-2">
                  {bet.home_team} <span className="text-purple-400 text-sm">vs</span> {bet.away_team}
                </div>

                {/* League + Time */}
                <div className="flex items-center gap-2 text-xs text-purple-300 mb-3">
                  <span>{bet.league}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{formatTime(bet.kickoff)}</span>
                </div>

                {/* Market + Odds */}
                <div className="bg-black/50 rounded-lg p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{getMarketLabel(bet.market)}</span>
                    <span className="text-xl font-bold text-green-400">{bet.odds.toFixed(2)}</span>
                  </div>
                </div>

                {/* Markup Value */}
                <div className="text-center bg-purple-950/50 rounded py-1 mb-2">
                  <span className="text-yellow-400 font-semibold text-xs">
                    +{bet.markup_value.toFixed(1)}% Value Edge
                  </span>
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-950/30 rounded p-2 mb-2">
                  <p className="text-xs text-gray-300 leading-relaxed">{bet.ai_explanation}</p>
                </div>

                {/* Result */}
                {bet.result && bet.result !== 'pending' && (
                  <div className={`text-center py-1 rounded font-bold text-sm ${
                    bet.result === 'win' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500' 
                      : 'bg-red-500/20 text-red-400 border border-red-500'
                  }`}>
                    {bet.result === 'win' ? `✓ WON +€${bet.profit_loss?.toFixed(2)}` : `✗ LOST -€10.00`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* P&L Stats */}
        {plStats && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-7 h-7 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-300">Performance Tracker</h2>
            </div>

            {/* Golden Bets P&L */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Golden Bets (€10 per bet)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['today', 'week', 'month'].map((period) => {
                  const stats = plStats.golden_bets[period as keyof typeof plStats.golden_bets];
                  const winRate = stats.bets > 0 ? (stats.wins / stats.bets * 100).toFixed(0) : '0';
                  
                  return (
                    <div key={period} className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-lg p-3">
                      <div className="text-purple-300 text-xs font-semibold uppercase mb-1">{period}</div>
                      <div className={`text-2xl font-bold mb-1 ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        €{stats.profit.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {stats.wins}W / {stats.bets - stats.wins}L • {winRate}% Win Rate
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Treble Tracker */}
            <div className="bg-gradient-to-br from-yellow-950/20 to-black border-2 border-yellow-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="text-lg font-bold text-yellow-400">Daily Treble Tracker (€10 Stake)</h3>
              </div>
              
              {/* Today's Treble */}
              <div className="bg-black/50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Today's Treble</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    plStats.treble.today.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    plStats.treble.today.status === 'won' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {plStats.treble.today.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400">Combined Odds:</span>
                  <span className="text-xl font-bold text-purple-400">{trebleCombinedOdds.toFixed(2)}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-400">Potential Return:</span>
                  <span className="text-xl font-bold text-green-400">€{treblePotentialReturn.toFixed(2)}</span>
                </div>
              </div>

              {/* Treble Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['week', 'month'].map((period) => {
                  const stats = plStats.treble[period as keyof Omit<typeof plStats.treble, 'today'>];
                  const profit = stats.total_returned - stats.total_staked;
                  const roi = stats.total_staked > 0 ? ((profit / stats.total_staked) * 100).toFixed(0) : '0';
                  
                  return (
                    <div key={period} className="bg-black/50 rounded-lg p-3">
                      <div className="text-yellow-300 text-xs uppercase mb-1">{period}</div>
                      <div className={`text-xl font-bold mb-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        €{profit.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {stats.wins}/{stats.total} Won • {roi}% ROI
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Fixtures Modal */}
      {showFixturesModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-950/90 to-black border-2 border-purple-500 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-purple-300">All Fixtures</h2>
              </div>
              <button
                onClick={() => setShowFixturesModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="p-4 border-b border-purple-800 space-y-3">
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
              <div className="flex gap-2 overflow-x-auto pb-2">
                {leagues.map((league) => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedLeague === league
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/50'
                    }`}
                  >
                    {league === 'all' ? 'All Leagues' : league}
                  </button>
                ))}
              </div>
            </div>

            {/* Fixtures List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredFixtures.map((fixture) => (
                <div key={fixture.fixture_id} className="bg-black/50 border border-purple-800 rounded-lg overflow-hidden">
                  {/* Fixture Header */}
                  <div
                    onClick={() => toggleFixture(fixture.fixture_id)}
                    className="p-3 hover:bg-purple-950/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">{formatTime(fixture.kickoff)}</span>
                          <span className="text-xs text-purple-300 font-semibold">{fixture.league}</span>
                        </div>
                        <div className="text-sm font-bold">
                          {fixture.home_team} <span className="text-purple-400 text-xs">vs</span> {fixture.away_team}
                        </div>
                      </div>

                      {/* Golden Bet Badge */}
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-500/20 border border-yellow-500 rounded px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline mr-1" />
                          <span className="text-yellow-400 text-xs font-bold">
                            {getMarketShortLabel(fixture.golden_bet.market)}
                          </span>
                        </div>
                        {expandedFixture === fixture.fixture_id ? (
                          <ChevronUp className="w-4 h-4 text-purple-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedFixture === fixture.fixture_id && (
                    <div className="px-3 pb-3 border-t border-purple-800">
                      {/* All Markets */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 mt-3">
                        {Object.entries(fixture.predictions).map(([market, prob]) => {
                          const odds = fixture.odds[market as keyof typeof fixture.odds];
                          const markupValue = ((prob * odds - 1) * 100).toFixed(1);
                          const isGolden = fixture.golden_bet.market === market;
                          
                          return (
                            <div
                              key={market}
                              className={`rounded-lg p-2 ${
                                isGolden 
                                  ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                                  : 'bg-purple-950/30 border border-purple-800'
                              }`}
                            >
                              <div className={`text-xs font-semibold mb-1 ${isGolden ? 'text-yellow-400' : 'text-purple-300'}`}>
                                {getMarketShortLabel(market)}
                                {isGolden && <Star className="w-3 h-3 inline ml-1 fill-yellow-400" />}
                              </div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">Odds</span>
                                <span className="font-bold text-purple-400 text-sm">{odds.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">AI</span>
                                <span className="text-green-400 text-xs font-bold">{(prob * 100).toFixed(0)}%</span>
                              </div>
                              <div className="text-center">
                                <span className={`text-xs font-semibold ${parseFloat(markupValue) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {parseFloat(markupValue) > 0 ? '+' : ''}{markupValue}% Value
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Golden Bet Explanation */}
                      <div className="bg-gradient-to-r from-yellow-950/30 to-purple-950/30 border border-yellow-600 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 font-bold text-xs">GOLDEN BET REASONING</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{fixture.golden_bet.ai_explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;