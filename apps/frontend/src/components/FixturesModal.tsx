import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ChevronDown, ChevronUp, Star, Calendar, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

interface FixturesModalProps {
  onClose: () => void;
}

const FixturesModal: React.FC<FixturesModalProps> = ({ onClose }) => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLeagues, setFavoriteLeagues] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading fixtures...');

  // Generate date range: 7 days back, today, 7 days forward
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  useEffect(() => {
    fetchFixtures();
  }, [selectedDate]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingMessage('Waking up server...');
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching fixtures for date:', dateStr);
      
      // Show different messages during loading
      const messageTimer = setTimeout(() => {
        setLoadingMessage('Server is starting (this may take 30-60s)...');
      }, 3000);

      const messageTimer2 = setTimeout(() => {
        setLoadingMessage('Almost there, loading fixtures...');
      }, 15000);
      
      const response = await axios.get(`${API_BASE_URL}/api/fixtures`, {
        params: { date: dateStr },
        timeout: 120000, // 2 minutes for cold starts
      });
      
      clearTimeout(messageTimer);
      clearTimeout(messageTimer2);
      
      if (response.data && response.data.data) {
        setFixtures(response.data.data);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Server is taking too long to respond. The backend may be sleeping (Render free tier). Please wait 30s and try again.');
      } else if (err.response?.status === 404) {
        setError('No fixtures found for this date.');
        setFixtures([]);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load fixtures. Please try again.');
      }
      setFixtures([]);
    } finally {
      setLoading(false);
      setLoadingMessage('Loading fixtures...');
    }
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateShort = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return {
      day: days[date.getDay()],
      date: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0')
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const toggleFixture = (fixtureId: string) => {
    setExpandedFixture(expandedFixture === fixtureId ? null : fixtureId);
  };

  const toggleFavoriteLeague = (league: string) => {
    const newFavorites = new Set(favoriteLeagues);
    if (newFavorites.has(league)) {
      newFavorites.delete(league);
    } else {
      newFavorites.add(league);
    }
    setFavoriteLeagues(newFavorites);
    localStorage.setItem('favoriteLeagues', JSON.stringify(Array.from(newFavorites)));
  };

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteLeagues');
    if (saved) {
      setFavoriteLeagues(new Set(JSON.parse(saved)));
    }
  }, []);

  const leagues = Array.from(new Set(fixtures.map(f => f.league))).sort();

  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = searchQuery === '' || 
      fixture.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fixture.away_team.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLeague = selectedLeague === 'all' || fixture.league === selectedLeague;
    const matchesFavorites = !showFavoritesOnly || favoriteLeagues.has(fixture.league);
    
    return matchesSearch && matchesLeague && matchesFavorites;
  });

  // Group fixtures by league
  const fixturesByLeague = filteredFixtures.reduce((acc, fixture) => {
    if (!acc[fixture.league]) {
      acc[fixture.league] = [];
    }
    acc[fixture.league].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const scrollDates = (direction: 'left' | 'right') => {
    const container = document.getElementById('date-scroll');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border-b border-purple-500/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl">⚽</span>
              </div>
              <h2 className="text-2xl font-bold">Football</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Date Navigation */}
          <div className="relative flex items-center gap-2 mb-4">
            <button
              onClick={() => scrollDates('left')}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div id="date-scroll" className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
              {dateRange.map((date, idx) => {
                const formatted = formatDateShort(date);
                const selected = date.toDateString() === selectedDate.toDateString();
                const today = isToday(date);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                      selected
                        ? 'bg-purple-600 text-white'
                        : today
                        ? 'bg-red-600/80 text-white'
                        : 'bg-black/40 text-gray-300 hover:bg-black/60'
                    }`}
                  >
                    <div className="text-xs font-semibold">{formatted.day}</div>
                    <div className="text-sm font-bold">{formatted.date}.{formatted.month}.</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollDates('right')}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFavoritesOnly
                  ? 'bg-yellow-600 text-white'
                  : 'bg-black/40 text-gray-300 hover:bg-black/60'
              }`}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
              <span className="text-sm font-semibold">Favourites</span>
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* All Games Counter */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">All games</span>
            </div>
            <span className="text-gray-400 font-semibold">{filteredFixtures.length}</span>
          </div>
        </div>

        {/* Fixtures List */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" />
              <div className="text-gray-400 mb-2">{loadingMessage}</div>
              <div className="text-gray-500 text-sm">
                {loadingMessage.includes('Server is starting') && (
                  <span>Render free tier takes 30-60s to wake up</span>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Fixtures</h3>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchFixtures}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
              >
                Retry
              </button>
            </div>
          ) : filteredFixtures.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {fixtures.length === 0 ? 'No fixtures available for this date' : 'No fixtures found matching your filters'}
            </div>
          ) : (
            <div>
              {/* Favorite Competitions */}
              {favoriteLeagues.size > 0 && (
                <div className="border-b border-purple-500/20">
                  <div className="bg-gradient-to-r from-yellow-900/20 to-transparent px-4 py-2">
                    <h3 className="text-yellow-400 font-bold text-sm uppercase tracking-wide">Favourite Competitions</h3>
                  </div>
                  {Object.entries(fixturesByLeague)
                    .filter(([league]) => favoriteLeagues.has(league))
                    .map(([league, leagueFixtures]) => (
                      <div key={league} className="border-b border-purple-500/10">
                        <button
                          onClick={() => toggleFavoriteLeague(league)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-500/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded flex items-center justify-center text-xs font-bold">
                              {league.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-left">{league}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">{leagueFixtures.length}</span>
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          </div>
                        </button>
                        
                        {leagueFixtures.map((fixture) => (
                          <div
                            key={fixture.fixture_id}
                            className="border-t border-purple-500/10"
                          >
                            <button
                              onClick={() => toggleFixture(fixture.fixture_id)}
                              className="w-full px-4 py-3 hover:bg-purple-500/5 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="text-sm text-gray-400 w-12">
                                    {formatTime(fixture.kickoff)}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-semibold text-sm mb-1">
                                      {fixture.home_team}
                                    </div>
                                    <div className="font-semibold text-sm text-gray-400">
                                      {fixture.away_team}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {fixture.golden_bet && (
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  )}
                                  {expandedFixture === fixture.fixture_id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {expandedFixture === fixture.fixture_id && (
                              <div className="px-4 pb-4 bg-black/20">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-purple-900/20 p-3 rounded-lg">
                                    <div className="text-gray-400 mb-1">BTTS</div>
                                    <div className="font-bold text-purple-400">
                                      {(fixture.predictions.btts_yes * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg">
                                    <div className="text-gray-400 mb-1">Over 2.5</div>
                                    <div className="font-bold text-purple-400">
                                      {(fixture.predictions.over_2_5 * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg">
                                    <div className="text-gray-400 mb-1">O9.5 Corners</div>
                                    <div className="font-bold text-purple-400">
                                      {(fixture.predictions.over_9_5_corners * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                  <div className="bg-purple-900/20 p-3 rounded-lg">
                                    <div className="text-gray-400 mb-1">O3.5 Cards</div>
                                    <div className="font-bold text-purple-400">
                                      {(fixture.predictions.over_3_5_cards * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </div>
                                {fixture.golden_bet && (
                                  <div className="mt-3 bg-gradient-to-r from-yellow-900/30 to-transparent p-3 rounded-lg border border-yellow-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      <span className="text-yellow-400 font-bold text-sm">Golden Bet</span>
                                    </div>
                                    <div className="text-sm text-gray-300">
                                      {fixture.golden_bet.ai_explanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}

              {/* Other Competitions */}
              <div>
                <div className="bg-gradient-to-r from-gray-800/20 to-transparent px-4 py-2">
                  <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wide">
                    {favoriteLeagues.size > 0 ? 'Other Competitions [A-Z]' : 'All Competitions [A-Z]'}
                  </h3>
                </div>
                {Object.entries(fixturesByLeague)
                  .filter(([league]) => !favoriteLeagues.has(league))
                  .map(([league, leagueFixtures]) => (
                    <div key={league} className="border-b border-purple-500/10">
                      <button
                        onClick={() => toggleFavoriteLeague(league)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-500/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-xs font-bold">
                            {league.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-left">{league}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">{leagueFixtures.length}</span>
                          <Star className="w-5 h-5 text-gray-600 hover:text-yellow-400 transition-colors" />
                        </div>
                      </button>
                      
                      {leagueFixtures.map((fixture) => (
                        <div
                          key={fixture.fixture_id}
                          className="border-t border-purple-500/10"
                        >
                          <button
                            onClick={() => toggleFixture(fixture.fixture_id)}
                            className="w-full px-4 py-3 hover:bg-purple-500/5 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-sm text-gray-400 w-12">
                                  {formatTime(fixture.kickoff)}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-semibold text-sm mb-1">
                                    {fixture.home_team}
                                  </div>
                                  <div className="font-semibold text-sm text-gray-400">
                                    {fixture.away_team}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {fixture.golden_bet && (
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                )}
                                {expandedFixture === fixture.fixture_id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </button>

                          {expandedFixture === fixture.fixture_id && (
                            <div className="px-4 pb-4 bg-black/20">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-purple-900/20 p-3 rounded-lg">
                                  <div className="text-gray-400 mb-1">BTTS</div>
                                  <div className="font-bold text-purple-400">
                                    {(fixture.predictions.btts_yes * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="bg-purple-900/20 p-3 rounded-lg">
                                  <div className="text-gray-400 mb-1">Over 2.5</div>
                                  <div className="font-bold text-purple-400">
                                    {(fixture.predictions.over_2_5 * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="bg-purple-900/20 p-3 rounded-lg">
                                  <div className="text-gray-400 mb-1">O9.5 Corners</div>
                                  <div className="font-bold text-purple-400">
                                    {(fixture.predictions.over_9_5_corners * 100).toFixed(0)}%
                                  </div>
                                </div>
                                <div className="bg-purple-900/20 p-3 rounded-lg">
                                  <div className="text-gray-400 mb-1">O3.5 Cards</div>
                                  <div className="font-bold text-purple-400">
                                    {(fixture.predictions.over_3_5_cards * 100).toFixed(0)}%
                                  </div>
                                </div>
                              </div>
                              {fixture.golden_bet && (
                                <div className="mt-3 bg-gradient-to-r from-yellow-900/30 to-transparent p-3 rounded-lg border border-yellow-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-yellow-400 font-bold text-sm">Golden Bet</span>
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {fixture.golden_bet.ai_explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FixturesModal;
