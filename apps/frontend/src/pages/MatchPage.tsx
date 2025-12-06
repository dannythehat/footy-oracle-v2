import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fixturesApi } from "../services/api";
import MatchHeader from "../components/match/MatchHeader";
import MatchStats from "../components/match/MatchStats";
import MatchEvents from "../components/match/MatchEvents";
import MatchTimeline from "../components/match/MatchTimeline";
import MatchH2H from "../components/match/MatchH2H";
import MatchStandings from "../components/match/MatchStandings";
import LiveFootballPitch from "../components/match/LiveFootballPitch";
import { ArrowLeft } from "lucide-react";

type TabKey =
  | "overview"
  | "livepitch"
  | "stats"
  | "events"
  | "timeline"
  | "h2h"
  | "standings";

export default function MatchPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const navigate = useNavigate();
  const id = fixtureId ? Number(fixtureId) : undefined;

  const [fixture, setFixture] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [h2h, setH2h] = useState<any | null>(null);
  const [standings, setStandings] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    async function load() {
      try {
        setLoading(true);

        const base = await fixturesApi.getById(id);
        setFixture(base);

        const [ev, st] = await Promise.all([
          fixturesApi.getEvents(id).catch(() => []),
          fixturesApi.getStats(id).catch(() => []),
        ]);

        setEvents(ev || []);
        setStats(st || []);

        if (base?.homeTeamId && base?.awayTeamId) {
          const h2hData = await fixturesApi
            .getH2H(base.homeTeamId, base.awayTeamId)
            .catch(() => null);
          setH2h(h2hData);
        }

        if (base?.leagueId && base?.season) {
          const table = await fixturesApi
            .getStandings(base.leagueId, base.season)
            .catch(() => null);
          setStandings(table);
        }
      } catch (err) {
        console.error("MatchPage load error", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading && !fixture) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-5">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading match...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-5">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-400 text-lg">Match not found.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLive =
    fixture?.status?.short === "1H" ||
    fixture?.status?.short === "2H" ||
    fixture?.status?.short === "HT" ||
    fixture?.status?.short === "ET" ||
    fixture?.status?.short === "LIVE" ||
    fixture?.status?.long?.toLowerCase()?.includes("in play");

  const baseTabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
  ];

  if (isLive) {
    baseTabs.push({ key: "livepitch", label: "🔴 Live Pitch" });
  }

  const tabs = [
    ...baseTabs,
    { key: "stats", label: "Stats" },
    { key: "events", label: "Events" },
    { key: "timeline", label: "Timeline" },
    { key: "h2h", label: "H2H" },
    { key: "standings", label: "Table" },
  ];

  const homeTeamName = fixture?.homeTeam || fixture?.homeTeamName || "Home";
  const awayTeamName = fixture?.awayTeam || fixture?.awayTeamName || "Away";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixtures
        </button>

        <MatchHeader fixture={fixture} />

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <MatchStats
                stats={stats}
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
              />
              <MatchEvents
                events={events}
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
              />
            </div>
          )}

          {activeTab === "livepitch" && id && (
            <LiveFootballPitch
              fixtureId={id}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              initialStats={stats}
              initialEvents={events}
            />
          )}

          {activeTab === "stats" && (
            <MatchStats
              stats={stats}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}

          {activeTab === "events" && (
            <MatchEvents
              events={events}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}

          {activeTab === "timeline" && (
            <MatchTimeline
              events={events}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}

          {activeTab === "h2h" && <MatchH2H h2h={h2h} />}

          {activeTab === "standings" && (
            <MatchStandings
              league={fixture?.league || fixture?.leagueName}
              season={fixture?.season}
              standings={standings}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
