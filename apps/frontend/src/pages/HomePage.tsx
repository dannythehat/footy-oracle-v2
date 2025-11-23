import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

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
  confidence: number;
  lm_probability: number;
  markup_value: number;
  ai_explanation: string;
  result?: 'win' | 'loss' | 'pending';
}

interface Fixture {
  fixture_id: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
  predictions: {
    btts: { yes: number; no: number };
    over_2_5_goals: { over: number; under: number };
    over_9_5_corners: { over: number; under: number };
    over_3_5_cards: { over: number; under: number };
  };
  golden_bet: {
    market: string;
    selection: string;
    probability: number;
  };
  odds?: {
    btts_yes: number;
    over_2_5: number;
    over_9_5_corners: number;
    over_3_5_cards: number;
  };
}

interface PLStats {
  daily: { profit: number; bets: number; wins: number };
  weekly: { profit: number; bets: number; wins: number };
  monthly: { profit: number; bets: number; wins: number };
  yearly: { profit: number; bets: number; wins: number };
  acca: {
    daily: { stake: number; potential: number; result: number };
    weekly: { total_staked: number; total_returned: number };
    monthly: { total_staked: number; total_returned: number };
    yearly: { total_staked: number; total_returned: number };
  };
}

const HomePage: React.FC = () => {
  const [goldenBets, setGoldenBets] = useState<GoldenBet[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [plStats, setPLStats] = useState<PLStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate date range (7 days past, today, 7 days future)
  const generateDateRange = () => {
    const dates = [];
    for (let i = -7; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with actual API calls
        const [goldenRes, fixturesRes, plRes] = await Promise.all([
          fetch('/api/golden-bets'),
          fetch(`/api/fixtures?date=${selectedDate}`),
          fetch('/api/pl-stats')
        ]);
        
        setGoldenBets(await goldenRes.json());
        setFixtures(await fixturesRes.json());
        setPLStats(await plRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'TODAY';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMarketLabel = (market: string) => {
    const labels: Record<string, string> = {
      'btts': 'BTTS',
      'over_2_5_goals': 'Over 2.5 Goals',
      'over_9_5_corners': 'Over 9.5 Corners',
      'over_3_5_cards': 'Over 3.5 Cards'
    };
    return labels[market] || market;
  };

  const toggleFixture = (fixtureId: string) => {
    setExpandedFixture(expandedFixture === fixtureId ? null : fixtureId);
  };

  // Filter fixtures by top 30 leagues
  const top30Leagues = [
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
    'Champions League', 'Europa League', 'Championship', 'Eredivisie', 'Primeira Liga',
    // Add remaining top 30 leagues
  ];

  const filteredFixtures = fixtures.filter(f => top30Leagues.includes(f.league));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-purple-400 text-xl animate-pulse">Loading Oracle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-purple-900/50 bg-gradient-to-r from-black via-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent">
            ⚡ THE FOOTY ORACLE
          </h1>
          <p className="text-gray-400 mt-2">AI-Powered Betting Intelligence • 300k+ Fixtures Analyzed</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Selector - FlashScore Style */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-purple-300">Fixtures</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-black">
            {dateRange.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedDate === date
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/50 border border-purple-800'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </section>

        {/* Fixtures List - Compact FlashScore Style */}
        <section className="mb-12">
          {filteredFixtures.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-purple-950/20 rounded-lg border border-purple-900/50">
              No fixtures available for this date
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group by league */}
              {Object.entries(
                filteredFixtures.reduce((acc, fixture) => {
                  if (!acc[fixture.league]) acc[fixture.league] = [];
                  acc[fixture.league].push(fixture);
                  return acc;
                }, {} as Record<string, Fixture[]>)
              ).map(([league, leagueFixtures]) => (
                <div key={league} className="bg-gradient-to-r from-purple-950/20 to-black border border-purple-900/50 rounded-lg overflow-hidden">
                  {/* League Header - Compact */}
                  <div className="bg-purple-950/40 px-4 py-2 border-b border-purple-800">
                    <h3 className="font-bold text-purple-300 text-sm">{league}</h3>
                  </div>

                  {/* Fixtures - Compact Rows */}
                  <div className="divide-y divide-purple-900/30">
                    {leagueFixtures.map((fixture) => (
                      <div key={fixture.fixture_id}>
                        {/* Fixture Row - Compact */}
                        <div
                          onClick={() => toggleFixture(fixture.fixture_id)}
                          className="px-4 py-2 hover:bg-purple-950/30 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-gray-400 text-xs w-10">{formatTime(fixture.kickoff)}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{fixture.home_team} vs {fixture.away_team}</div>
                              </div>
                            </div>

                            {/* Golden Bet Indicator - Compact */}
                            <div className="flex items-center gap-2">
                              <div className="bg-yellow-500/20 border border-yellow-500 rounded px-2 py-0.5">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 inline mr-1" />
                                <span className="text-yellow-400 text-xs font-bold">
                                  {getMarketLabel(fixture.golden_bet.market)}
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
                          <div className="px-4 py-3 bg-black/50 border-t border-purple-900/30">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {/* BTTS */}
                              <div className="bg-purple-950/30 rounded-lg p-2 border border-purple-800">
                                <div className="text-purple-300 text-xs font-semibold mb-1">BTTS</div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">Yes</span>
                                  <span className="font-bold text-purple-400 text-sm">{fixture.odds?.btts_yes.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-green-400">
                                  AI: {(fixture.predictions.btts.yes * 100).toFixed(0)}%
                                </div>
                              </div>

                              {/* Over 2.5 Goals */}
                              <div className="bg-purple-950/30 rounded-lg p-2 border border-purple-800">
                                <div className="text-purple-300 text-xs font-semibold mb-1">Over 2.5</div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">Over</span>
                                  <span className="font-bold text-purple-400 text-sm">{fixture.odds?.over_2_5.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-green-400">
                                  AI: {(fixture.predictions.over_2_5_goals.over * 100).toFixed(0)}%
                                </div>
                              </div>

                              {/* Over 9.5 Corners */}
                              <div className="bg-purple-950/30 rounded-lg p-2 border border-purple-800">
                                <div className="text-purple-300 text-xs font-semibold mb-1">O9.5 Corners</div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">Over</span>
                                  <span className="font-bold text-purple-400 text-sm">{fixture.odds?.over_9_5_corners.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-green-400">
                                  AI: {(fixture.predictions.over_9_5_corners.over * 100).toFixed(0)}%
                                </div>
                              </div>

                              {/* Over 3.5 Cards */}
                              <div className="bg-purple-950/30 rounded-lg p-2 border border-purple-800">
                                <div className="text-purple-300 text-xs font-semibold mb-1">O3.5 Cards</div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">Over</span>
                                  <span className="font-bold text-purple-400 text-sm">{fixture.odds?.over_3_5_cards.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-green-400">
                                  AI: {(fixture.predictions.over_3_5_cards.over * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>

                            {/* Golden Bet Highlight */}
                            <div className="mt-3 bg-gradient-to-r from-yellow-950/30 to-purple-950/30 border border-yellow-600 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">GOLDEN BET</span>
                              </div>
                              <div className="text-white text-sm">
                                <span className="font-semibold">{getMarketLabel(fixture.golden_bet.market)}</span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-green-400 font-bold">
                                  {(fixture.golden_bet.probability * 100).toFixed(0)}% Confidence
                                </span>
                              </div>
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
        </section>

        {/* Golden Bets Section - Enhanced Detail */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <h2 className="text-3xl font-bold text-purple-300">Today's Golden Bets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goldenBets.slice(0, 3).map((bet) => (
              <div
                key={bet.bet_id}
                className="relative bg-gradient-to-br from-purple-950/40 via-black to-purple-950/40 border-2 border-purple-500 rounded-xl p-6 hover:border-purple-400 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              >
                {/* AI % Badge - Top Right */}
                <div className="absolute -top-3 -right-3 bg-gray-800 border-2 border-purple-500 rounded-full px-3 py-1">
                  <span className="text-white font-bold text-sm">{(bet.lm_probability * 100).toFixed(0)}%</span>
                </div>

                {/* Fixture */}
                <div className="text-xl font-bold mb-2">
                  {bet.home_team} <span className="text-purple-400">vs</span> {bet.away_team}
                </div>

                {/* League */}
                <div className="text-purple-300 text-sm font-semibold mb-4">{bet.league}</div>

                {/* Market Name */}
                <div className="text-gray-400 text-sm mb-1">{getMarketLabel(bet.market)}</div>

                {/* Selection + Odds */}
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl font-bold text-white">{bet.selection}</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-3xl font-bold text-green-400">{bet.odds.toFixed(2)}</span>
                  </div>
                </div>

                {/* AI + Markup Value Line */}
                <div className="text-center bg-black/50 rounded-lg py-2 mb-4">
                  <span className="text-white font-semibold text-sm">
                    AI - {(bet.lm_probability * 100).toFixed(0)}% - {bet.markup_value.toFixed(0)}% Markup Value
                  </span>
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-950/30 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-300 leading-relaxed">{bet.ai_explanation}</div>
                </div>

                {/* Result Badge */}
                {bet.result && (
                  <div className={`text-center py-2 rounded-lg font-bold ${
                    bet.result === 'win' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500' 
                      : 'bg-red-500/20 text-red-400 border border-red-500'
                  }`}>
                    {bet.result === 'win' ? '✓ WON' : '✗ LOST'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* P&L Stats */}
        {plStats && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-purple-300">Performance Tracker</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {['daily', 'weekly', 'monthly', 'yearly'].map((period) => {
                const stats = plStats[period as keyof Omit<PLStats, 'acca'>];
                const winRate = stats.bets > 0 ? (stats.wins / stats.bets * 100).toFixed(1) : '0.0';
                
                return (
                  <div key={period} className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-xl p-5">
                    <div className="text-purple-300 text-sm font-semibold uppercase mb-3">{period}</div>
                    <div className={`text-3xl font-bold mb-2 ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      €{stats.profit.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {stats.wins}/{stats.bets} • {winRate}% Win Rate
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ACCA Tracker */}
            <div className="bg-gradient-to-br from-yellow-950/20 to-black border-2 border-yellow-600 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <h3 className="text-xl font-bold text-yellow-400">Daily €10 ACCA (3 Golden Bets)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['daily', 'weekly', 'monthly', 'yearly'].map((period) => {
                  const accaStats = plStats.acca[period as keyof PLStats['acca']];
                  const profit = 'result' in accaStats 
                    ? accaStats.result - accaStats.stake 
                    : accaStats.total_returned - accaStats.total_staked;
                  
                  return (
                    <div key={period} className="bg-black/50 rounded-lg p-4">
                      <div className="text-yellow-300 text-sm uppercase mb-2">{period}</div>
                      <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        €{profit.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;