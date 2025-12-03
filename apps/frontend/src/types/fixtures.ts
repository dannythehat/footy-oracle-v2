// Fixture Summary - used in lists and cards
export interface FixtureSummary {
  fixtureId: number;
  date: string;        // ISO string
  status: string;
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamId?: number;
  awayTeamId?: number;
  leagueId?: number;
  season?: number;
  country?: string;
  statusShort?: string;
  elapsed?: number;
  time?: string;
  kickoff?: string;
}

// Complete Fixture Data - used in detail views
export interface CompleteFixtureData {
  fixture?: any;
  statistics?: any[];
  events?: any[];
  h2h?: any;
  standings?: any;
}

// Match Statistics
export interface MatchStats {
  team: string;
  statistics: Array<{
    type: string;
    value: number | string;
  }>;
}

// Match Event
export interface MatchEvent {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist?: {
    id: number;
    name: string;
  };
  type: string;
  detail: string;
  comments?: string;
}

// H2H Data
export interface H2HData {
  matches: any[];
  homeWins: number;
  awayWins: number;
  draws: number;
}

// Standings Data
export interface StandingsData {
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
  standings: Array<Array<{
    rank: number;
    team: {
      id: number;
      name: string;
      logo: string;
    };
    points: number;
    played: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
    goalsDiff: number;
  }>>;
}
