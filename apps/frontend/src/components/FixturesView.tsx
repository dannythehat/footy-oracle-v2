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
      
      // Use getComplete to get fixture + stats + events + h2h + standings
      const response = await fixturesApi.getComplete(fixtureId);
      
      // Extract the actual fixture data
      const fixtureData = response?.data || response;
      
      if (fixtureData && (fixtureData.fixtureId || fixtureData.id)) {
        // CRITICAL: Set fixture data FIRST, then open drawer
        setSelectedFixture(fixtureData);
        setIsMatchDetailOpen(true);
      } else {
        setSelectedFixture(fixture);
        setIsMatchDetailOpen(true);
      }
    } catch (err) {
      console.error('Error fetching complete fixture details:', err);
      // Even on error, set the fixture first, then open
      setSelectedFixture(fixture);
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

    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (fixture: Fixture): string => {
    // If match is live, show status
    if (isLive(fixture)) {
      const elapsed = fixture.elapsed;
      const statusShort = fixture.statusShort;
      
      if (statusShort === 'HT') return 'HT';
      if (statusShort === 'ET') return `ET ${elapsed}'`;
      if (statusShort === 'BT') return 'Break';
      if (statusShort === 'P') return 'Penalties';
      if (elapsed) return `${elapsed}'`;
      return 'LIVE';
    }

    // If match is finished, show FT
    if (fixture.statusShort === 'FT' || fixture.status === 'finished') {
      return 'FT';
    }

    // Otherwise show kickoff time
    const timeStr = fixture.time || fixture.kickoff;
    if (!timeStr) return 'TBD';

    try {
      // Handle ISO format
      if (timeStr.includes('T')) {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Handle HH:MM format
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  const getScore = (fixture: Fixture): { home: number | string; away: number | string } => {
    if (fixture.score) {
      return {
        home: fixture.score.home ?? '-',
        away: fixture.score.away ?? '-'
      };
    }
    
    if (fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
      return {
        home: fixture.homeScore,
        away: fixture.awayScore
      };
    }

    return { home: '-', away: '-' };
  };

  const renderFixture = (fixture: Fixture) => {
    const score = getScore(fixture);
    const live = isLive(fixture);
    const finished = fixture.statusShort === 'FT' || fixture.status === 'finished';

    return (
      <div
        key={fixture.id || fixture.fixtureId}
        onClick={() => handleFixtureClick(fixture)}
        className="bg-gray-800/40 rounded-lg p-3 hover:bg-gray-700/50 transition-all cursor-pointer border border-gray-700/50 hover:border-purple-500/30"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Time/Status */}
          <div className="flex-shrink-0 w-16 text-center">
            <div className={`text-sm font-medium ${
              live ? 'text-red-400 animate-pulse' : 
              finished ? 'text-gray-400' : 
              'text-purple-400'
            }`}>
              {formatTime(fixture)}
            </div>
            {live && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            )}
          </div>

          {/* Teams and Score */}
          <div className="flex-1 min-w-0">
            {/* Home Team */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamLogo 
                  teamId={fixture.homeTeamId} 
                  teamName={fixture.homeTeam || fixture.homeTeamName || ''} 
                  size="sm"
                />
                <span className="text-sm font-medium text-white truncate">
                  {fixture.homeTeam || fixture.homeTeamName}
                </span>
              </div>
              <span className={`text-base font-bold ${
                live ? 'text-white' : 
                finished ? 'text-gray-300' : 
                'text-gray-500'
              }`}>
                {score.home}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamLogo 
                  teamId={fixture.awayTeamId} 
                  teamName={fixture.awayTeam || fixture.awayTeamName || ''} 
                  size="sm"
                />
                <span className="text-sm font-medium text-white truncate">
                  {fixture.awayTeam || fixture.awayTeamName}
                </span>
              </div>
              <span className={`text-base font-bold ${
                live ? 'text-white' : 
                finished ? 'text-gray-300' : 
                'text-gray-500'
              }`}>
                {score.away}
              </span>
            </div>
          </div>

          {/* Favorite Button */}
          <div className="flex-shrink-0">
            <FavoriteButton 
              fixtureId={fixture.id || fixture.fixtureId}
              size="sm"
            />
          </div>
        </div>

        {/* Live Stats Preview */}
        {live && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <LiveMatchStats 
              fixtureId={Number(fixture.id || fixture.fixtureId)} 
              compact={true}
            />
          </div>
        )}
      </div>
    );
  };

  const renderLeagueSection = (league: string, fixtures: Fixture[], isLiveSection: boolean = false) => {
    const isExpanded = isLiveSection ? expandedLiveLeagues.has(league) : expandedLeagues.has(league);
    const toggleFunc = isLiveSection ? toggleLiveLeague : toggleLeague;
    const isFavorite = isFavoriteLeague(league);

    // Extract country from formatted league name
    const [country, leagueName] = league.includes(': ') 
      ? league.split(': ') 
      : [undefined, league];

    // Get league ID from first fixture
    const leagueId = fixtures[0]?.leagueId;

    return (
      <div key={league} className="mb-4">
        <button
          onClick={() => toggleFunc(league)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
            isLiveSection 
              ? 'bg-gradient-to-r from-red-900/20 to-purple-900/20 hover:from-red-900/30 hover:to-purple-900/30 border border-red-500/20' 
              : 'bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <LeagueLogo 
              leagueId={leagueId} 
              leagueName={leagueName || league} 
              size="sm"
            />
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${
                isLiveSection ? 'text-red-400' : 'text-purple-400'
              }`}>
                {league}
              </span>
              {isFavorite && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            <span className="text-sm text-gray-400">
              ({fixtures.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleLeagueFavoriteClick(e, leagueName || league, country)}
              className="p-1 hover:bg-gray-700/50 rounded transition-colors"
            >
              <Star 
                className={`w-5 h-5 ${
                  isFavorite 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-500 hover:text-yellow-400'
                }`}
              />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            {fixtures.map(renderFixture)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading fixtures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchFixtures(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Fixtures</h2>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            autoRefresh 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-purple-400" />
          </button>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              formatDate(selectedDate) === 'TODAY' 
                ? 'text-purple-400 text-xl' 
                : 'text-white'
            }`}>
              {formatDate(selectedDate)}
            </div>
            <div className="text-sm text-gray-400">
              {selectedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-purple-400" />
          </button>
        </div>

        {/* Date Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dateRange.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : isToday
                    ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-xs opacity-75">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="font-bold">
                  {date.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Fixtures Section */}
      {liveFixtures.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="text-xl font-bold text-red-400">LIVE NOW</h3>
            <span className="text-sm text-gray-400">({liveFixtures.length})</span>
          </div>
          
          <div className="space-y-3">
            {sortedLiveLeagues.map(league => 
              renderLeagueSection(league, groupedLiveFixtures[league], true)
            )}
          </div>
        </div>
      )}

      {/* Regular Fixtures Section */}
      {nonLiveFixtures.length > 0 ? (
        <div className="space-y-4">
          {liveFixtures.length > 0 && (
            <div className="border-t border-gray-700/50 pt-4">
              <h3 className="text-xl font-bold text-purple-400 mb-4">
                All Fixtures ({nonLiveFixtures.length})
              </h3>
            </div>
          )}
          
          <div className="space-y-3">
            {sortedLeagues.map(league => 
              renderLeagueSection(league, groupedFixtures[league], false)
            )}
          </div>
        </div>
      ) : liveFixtures.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No fixtures for this date</p>
        </div>
      )}

      {/* Match Detail Drawer */}
      <MatchDetailDrawer
        isOpen={isMatchDetailOpen}
        onClose={closeMatchDetail}
        fixture={selectedFixture}
      />
    </div>
  );
};

export default FixturesView;