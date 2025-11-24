import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, Trophy, Target, Brain, Zap, ChevronRight } from 'lucide-react';
import FixturesModal from '../components/FixturesModal';

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
  const [plStats, setPLStats] = useState<PLStats | null>(null);
  const [showFixturesModal, setShowFixturesModal] = useState(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-500 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-black border-b border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI-Powered Predictions</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
              The Footy Oracle
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Machine learning meets expert analysis. Get 3 premium Golden Bets daily with AI reasoning and transparent performance tracking.
            </p>
            <button
              onClick={() => setShowFixturesModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              <Calendar className="w-5 h-5" />
              Browse All Fixtures
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1: Golden Bets */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Golden Bets</h3>
            </div>
            <p className="text-gray-400 mb-4">
              3 premium picks daily with 80%+ AI confidence. Each bet backed by machine learning analysis and expert reasoning.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Trophy className="w-4 h-4" />
              <span>67.8% Win Rate This Month</span>
            </div>
          </div>

          {/* Feature 2: AI Reasoning */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">AI Reasoning</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Every prediction comes with detailed GPT-4 analysis covering form, head-to-head, and tactical insights.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Target className="w-4 h-4" />
              <span>Transparent & Explainable</span>
            </div>
          </div>

          {/* Feature 3: Performance Tracking */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Live P&L Tracking</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Real-time profit/loss tracking with daily, weekly, and monthly breakdowns. Full transparency on every bet.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>+€187.50 This Month</span>
            </div>
          </div>
        </div>

        {/* Today's Golden Bets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              Today's Golden Bets
            </h2>
            <div className="text-sm text-gray-400">
              Updated {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {goldenBets.map((bet) => (
              <div
                key={bet.bet_id}
                className="bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                        {bet.league}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(bet.kickoff)}</span>
                      {bet.result === 'win' && (
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded font-semibold">
                          WON +€{bet.profit_loss?.toFixed(2)}
                        </span>
                      )}
                      {bet.result === 'pending' && (
                        <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold mb-1">
                      {bet.home_team} vs {bet.away_team}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-purple-300 font-semibold">
                        {getMarketLabel(bet.market)}
                      </span>
                      <span className="text-gray-400">@{bet.odds.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {(bet.ai_probability * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">AI Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {bet.markup_value.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Value</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <span className="text-xs text-purple-400 font-semibold">AI REASONING</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {bet.ai_explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* P&L Stats */}
        {plStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Golden Bets P&L */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Golden Bets Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-400">Today</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${plStats.golden_bets.today.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plStats.golden_bets.today.profit >= 0 ? '+' : ''}€{plStats.golden_bets.today.profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plStats.golden_bets.today.wins}/{plStats.golden_bets.today.bets} wins
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
                  <span className="text-gray-400">This Week</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${plStats.golden_bets.week.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plStats.golden_bets.week.profit >= 0 ? '+' : ''}€{plStats.golden_bets.week.profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plStats.golden_bets.week.wins}/{plStats.golden_bets.week.bets} wins ({((plStats.golden_bets.week.wins / plStats.golden_bets.week.bets) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Month</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${plStats.golden_bets.month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plStats.golden_bets.month.profit >= 0 ? '+' : ''}€{plStats.golden_bets.month.profit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plStats.golden_bets.month.wins}/{plStats.golden_bets.month.bets} wins ({((plStats.golden_bets.month.wins / plStats.golden_bets.month.bets) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Treble Stats */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-400" />
                Daily Treble (€10 Stake)
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-green-500/20">
                  <span className="text-gray-400">Today's Treble</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      €{plStats.treble.today.potential_return.toFixed(2)}
                    </div>
                    <div className="text-xs text-yellow-400 uppercase">
                      {plStats.treble.today.status}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-500/20">
                  <span className="text-gray-400">This Week</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${plStats.treble.week.total_returned - plStats.treble.week.total_staked >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plStats.treble.week.total_returned - plStats.treble.week.total_staked >= 0 ? '+' : ''}€{(plStats.treble.week.total_returned - plStats.treble.week.total_staked).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plStats.treble.week.wins}/{plStats.treble.week.total} trebles won
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Month</span>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${plStats.treble.month.total_returned - plStats.treble.month.total_staked >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {plStats.treble.month.total_returned - plStats.treble.month.total_staked >= 0 ? '+' : ''}€{(plStats.treble.month.total_returned - plStats.treble.month.total_staked).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {plStats.treble.month.wins}/{plStats.treble.month.total} trebles won ({((plStats.treble.month.wins / plStats.treble.month.total) * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixtures Modal */}
      {showFixturesModal && (
        <FixturesModal onClose={() => setShowFixturesModal(false)} />
      )}
    </div>
  );
};

export default HomePage;