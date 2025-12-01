import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  Calendar,
  Radio,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { fixturesApi } from '../services/api';
import MatchDetailDrawer from '../components/fixtures/MatchDetailDrawer';

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

export default function FixturesPage() {
  const navigate = useNavigate();
  
  // Generate rolling dates: 7 past + today + 7 future
  const generateRollingDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        dateStr: date.toISOString().split('T')[0],
        isToday: i === 0,
        isPast: i < 0,
        isFuture: i > 0
      });
    }
    return dates;
  };

  const rollingDates = generateRollingDates();
  const todayIndex = rollingDates.findIndex(d => d.isToday);
  
  const [selectedDateIndex, setSelectedDateIndex] = useState(todayIndex);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('fixture_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (fixtureId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fixtureId)) {
      newFavorites.delete(fixtureId);
    } else {
      newFavorites.add(fixtureId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('fixture_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  useEffect(() => {
    fetchFixtures();
  }, [selectedDateIndex]);

  const fetchFixtures = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = rollingDates[selectedDateIndex].dateStr;
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
        }, 2000 * (retryCount + 1));
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
    return s.includes('live') || s.includes('1h') || s.includes('2h') || s.includes('ht');
  };

  const isFinished = (status: string) => {
    return status.toLowerCase().includes('ft');
  };

  const openFixtureDetail = (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedFixture(null), 300);
  };

  const formatDateLabel = (dateObj: typeof rollingDates[0]) => {
    if (dateObj.isToday) return 'Today';
    const date = dateObj.date;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday} ${day} ${month}`;
  };

  // Separate live fixtures
  const liveFixtures = useMemo(() => {
    return fixtures.filter(f => isLive(f.status));
  }, [fixtures]);

  const groupedFixtures = useMemo(() => {
    const filtered = fixtures.filter(fixture => {
      const matchesSearch = searchQuery === '' || 
        fixture.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLeague = selectedLeague === 'all' || fixture.leagueName === selectedLeague;
      
      return matchesSearch && matchesLeague && !isLive(fixture.status);
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

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedDateIndex > 0) {
      setSelectedDateIndex(selectedDateIndex - 1);
    } else if (direction === 'next' && selectedDateIndex < rollingDates.length - 1) {
      setSelectedDateIndex(selectedDateIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-black border-b border-purple-500/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h1 className="text-base font-bold">Fixtures</h1>
              </div>
            </div>
            
            {/* Connection Status - Compact */}
            <div className="flex items-center gap-1.5">
              {error ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30">
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] text-red-400">Offline</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Rolling Date Selector - Mobile Optimized */}
          <div className="mb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateDate('prev')}
                disabled={selectedDateIndex === 0}
                className="p-1 rounded bg-purple-900/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-900/40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1">
                  {rollingDates.map((dateObj, index) => (
                    <button
                      key={dateObj.dateStr}
                      onClick={() => setSelectedDateIndex(index)}
                      className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-semibold transition-all whitespace-nowrap ${
                        selectedDateIndex === index
                          ? 'bg-purple-600 text-white neon-purple'
                          : dateObj.isToday
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                          : 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/30'
                      }`}
                    >
                      {formatDateLabel(dateObj)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigateDate('next')}
                disabled={selectedDateIndex === rollingDates.length - 1}
                className="p-1 rounded bg-purple-900/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-900/40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter - Compact */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="pl-7 pr-6 py-1.5 text-xs bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer"
              >
                {leagues.map(league => (
                  <option key={league} value={league} className="bg-gray-900">
                    {league === 'all' ? 'All' : league}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 py-3">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500/20 border-t-purple-500 mx-auto mb-2"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-400">Loading...</div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/20 to-black border border-red-500/30 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-red-400 mb-1">Connection Error</h3>
              <p className="text-xs text-gray-400 mb-3">{error}</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* LIVE SECTION - Prominent */}
        {!loading && !error && liveFixtures.length > 0 && (
          <div className="mb-3">
            <div className="bg-gradient-to-br from-red-950/30 to-black border border-red-500/30 rounded-xl overflow-hidden">
              {/* Live Header */}
              <div className="bg-red-900/30 border-b border-red-500/20 px-3 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  <h2 className="text-xs font-bold text-red-400">LIVE NOW</h2>
                </div>
                <span className="text-[10px] text-red-400">{liveFixtures.length} live</span>
              </div>

              {/* Live Fixtures - Clickable */}
              <div className="divide-y divide-red-500/10">
                {liveFixtures.map((fixture) => (
                  <button
                    key={fixture.id}
                    onClick={() => openFixtureDetail(fixture)}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-500/10 transition-all bg-red-500/5 active:bg-red-500/15"
                  >
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => toggleFavorite(fixture.id, e)}
                      className="flex-shrink-0"
                    >
                      <Star 
                        className={`w-3.5 h-3.5 transition-all ${
                          favorites.has(fixture.id) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-600 hover:text-yellow-400'
                        }`}
                      />
                    </button>

                    {/* Time & Live Indicator */}
                    <div className="flex flex-col items-center w-12">
                      <span className="text-[10px] text-gray-400">{fixture.time}</span>
                      <div className="flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-red-400">LIVE</span>
                      </div>
                    </div>

                    {/* Teams with Scores - Prominent */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold truncate">{fixture.homeTeamName}</span>
                        <span className="text-base font-bold text-white flex-shrink-0">
                          {fixture.homeScore ?? '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate">{fixture.awayTeamName}</span>
                        <span className="text-base font-bold text-white flex-shrink-0">
                          {fixture.awayScore ?? '-'}
                        </span>
                      </div>
                    </div>

                    {/* Golden Bet Badge */}
                    {fixture.golden_bet && (
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-gray-300 mb-1">No Fixtures</h3>
            <p className="text-xs text-gray-500">No matches for this date</p>
          </div>
        )}

        {/* Fixtures List - Clickable */}
        {!loading && !error && Object.keys(groupedFixtures).length > 0 && (
          <div className="space-y-3">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-gradient-to-br from-purple-950/20 to-black border border-purple-500/20 rounded-xl overflow-hidden">
                {/* League Header */}
                <div className="bg-purple-900/30 border-b border-purple-500/20 px-3 py-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-purple-300 truncate">{league}</h2>
                    <span className="text-[10px] text-purple-400 flex-shrink-0">{leagueFixtures.length}</span>
                  </div>
                </div>

                {/* Fixtures - Clickable */}
                <div className="divide-y divide-purple-500/10">
                  {leagueFixtures.map((fixture) => (
                    <button
                      key={fixture.id}
                      onClick={() => openFixtureDetail(fixture)}
                      className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-500/10 transition-all active:bg-purple-500/15 ${
                        fixture.golden_bet ? 'bg-yellow-500/5 border-l-2 border-yellow-500' : ''
                      }`}
                    >
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => toggleFavorite(fixture.id, e)}
                        className="flex-shrink-0"
                      >
                        <Star 
                          className={`w-3.5 h-3.5 transition-all ${
                            favorites.has(fixture.id) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-600 hover:text-yellow-400'
                          }`}
                        />
                      </button>

                      {/* Time */}
                      <div className="text-[10px] text-gray-400 w-10 text-left flex-shrink-0">
                        {fixture.time}
                      </div>

                      {/* Teams with Scores */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold truncate">{fixture.homeTeamName}</span>
                          {(fixture.homeScore !== null && fixture.homeScore !== undefined) && (
                            <span className="text-sm font-bold text-purple-400 flex-shrink-0">{fixture.homeScore}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold truncate">{fixture.awayTeamName}</span>
                          {(fixture.awayScore !== null && fixture.awayScore !== undefined) && (
                            <span className="text-sm font-bold text-purple-400 flex-shrink-0">{fixture.awayScore}</span>
                          )}
                        </div>
                      </div>

                      {/* Golden Bet Badge */}
                      {fixture.golden_bet && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Detail Drawer */}
      <MatchDetailDrawer
        fixture={selectedFixture}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />

      {/* Hide scrollbar for date selector */}
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
}
