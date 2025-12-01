import React, { useState } from "react";
import dayjs from "dayjs";
import {
  useFixtureH2H,
  useFixtureStats,
  useFixtureOdds,
  useFixtureLive,
  useLeagueStandings,
} from "../../hooks/useFixtureDetails";

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

type TabId = "match" | "stats" | "odds" | "h2h" | "standings";

const countryFlag = (c?: string) => {
  if (!c) return "??";
  const map: Record<string, string> = {
    England: "??",
    Scotland: "??",
    Wales: "??",
    Spain: "????",
    Italy: "????",
    Germany: "????",
    France: "????",
    Netherlands: "????",
    Portugal: "????",
    Brazil: "????",
    Argentina: "????",
  };
  return map[c] || "??";
};

const FixtureDetails = ({ fixture }: { fixture: FixtureSummary }) => {
  const [tab, setTab] = useState<TabId>("match");

  const { data: h2h } = useFixtureH2H(fixture.id);
  const { data: stats } = useFixtureStats(fixture.id);
  const { data: odds } = useFixtureOdds(fixture.id);
  const { data: live } = useFixtureLive(fixture.id);
  const { data: standings } = useLeagueStandings(
    fixture.league.id,
    fixture.league.season
  );

  const kickoff = dayjs(fixture.date).format("HH:mm");

  return (
    <div className="text-white flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-sm">
          {countryFlag(fixture.league.country)} {fixture.league.name} •{" "}
          {fixture.league.season}
        </div>
        <div className="font-mono">{kickoff}</div>
      </div>

      <div className="flex justify-between items-center">
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["match", "stats", "odds", "h2h", "standings"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as TabId)}
            className={`px-4 py-1 rounded-full text-sm ${
              tab === t ? "bg-purple-700" : "bg-purple-900/40"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-black/50 rounded-xl p-4 min-h-[220px] text-xs overflow-auto">
        {tab === "match" && <pre>{JSON.stringify(live, null, 2)}</pre>}
        {tab === "stats" && <pre>{JSON.stringify(stats, null, 2)}</pre>}
        {tab === "odds" && <pre>{JSON.stringify(odds, null, 2)}</pre>}
        {tab === "h2h" && <pre>{JSON.stringify(h2h, null, 2)}</pre>}
        {tab === "standings" && (
          <pre>{JSON.stringify(standings, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default FixtureDetails;
