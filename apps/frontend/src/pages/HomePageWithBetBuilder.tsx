import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, Trophy, Target, Brain, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import FixturesModal from '../components/FixturesModal';
import BetBuilderCard from '../components/BetBuilderCard';
import { goldenBetsApi, statsApi, betBuilderApi } from '../services/api';

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

interface MarketPrediction {
  market: string;
  marketName: string;
  confidence: number;
  probability: number;
  estimatedOdds: number;
}

interface BetBuilder {
  _id: string;
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  markets: MarketPrediction[];
  combinedConfidence: number;
  estimatedCombinedOdds: number;
  aiReasoning?: string;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
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
  const [betBuilders, setBetBuilders] = useState<BetBuilder[]>([]);
  const [plStats, setPLStats] = useState<PLStats | null>(null);
  const [showFixturesModal, setShowFixturesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real data from backend
      const [betsResponse, statsResponse, buildersResponse] = await Promise.all([
        goldenBetsApi.getToday().catch(() => null),
        statsApi.getPnL('all').catch(() => null),
        betBuilderApi.getToday().catch(() => null)
      ]);

      if (betsResponse && statsResponse) {
        setGoldenBets(betsResponse.data || []);
        setPLStats(statsResponse.data || null);
        setBetBuilders(buildersResponse?.data || []);
        setUsingMockData(false);
      } else {
        // Fallback to mock data if backend is not available
        loadMockData();
        setUsingMockData(true);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      loadMockData();
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
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

    const mockBetBuilders: BetBuilder[] = [
      {
        _id: 'bb1',
        fixtureId: 12345,
        date: new Date().toISOString(),
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        league: 'Premier League',
        kickoff: new Date().toISOString(),
        markets: [
          { market: 'btts', marketName: 'Both Teams To Score', confidence: 82, probability: 0.82, estimatedOdds: 1.75 },
          { market: 'over_2_5_goals', marketName: 'Over 2.5 Goals', confidence: 78, probability: 0.78, estimatedOdds: 1.85 },
          { market: 'over_9_5_corners', marketName: 'Over 9.5 Corners', confidence: 76, probability: 0.76, estimatedOdds: 1.90 }
        ],
        combinedConfidence: 79,
        estimatedCombinedOdds: 6.15,
        aiReasoning: 'London derby with high intensity. Both teams in excellent attacking form. Arsenal averaging 2.8 goals at home, Chelsea 2.1 away. Historical H2H shows 7/10 games with BTTS and over 2.5 goals. High-pressing styles from both teams typically generate 11+ corners.',
        result: 'pending'
      },
      {
        _id: 'bb2',
        fixtureId: 12346,
        date: new Date().toISOString(),
        homeTeam: 'PSG',
        awayTeam: 'Marseille',
        league: 'Ligue 1',
        kickoff: new Date().toISOString(),
        markets: [
          { market: 'btts', marketName: 'Both Teams To Score', confidence: 85, probability: 0.85, estimatedOdds: 1.70 },
          { market: 'over_2_5_goals', marketName: 'Over 2.5 Goals', confidence: 81, probability: 0.81, estimatedOdds: 1.80 },
          { market: 'over_3_5_cards', marketName: 'Over 3.5 Cards', confidence: 88, probability: 0.88, estimatedOdds: 1.65 }
        ],
        combinedConfidence: 85,
        estimatedCombinedOdds: 5.05,
        aiReasoning: 'Le Classique is France\'s most intense rivalry. Historically high-scoring with BTTS in 9/10 recent meetings. Referee has averaged 4.2 cards in big matches this season. PSG\'s attacking prowess combined with Marseille\'s aggressive pressing creates perfect storm for goals and cards.',
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
    setBetBuilders(mockBetBuilders);
    setPLStats(mockPLStats);
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-purple-500 text-xl">Loading Golden Bets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backend Status Banner */}
      {usingMockData && (
        <div className="bg-yellow-900/20 border-b border-yellow-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Demo Mode: Showing sample data. Backend connection will be established after deployment.</span>
          </div>
        </div>
      )}

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

          {/* Feature 3: P&L Tracking */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Live P&L Tracking</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Real-time profit tracking with daily, weekly, and monthly breakdowns. Full transparency on every bet.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>+£187.50 This Month</span>
            </div>
          </div>
        </div>

        {/* Today's Golden Bets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Golden Bets</h2>
              <p className="text-gray-400">3 premium AI-selected picks with detailed reasoning</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold">Premium Picks</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {goldenBets.map((bet) => (
              <div
                key={bet.bet_id}
                className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/40 rounded-xl p-6 hover:border-purple-500/60 transition-all"
              >
                {/* Match Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-purple-300 font-semibold">{bet.league}</span>
                    </div>
                    <div className="text-lg font-bold mb-1">
                      {bet.home_team} vs {bet.away_team}
                    </div>
                    <div className="text-sm text-gray-400">{formatTime(bet.kickoff)}</div>
                  </div>
                  {bet.result && (
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bet.result === 'win'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : bet.result === 'loss'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {bet.result === 'win' ? '✓ Won' : bet.result === 'loss' ? '✗ Lost' : 'Pending'}
                    </div>
                  )}
                </div>

                {/* Bet Details */}
                <div className="bg-black/40 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Market</span>
                    <span className="font-semibold">{getMarketLabel(bet.market)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Odds</span>
                    <span className="font-semibold text-purple-400">{bet.odds.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">AI Confidence</span>
                    <span className="font-semibold text-green-400">{(bet.ai_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Value</span>
                    <span className="font-semibold text-yellow-400">+{bet.markup_value.toFixed(1)}%</span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-300">AI Analysis</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{bet.ai_explanation}</p>
                </div>

                {/* Profit/Loss */}
                {bet.profit_loss !== undefined && (
                  <div className="mt-4 pt-4 border-t border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Profit/Loss</span>
                      <span
                        className={`font-bold ${
                          bet.profit_loss > 0 ? 'text-green-400' : bet.profit_loss < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}
                      >
                        {bet.profit_loss > 0 ? '+' : ''}£{bet.profit_loss.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🧠 BET BUILDER BRAIN SECTION */}
        {betBuilders.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  Bet Builder Brain
                </h2>
                <p className="text-gray-400">Multi-market convergence opportunities with 75%+ confidence</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold">High Value</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {betBuilders.map((builder) => (
                <BetBuilderCard key={builder._id} betBuilder={builder} />
              ))}
            </div>
          </div>
        )}

        {/* P&L Statistics */}
        {plStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Golden Bets Stats */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-bold">Golden Bets Performance</h3>
              </div>

              <div className="space-y-4">
                {/* Today */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Today</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +£{plStats.golden_bets.today.profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {plStats.golden_bets.today.wins}/{plStats.golden_bets.today.bets} wins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-semibold text-purple-400">
                        {((plStats.golden_bets.today.wins / plStats.golden_bets.today.bets) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* This Week */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">This Week</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +£{plStats.golden_bets.week.profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {plStats.golden_bets.week.wins}/{plStats.golden_bets.week.bets} wins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-semibold text-purple-400">
                        {((plStats.golden_bets.week.wins / plStats.golden_bets.week.bets) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* This Month */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">This Month</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +£{plStats.golden_bets.month.profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {plStats.golden_bets.month.wins}/{plStats.golden_bets.month.bets} wins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-semibold text-purple-400">
                        {((plStats.golden_bets.month.wins / plStats.golden_bets.month.bets) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Treble Stats */}
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-bold">Treble Performance</h3>
              </div>

              <div className="space-y-4">
                {/* Today's Treble */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Today's Treble</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">Stake</div>
                      <div className="text-xl font-bold">£{plStats.treble.today.stake.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Potential Return</div>
                      <div className="text-xl font-bold text-purple-400">
                        £{plStats.treble.today.potential_return.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-500/30">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        plStats.treble.today.status === 'won'
                          ? 'bg-green-500/20 text-green-400'
                          : plStats.treble.today.status === 'lost'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {plStats.treble.today.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* This Week */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">This Week</div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm text-gray-400">Total Staked</div>
                      <div className="text-lg font-bold">£{plStats.treble.week.total_staked.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total Returned</div>
                      <div className="text-lg font-bold text-green-400">
                        £{plStats.treble.week.total_returned.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {plStats.treble.week.wins}/{plStats.treble.week.total} trebles won
                  </div>
                </div>

                {/* This Month */}
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">This Month</div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm text-gray-400">Total Staked</div>
                      <div className="text-lg font-bold">£{plStats.treble.month.total_staked.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total Returned</div>
                      <div className="text-lg font-bold text-green-400">
                        £{plStats.treble.month.total_returned.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {plStats.treble.month.wins}/{plStats.treble.month.total} trebles won
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixtures Modal */}
      {showFixturesModal && <FixturesModal onClose={() => setShowFixturesModal(false)} />}
    </div>
  );
};

export default HomePage;
