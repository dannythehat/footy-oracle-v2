import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle, Radio, Star
} from 'lucide-react';
import { fixturesApi } from '../services/api';
import MatchDetailDrawer from './fixtures/MatchDetailDrawer';
import { FavoriteButton } from './FavoriteButton';
import LiveMatchStats from './LiveMatchStats';
import { LeagueLogo } from './LeagueLogo';
import { TeamLogo } from './TeamLogo';
import { useFavoriteLeagues } from '../hooks/useFavoriteLeagues';

interface Fixture {
  fixtureId: string;
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName?: string;
  awayTeamName?: string;
  kickoff?: string;
  date?: string;
  time?: string;
  league: string;
  leagueName?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  leagueId?: number;
  season?: number;
  country?: string;
  status?: string;
  statusShort?: string;
  elapsed?: number;
  homeScore?: number;
  awayScore?: number;
  score?: {
    home: number;
    away: number;
  };
  odds?: any;
  aiBets?: any;
}

interface GroupedFixtures {
  [league: string]: Fixture[];
}

interface FixturesViewProps {
  onClose?: () => void;
  embedded?: boolean;
}

const FixturesView: React.FC<FixturesViewProps> = ({ onClose, embedded = false }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  const [expandedLiveLeagues, setExpandedLiveLeagues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Match Detail Drawer State
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isMatchDetailOpen, setIsMatchDetailOpen] = useState(false);

  // Favorite Leagues Hook
  const { isFavoriteLeague, toggleFavoriteLeague } = useFavoriteLeagues();

  // Helper function to format league name with country
  const formatLeagueName = (fixture: Fixture): string => {
    const league = fixture.league || fixture.leagueName || 'Unknown League';
    const country = fixture.country;
    
    // If country exists and is not already in the league name, prepend it
    if (country && !league.toLowerCase().includes(country.toLowerCase())) {
      return `${country}: ${league}`;
    }
    
    return league;
  };

  // Generate date range: 7 days past, today, 7 days future
  const generateDateRange = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    // 7 days in the past
    for (let i = 7; i > 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    // Today
    dates.push(new Date(today));
    
    // 7 days in the future
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const dateRange = generateDateRange();

  useEffect(() => {
    fetchFixtures(true);
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => fetchFixtures(false), 30000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const fetchFixtures = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Refresh scores from API-Football BEFORE fetching from database
      try {
        await fixturesApi.refreshScores(dateStr);
      } catch (refreshError) {
        console.warn('Score refresh failed (continuing with cached data):', refreshError);
      }
      
      const response = await fixturesApi.getByDate(dateStr);
      
      // FIX: response is already the data array (extracted by API service)
      if (response && Array.isArray(response)) {
        setFixtures(response);
        
        // Auto-expand all regular leagues on first load
        if (expandedLeagues.size === 0) {
          const leagues = new Set<string>(
            response
              .map((f: Fixture) => formatLeagueName(f))
              .filter((league: string | undefined): league is string => Boolean(league))
          );
          setExpandedLeagues(leagues);
        }
        
        // Auto-expand all live leagues
        const liveFixtures = response.filter(isLive);
        const liveLeagues = new Set<string>(
          liveFixtures
            .map((f: Fixture) => formatLeagueName(f))
            .filter((league: string | undefined): league is string => Boolean(league))
        );
        setExpandedLiveLeagues(liveLeagues);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setError(err.message || 'Failed to load fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleLeague = (league: string) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLeagues(newExpanded);
  };

  const toggleLiveLeague = (league: string) => {
    const newExpanded = new Set(expandedLiveLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLiveLeagues(newExpanded);
  };

  const handleLeagueFavoriteClick = (e: React.MouseEvent, league: string, country?: string) => {
    e.stopPropagation();
    toggleFavoriteLeague({ leagueName: league, country });
  };

  const handleFixtureClick = async (fixture: Fixture) => {
    try {
      const fixtureId = Number(fixture.id || fixture.fixtureId);
      
      // Validate fixtureId before making API call
      if (!fixtureId || isNaN(fixtureId)) {
        console.error('❌ Invalid fixture ID:', fixture);
        console.error('Fixture data:', JSON.stringify(fixture, null, 2));
        return;
      }

      console.log('✅ Fetching complete data for fixture:', fixtureId);
      
      // Use getComplete to get fixture + stats + events + h2h + standings
      const response = await fixturesApi.getComplete(fixtureId);
      
      // Extract the actual fixture data
      const fixtureData = response?.data || response;
      
      // Ensure required fields exist for MatchDetailDrawer
      const validatedData = {
        ...fixtureData,
        fixtureId: fixtureData.fixtureId || fixtureData.id || fixtureId,
        id: fixtureData.id || fixtureData.fixtureId || fixtureId,
        // Preserve original fixture data as fallback
        homeTeam: fixtureData.homeTeam || fixture.homeTeam,
        awayTeam: fixtureData.awayTeam || fixture.awayTeam,
        homeTeamId: fixtureData.homeTeamId || fixture.homeTeamId,
        awayTeamId: fixtureData.awayTeamId || fixture.awayTeamId,
        league: fixtureData.league || fixture.league,
        leagueId: fixtureData.leagueId || fixture.leagueId,
      };

      console.log('✅ Validated fixture data:', {
        fixtureId: validatedData.fixtureId,
        id: validatedData.id,
        homeTeam: validatedData.homeTeam,
        awayTeam: validatedData.awayTeam
      });
      
      // CRITICAL: Set fixture data FIRST, then open drawer
      setSelectedFixture(validatedData);
      setIsMatchDetailOpen(true);
    } catch (err) {
      console.error('❌ Error fetching complete fixture details:', err);
      
      // Even on error, ensure fixture has required fields
      const fallbackData = {
        ...fixture,
        fixtureId: fixture.fixtureId || fixture.id || Number(fixture.id || fixture.fixtureId),
        id: fixture.id || fixture.fixtureId || Number(fixture.id || fixture.fixtureId),
      };
      
      console.log('⚠️ Using fallback fixture data:', {
        fixtureId: fallbackData.fixtureId,
        id: fallbackData.id
      });
      
      setSelectedFixture(fallbackData);
      setIsMatchDetailOpen(true);
    }
  };

  const closeMatchDetail = () => {
    setIsMatchDetailOpen(false);
    setTimeout(() => setSelectedFixture(null), 300);
  };

  const isLive = (fixture: Fixture): boolean => {
    const status = fixture.status;
    const statusShort = fixture.statusShort;
    return status === 'live' || ['1H', '2H', 'ET', 'BT', 'P', 'HT'].includes(statusShort || '');
  };

  // Get live fixtures
  const liveFixtures = fixtures.filter(isLive);

  // Group live fixtures by league (with country)
  const groupedLiveFixtures: GroupedFixtures = liveFixtures.reduce((acc, fixture) => {
    const league = formatLeagueName(fixture);
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  // Get non-live fixtures
  const nonLiveFixtures = fixtures.filter(f => !isLive(f));

  // Group non-live fixtures by league (with country)
  const groupedFixtures: GroupedFixtures = nonLiveFixtures.reduce((acc, fixture) => {
    const league = formatLeagueName(fixture);
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  // Sort leagues: favorites first, then alphabetically
  const sortLeagues = (leagues: string[]): string[] => {
    return leagues.sort((a, b) => {
      const aIsFavorite = isFavoriteLeague(a);
      const bIsFavorite = isFavoriteLeague(b);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.localeCompare(b);
    });
  };

  const sortedLiveLeagues = sortLeagues(Object.keys(groupedLiveFixtures));
  const sortedLeagues = sortLeagues(Object.keys(groupedFixtures));

  const formatDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return 'TODAY';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (compareDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-GB', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const renderFixtureRow = (fixture: Fixture) => {
    const homeTeam = fixture.homeTeam || fixture.homeTeamName || 'TBD';
    const awayTeam = fixture.awayTeam || fixture.awayTeamName || 'TBD';
    const time = fixture.kickoff || fixture.date || fixture.time;
    const homeScore = fixture.homeScore ?? fixture.score?.home;
    const awayScore = fixture.awayScore ?? fixture.score?.away;
    const live = isLive(fixture);

    return (
      <div
        key={fixture.fixtureId || fixture.id}
        onClick={() => handleFixtureClick(fixture)}
        className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 sm:p-3 hover:border-purple-500/50 transition-all cursor-pointer active:bg-gray-900/50"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Time/Status */}
          <div className="flex-shrink-0 w-12 sm:w-14 text-center">
            {live ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold text-red-500">LIVE</span>
                </div>
                {fixture.elapsed && (
                  <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{fixture.elapsed}'</span>
                )}
              </div>
            ) : homeScore !== undefined && awayScore !== undefined ? (
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">FT</span>
            ) : (
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {time ? formatTime(time) : 'TBD'}
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Home Team */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TeamLogo 
                teamId={fixture.homeTeamId} 
                teamName={homeTeam}
                size="sm"
              />
              <span className="text-xs sm:text-sm text-white truncate flex-1">{homeTeam}</span>
              {(homeScore !== undefined || live) && (
                <span className="text-xs sm:text-sm font-bold text-white w-5 text-right">
                  {homeScore ?? '-'}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TeamLogo 
                teamId={fixture.awayTeamId} 
                teamName={awayTeam}
                size="sm"
              />
              <span className="text-xs sm:text-sm text-white truncate flex-1">{awayTeam}</span>
              {(awayScore !== undefined || live) && (
                <span className="text-xs sm:text-sm font-bold text-white w-5 text-right">
                  {awayScore ?? '-'}
                </span>
              )}
            </div>
          </div>

          {/* Favorite Button */}
          <div className="flex-shrink-0">
            <FavoriteButton
              fixtureId={Number(fixture.id || fixture.fixtureId)}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              date={fixture.date || fixture.kickoff || ''}
              league={fixture.league || fixture.leagueName || ''}
              size="sm"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              <h1 className="text-lg sm:text-xl font-bold">Fixtures</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded transition-colors ${
                  autoRefresh 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-gray-800 text-gray-500'
                }`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Manual refresh */}
              <button
                onClick={() => fetchFixtures(false)}
                disabled={refreshing}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Date Selector - Horizontal Scroll */}
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              {dateRange.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : isToday
                        ? 'bg-gray-800 text-purple-400 border border-purple-500/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-[10px] opacity-75">
                        {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </div>
                      <div className="font-bold">
                        {date.getDate()}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-800 border-t-purple-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-400 mb-1">Error Loading Fixtures</div>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No fixtures found for {formatDate(selectedDate)}</p>
          </div>
        )}

        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-6">
            {/* LIVE NOW Section */}
            {sortedLiveLeagues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-red-500 uppercase tracking-wide">
                    LIVE NOW
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
                </div>

                {sortedLiveLeagues.map((league) => {
                  const leagueFixtures = groupedLiveFixtures[league];
                  const isExpanded = expandedLiveLeagues.has(league);
                  const firstFixture = leagueFixtures[0];

                  return (
                    <div key={league} className="space-y-2">
                      {/* League Header */}
                      <button
                        onClick={() => toggleLiveLeague(league)}
                        className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-red-950/30 to-transparent border-l-2 border-red-500 rounded hover:from-red-950/50 transition-all"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <LeagueLogo 
                            leagueId={firstFixture.leagueId}
                            leagueName={league}
                            size="sm"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-white truncate">
                            {league}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                            ({leagueFixtures.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => handleLeagueFavoriteClick(e, league, firstFixture.country)}
                            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                isFavoriteLeague(league)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {/* League Fixtures */}
                      {isExpanded && (
                        <div className="space-y-1.5 pl-2">
                          {leagueFixtures.map(renderFixtureRow)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Regular Fixtures */}
            {sortedLeagues.length > 0 && (
              <div className="space-y-3">
                {sortedLiveLeagues.length > 0 && (
                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                      Scheduled
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-transparent" />
                  </div>
                )}

                {sortedLeagues.map((league) => {
                  const leagueFixtures = groupedFixtures[league];
                  const isExpanded = expandedLeagues.has(league);
                  const firstFixture = leagueFixtures[0];

                  return (
                    <div key={league} className="space-y-2">
                      {/* League Header */}
                      <button
                        onClick={() => toggleLeague(league)}
                        className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-[#0f0f0f] border border-gray-800 rounded hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <LeagueLogo 
                            leagueId={firstFixture.leagueId}
                            leagueName={league}
                            size="sm"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-white truncate">
                            {league}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                            ({leagueFixtures.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => handleLeagueFavoriteClick(e, league, firstFixture.country)}
                            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                isFavoriteLeague(league)
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-500'
                              }`}
                            />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {/* League Fixtures */}
                      {isExpanded && (
                        <div className="space-y-1.5 pl-2">
                          {leagueFixtures.map(renderFixtureRow)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Detail Drawer */}
      <MatchDetailDrawer
        fixture={selectedFixture}
        isOpen={isMatchDetailOpen}
        onClose={closeMatchDetail}
      />
    </div>
  );
};

export default FixturesView;
