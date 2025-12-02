import React, { useState } from "react";
import dayjs from "dayjs";
import {
  useFixtureH2H,
  useFixtureStats,
  useFixtureOdds,
  useFixtureLive,
  useLeagueStandings,
} from "../../hooks/useFixtureDetails";
import MatchStats from "./tabs/MatchStats";
import MatchH2H from "./tabs/MatchH2H";
import MatchOdds from "./tabs/MatchOdds";
import MatchStandings from "./tabs/MatchStandings";

interface FixtureTeam {
  id: number;
  name: string;
  logo?: string;
}

interface FixtureLeague {
  id: number;
  name: string;
  country?: string;
  season: number;
}

export interface FixtureSummary {
  id: number;
  date: string;
  status: string;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
  league: FixtureLeague;
}

type TabId = "odds" | "stats" | "h2h" | "standings";

const countryFlag = (c?: string) => {
  if (!c) return "🌍";
  const map: Record<string, string> = {
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Netherlands: "🇳🇱",
    Portugal: "🇵🇹",
    Brazil: "🇧🇷",
    Argentina: "🇦🇷",
  };
  return map[c] || "🌍";
};

const FixtureDetails = ({ fixture }: { fixture: FixtureSummary }) => {
  const [tab, setTab] = useState<TabId>("odds");

  const { data: h2h } = useFixtureH2H(fixture.id);
  const { data: stats } = useFixtureStats(fixture.id);
  const { data: odds } = useFixtureOdds(fixture.id);
  const { data: live } = useFixtureLive(fixture.id);
  const { data: standings } = useLeagueStandings(
    fixture.league.id,
    fixture.league.season
  );

  const kickoff = dayjs(fixture.date).format("HH:mm");

  // Prepare fixture data for tabs
  const fixtureData = {
    id: fixture.id,
    fixtureId: fixture.id,
    homeTeamId: fixture.homeTeam.id,
    awayTeamId: fixture.awayTeam.id,
    homeTeamName: fixture.homeTeam.name,
    awayTeamName: fixture.awayTeam.name,
    homeTeam: fixture.homeTeam.name,
    awayTeam: fixture.awayTeam.name,
    leagueId: fixture.league.id,
    leagueName: fixture.league.name,
    league: fixture.league.name,
    season: fixture.league.season,
    odds: odds?.data?.odds,
    aiBets: odds?.data?.aiBets,
  };

  return (
    <div className="text-white flex flex-col gap-4 bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950 z-10 p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-sm">
            {countryFlag(fixture.league.country)} {fixture.league.name} •{" "}
            {fixture.league.season}
          </div>
          <div className="font-mono">{kickoff}</div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {fixture.homeTeam.logo && (
                <img
                  src={fixture.homeTeam.logo}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-semibold">{fixture.homeTeam.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {fixture.awayTeam.logo && (
                <img
                  src={fixture.awayTeam.logo}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-semibold">{fixture.awayTeam.name}</span>
            </div>
          </div>

          <div className="text-4xl font-bold text-center">
            {live?.fixture?.response?.[0]?.goals?.home ?? "-"} :{" "}
            {live?.fixture?.response?.[0]?.goals?.away ?? "-"}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {[
            { id: "odds", label: "Golden Bets" },
            { id: "stats", label: "Stats" },
            { id: "h2h", label: "H2H" },
            { id: "standings", label: "League" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-purple-700 shadow-lg shadow-purple-500/50"
                  : "bg-purple-900/40 hover:bg-purple-800/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {tab === "odds" && <MatchOdds fixture={fixtureData} />}
        {tab === "stats" && <MatchStats fixture={fixtureData} />}
        {tab === "h2h" && <MatchH2H fixture={fixtureData} />}
        {tab === "standings" && (
          <MatchStandings
            fixture={fixtureData}
            standings={standings?.data}
          />
        )}
      </div>
    </div>
  );
};

export default FixtureDetails;
