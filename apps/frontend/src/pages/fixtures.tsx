import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  TrendingUp, 
  Calendar,
  Radio,
  BarChart3,
  Users,
  History,
  ArrowLeft,
  Trophy
} from 'lucide-react';
import { fixturesApi } from '../services/api';

interface Fixture {
  fixture_id: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  league: string;
  status?: string;
  home_team_id?: number;
  away_team_id?: number;
  league_id?: number;
  season?: number;
  home_score?: number | null;
  away_score?: number | null;
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

interface TeamStats {
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  failedToScore: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bttsPercentage: number;
  over25Percentage: number;
}

interface H2HData {
  played: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  lastMeetings: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    league: string;
  }>;
}

interface FixtureStats {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  h2h: H2HData;
}

type TabType = 'today' | 'tomorrow' | 'results';
type StatsTabType = 'markets' | 'h2h' | 'stats' | 'form';

export default function FixturesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTabType>('markets');
  const [fixtureStats, setFixtureStats] = useState<Record<string, FixtureStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFixtures();
  }, [activeTab]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const today = new Date();
      let targetDate: Date;

      if (activeTab === 'today') {
        targetDate = today;
      } else if (activeTab === 'tomorrow') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
      } else {
        // Results - yesterday
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
      }

      const dateStr = targetDate.toISOString().split('T')[0];
      const response = await fixturesApi.getByDate(dateStr);

      if (response && response.data) {
        setFixtures(response.data);
      } else {
        setFixtures([]);
      }
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (kickoff: string) => {
    return new Date(kickoff).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isLive = (status?: string) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('live') || s.includes('1h') || s.includes('2h');
  };

  const isFinished = (status?: string) => {
    if (!status) return false;
    return status.toLowerCase().includes('ft');
  };

  const toggleFixture = async (fixtureId: string) => {
    if (expandedFixture === fixtureId) {
      setExpandedFixture(null);
      setActiveStatsTab('markets');
    } else {
      setExpandedFixture(fixtureId);
      setActiveStatsTab('markets');
      
      if (!fixtureStats[fixtureId]) {
        await loadFixtureStats(fixtureId);
      }
    }
  };

  const loadFixtureStats = async (fixtureId: string) => {
    const fixture = fixtures.find(f => f.fixture_id === fixtureId);
    if (!fixture) return;

    setLoadingStats(prev => ({ ...prev, [fixtureId]: true }));

    try {
      // Mock stats for now - replace with real API calls
      const mockStats: FixtureStats = {
        homeTeam: {
          form: 'WWDWL',
          goalsFor: 28,
          goalsAgainst: 12,
          cleanSheets: 6,
          failedToScore: 2,
          avgGoalsScored: 2.3,
          avgGoalsConceded: 1.0,
          bttsPercentage: 58,
          over25Percentage: 67
        },
        awayTeam: {
          form: 'WLWDW',
          goalsFor: 24,
          goalsAgainst: 15,
          cleanSheets: 4,
          failedToScore: 3,
          avgGoalsScored: 2.0,
          avgGoalsConceded: 1.3,
          bttsPercentage: 62,
          over25Percentage: 58
        },
        h2h: {
          played: 10,
          homeWins: 4,
          awayWins: 3,
          draws: 3,
          lastMeetings: [
            {
              date: '2024-03-15',
              homeTeam: fixture.home_team,
              awayTeam: fixture.away_team,
              homeScore: 2,
              awayScore: 1,
              league: fixture.league
            },
            {
              date: '2023-11-20',
              homeTeam: fixture.away_team,
              awayTeam: fixture.home_team,
              homeScore: 1,
              awayScore: 1,
              league: fixture.league
            }
          ]
        }
      };

      setFixtureStats(prev => ({ ...prev, [fixtureId]: mockStats }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(prev => ({ ...prev, [fixtureId]: false }));
    }
  };

  const renderFormBadge = (result: string) => {
    const colors = {
      W: 'bg-green-500/20 text-green-400 border-green-500/30',
      D: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      L: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`inline-block w-7 h-7 text-xs font-bold rounded border ${colors[result as keyof typeof colors]} flex items-center justify-center`}>
        {result}
      </span>
    );
  };

  const calculateMarkupValue = (probability: number, odds: number) => {
    const impliedProbability = 1 / odds;
    return ((probability - impliedProbability) / impliedProbability) * 100;
  };

  // Group fixtures by league
  const groupedFixtures = useMemo(() => {
    const filtered = fixtures.filter(fixture => {
      const matchesSearch = searchQuery === '' || 
        fixture.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fixture.away_team.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLeague = selectedLeague === 'all' || fixture.league === selectedLeague;
      
      return matchesSearch && matchesLeague;
    });

    const grouped: Record<string, Fixture[]> = {};
    filtered.forEach(fixture => {
      if (!grouped[fixture.league]) {
        grouped[fixture.league] = [];
      }
      grouped[fixture.league].push(fixture);
    });

    // Sort fixtures within each league by kickoff time
    Object.keys(grouped).forEach(league => {
      grouped[league].sort((a, b) => 
        new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      );
    });

    return grouped;
  }, [fixtures, searchQuery, selectedLeague]);

  const leagues = ['all', ...Array.from(new Set(fixtures.map(f => f.league)))];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-black border-b border-purple-500/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold">Fixtures & Results</h1>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('tomorrow')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'tomorrow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'results'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              Results
            </button>
          </div>

          {/* Search & Filter */}
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
                className="pl-10 pr-8 py-2 bg-black/40 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500/50 text-white appearance-none cursor-pointer min-w-[200px]"
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
      </div>

      {/* Fixtures List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading fixtures...</div>
          </div>
        ) : Object.keys(groupedFixtures).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No fixtures found
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-gradient-to-br from-purple-950/20 to-black border border-purple-500/20 rounded-2xl overflow-hidden">
                {/* League Header */}
                <div className="bg-purple-900/30 border-b border-purple-500/20 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-purple-300">{league}</h2>
                    <span className="text-sm text-purple-400">{leagueFixtures.length} matches</span>
                  </div>
                </div>

                {/* Fixtures */}
                <div className="divide-y divide-purple-500/10">
                  {leagueFixtures.map((fixture) => (
                    <div key={fixture.fixture_id} className="transition-all">
                      {/* Fixture Row */}
                      <button
                        onClick={() => toggleFixture(fixture.fixture_id)}
                        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-purple-500/5 transition-all ${
                          fixture.golden_bet ? 'bg-yellow-500/5 border-l-4 border-yellow-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-6 flex-1">
                          {/* Time */}
                          <div className="text-sm text-gray-400 w-16 text-left">
                            {formatTime(fixture.kickoff)}
                          </div>

                          {/* Live Indicator */}
                          {isLive(fixture.status) && (
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                              <span className="text-xs font-bold text-red-400">LIVE</span>
                            </div>
                          )}

                          {/* Teams */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              {fixture.golden_bet && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">
                                  <Trophy className="w-3 h-3 text-yellow-400" />
                                  <span className="text-xs font-semibold text-yellow-400">Golden Bet</span>
                                </div>
                              )}
                            </div>
                            <div className="font-semibold">
                              {fixture.home_team} vs {fixture.away_team}
                            </div>
                          </div>

                          {/* Score */}
                          {(fixture.home_score !== null && fixture.home_score !== undefined) && (
                            <div className="text-lg font-bold text-purple-300 w-20 text-center">
                              {fixture.home_score} : {fixture.away_score}
                            </div>
                          )}
                        </div>

                        {expandedFixture === fixture.fixture_id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 ml-4" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 ml-4" />
                        )}
                      </button>

                      {/* Expanded Stats Panel */}
                      {expandedFixture === fixture.fixture_id && (
                        <div className="bg-black/40 border-t border-purple-500/10 animate-slide-down">
                          {/* Stats Tabs */}
                          <div className="flex items-center gap-2 px-6 py-3 border-b border-purple-500/10 overflow-x-auto">
                            <button
                              onClick={() => setActiveStatsTab('markets')}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                                activeStatsTab === 'markets'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
                              }`}
                            >
                              <BarChart3 className="w-4 h-4 inline-block mr-2" />
                              Markets
                            </button>
                            <button
                              onClick={() => setActiveStatsTab('h2h')}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                                activeStatsTab === 'h2h'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
                              }`}
                            >
                              <Users className="w-4 h-4 inline-block mr-2" />
                              H2H
                            </button>
                            <button
                              onClick={() => setActiveStatsTab('stats')}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                                activeStatsTab === 'stats'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
                              }`}
                            >
                              <TrendingUp className="w-4 h-4 inline-block mr-2" />
                              Team Stats
                            </button>
                            <button
                              onClick={() => setActiveStatsTab('form')}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                                activeStatsTab === 'form'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
                              }`}
                            >
                              <History className="w-4 h-4 inline-block mr-2" />
                              Form
                            </button>
                          </div>

                          {/* Stats Content */}
                          <div className="p-6">
                            {loadingStats[fixture.fixture_id] ? (
                              <div className="text-center py-8 text-gray-400">Loading stats...</div>
                            ) : (
                              <>
                                {/* Markets Tab */}
                                {activeStatsTab === 'markets' && fixture.predictions && fixture.odds && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(fixture.predictions).map(([market, probability]) => {
                                      const odds = fixture.odds?.[market as keyof typeof fixture.odds] || 0;
                                      const markup = calculateMarkupValue(probability, odds);
                                      const isValue = markup > 5;

                                      return (
                                        <div
                                          key={market}
                                          className={`p-4 rounded-lg border ${
                                            isValue
                                              ? 'bg-green-500/10 border-green-500/30'
                                              : 'bg-purple-900/20 border-purple-500/20'
                                          }`}
                                        >
                                          <div className="text-xs text-gray-400 uppercase mb-2">
                                            {market.replace(/_/g, ' ')}
                                          </div>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">AI Prob</span>
                                            <span className="text-sm font-bold text-purple-300">
                                              {(probability * 100).toFixed(0)}%
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-300">Odds</span>
                                            <span className="text-sm font-bold text-purple-300">
                                              {odds.toFixed(2)}
                                            </span>
                                          </div>
                                          {isValue && (
                                            <div className="text-xs font-semibold text-green-400 flex items-center gap-1">
                                              <TrendingUp className="w-3 h-3" />
                                              Value: +{markup.toFixed(1)}%
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* H2H Tab */}
                                {activeStatsTab === 'h2h' && fixtureStats[fixture.fixture_id]?.h2h && (
                                  <div>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                      <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <div className="text-2xl font-bold text-green-400">
                                          {fixtureStats[fixture.fixture_id].h2h.homeWins}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Home Wins</div>
                                      </div>
                                      <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="text-2xl font-bold text-yellow-400">
                                          {fixtureStats[fixture.fixture_id].h2h.draws}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Draws</div>
                                      </div>
                                      <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <div className="text-2xl font-bold text-red-400">
                                          {fixtureStats[fixture.fixture_id].h2h.awayWins}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Away Wins</div>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold text-purple-300 mb-3">Last Meetings</h4>
                                      {fixtureStats[fixture.fixture_id].h2h.lastMeetings.map((meeting, idx) => (
                                        <div key={idx} className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/10">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                              {meeting.homeTeam} vs {meeting.awayTeam}
                                            </div>
                                            <div className="text-sm font-bold text-purple-300">
                                              {meeting.homeScore} : {meeting.awayScore}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            {new Date(meeting.date).toLocaleDateString()} • {meeting.league}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Team Stats Tab */}
                                {activeStatsTab === 'stats' && fixtureStats[fixture.fixture_id] && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {/* Home Team */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-purple-300 mb-3">{fixture.home_team}</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Goals For</span>
                                          <span className="text-sm font-bold text-green-400">
                                            {fixtureStats[fixture.fixture_id].homeTeam.goalsFor}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Goals Against</span>
                                          <span className="text-sm font-bold text-red-400">
                                            {fixtureStats[fixture.fixture_id].homeTeam.goalsAgainst}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Clean Sheets</span>
                                          <span className="text-sm font-bold text-blue-400">
                                            {fixtureStats[fixture.fixture_id].homeTeam.cleanSheets}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">BTTS %</span>
                                          <span className="text-sm font-bold text-purple-300">
                                            {fixtureStats[fixture.fixture_id].homeTeam.bttsPercentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Away Team */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-purple-300 mb-3">{fixture.away_team}</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Goals For</span>
                                          <span className="text-sm font-bold text-green-400">
                                            {fixtureStats[fixture.fixture_id].awayTeam.goalsFor}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Goals Against</span>
                                          <span className="text-sm font-bold text-red-400">
                                            {fixtureStats[fixture.fixture_id].awayTeam.goalsAgainst}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">Clean Sheets</span>
                                          <span className="text-sm font-bold text-blue-400">
                                            {fixtureStats[fixture.fixture_id].awayTeam.cleanSheets}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-purple-900/20">
                                          <span className="text-sm text-gray-400">BTTS %</span>
                                          <span className="text-sm font-bold text-purple-300">
                                            {fixtureStats[fixture.fixture_id].awayTeam.bttsPercentage}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Form Tab */}
                                {activeStatsTab === 'form' && fixtureStats[fixture.fixture_id] && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="text-sm font-semibold text-purple-300 mb-3">{fixture.home_team}</h4>
                                      <div className="flex items-center gap-2">
                                        {fixtureStats[fixture.fixture_id].homeTeam.form.split('').map((result, idx) => (
                                          <div key={idx}>{renderFormBadge(result)}</div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-purple-300 mb-3">{fixture.away_team}</h4>
                                      <div className="flex items-center gap-2">
                                        {fixtureStats[fixture.fixture_id].awayTeam.form.split('').map((result, idx) => (
                                          <div key={idx}>{renderFormBadge(result)}</div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
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
      </div>
    </div>
  );
}
