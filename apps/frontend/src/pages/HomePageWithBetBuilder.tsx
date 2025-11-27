import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, Trophy, Target, Brain, Zap, ChevronRight, AlertCircle, Sparkles, Crown } from 'lucide-react';
import FixturesModal from '../components/FixturesModal';
import BetBuilderCard from '../components/BetBuilderCard';
import BetBuilderOfTheDay from '../components/BetBuilderOfTheDay';
import { goldenBetsApi, betBuilderApi } from '../services/api';

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
  enhancedReasoning?: string;
  compositeScore?: number;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
}

const HomePage: React.FC = () => {
  const [goldenBets, setGoldenBets] = useState<GoldenBet[]>([]);
  const [betBuilderOfTheDay, setBetBuilderOfTheDay] = useState<BetBuilder | null>(null);
  const [betBuilders, setBetBuilders] = useState<BetBuilder[]>([]);
  const [showFixturesModal, setShowFixturesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBBOTD, setLoadingBBOTD] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingBBOTD(true);
      setError(null);
      
      const [betsResponse, bbotdResponse, buildersResponse] = await Promise.all([
        goldenBetsApi.getToday().catch(() => null),
        betBuilderApi.getOfTheDay().catch(() => null),
        betBuilderApi.getToday().catch(() => null)
      ]);

      setGoldenBets(betsResponse?.data || []);
      setBetBuilderOfTheDay(bbotdResponse?.data || null);
      setBetBuilders(buildersResponse?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setLoadingBBOTD(false);
    }
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
              Machine learning meets expert analysis. Get premium Golden Bets daily with AI reasoning and transparent performance tracking.
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 👑 BET BUILDER OF THE DAY - PREMIUM FEATURE */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400">
              BET BUILDER OF THE DAY
            </h2>
            <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
            Our ML algorithm selects the single best bet builder each day - the optimal balance between confidence and value
          </p>
          <BetBuilderOfTheDay betBuilder={betBuilderOfTheDay} loading={loadingBBOTD} />
        </div>

        {/* Key Features Section */}
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
              Premium picks with 80%+ AI confidence. Each bet backed by machine learning analysis and expert reasoning.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Trophy className="w-4 h-4" />
              <span>High Confidence Selections</span>
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
              Every prediction comes with detailed AI analysis covering form, head-to-head, and tactical insights.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Target className="w-4 h-4" />
              <span>Transparent & Explainable</span>
            </div>
          </div>

          {/* Feature 3: Value Focus */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Value Detection</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Markup value analysis identifies where bookmakers have mispriced markets for maximum edge.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>Edge Over Bookmakers</span>
            </div>
          </div>
        </div>

        {/* Today's Golden Bets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Golden Bets</h2>
              <p className="text-gray-400">Premium AI-selected picks with detailed reasoning</p>
            </div>
            {goldenBets.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold">{goldenBets.length} Premium Picks</span>
              </div>
            )}
          </div>

          {goldenBets.length === 0 ? (
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20 rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2 text-gray-300">No Golden Bets Available Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Our ML models are analyzing today's fixtures. Golden Bets will appear here once the analysis is complete.
              </p>
              <button
                onClick={() => setShowFixturesModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
              >
                <Calendar className="w-5 h-5" />
                Browse All Fixtures
              </button>
            </div>
          ) : (
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
                      <span className="text-sm text-gray-400">Value Edge</span>
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🧠 MORE BET BUILDERS SECTION */}
        {betBuilders.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  More Bet Builders
                </h2>
                <p className="text-gray-400">Additional multi-market convergence opportunities</p>
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
      </div>

      {/* Fixtures Modal */}
      {showFixturesModal && (
        <FixturesModal onClose={() => setShowFixturesModal(false)} />
      )}
    </div>
  );
};

export default HomePage;
