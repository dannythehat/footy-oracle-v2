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

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "livepitch", label: "Live Pitch" },
  { key: "stats", label: "Stats" },
  { key: "events", label: "Events" },
  { key: "timeline", label: "Timeline" },
  { key: "h2h", label: "H2H" },
  { key: "standings", label: "Standings" }
];

  if (isLive) {
    baseTabs.push({ key: "livepitch", label: "🔥 Live Pitch" });
  }

  const tabs = [
    ...baseTabs,
    { key: "stats", label: "Stats" },
    { key: "events", label: "Events" },
    { key: "timeline", label: "Timeline" },
    { key: "h2h", label: "H2H" },
    { key: "standings", label: "Table" },
  ];

  // Extract team names for components
  const homeTeamName = fixture?.homeTeam || fixture?.homeTeamName || "Home";
  const awayTeamName = fixture?.awayTeam || fixture?.awayTeamName || "Away";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixtures
        </button>

        {/* Match Header */}
        <MatchHeader fixture={fixture} />

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? "bg-purple-600 text-white border border-purple-500 shadow-lg shadow-purple-500/50"
                  : t.key === "livepitch"
                  ? "bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30 hover:text-red-300 animate-pulse"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <MatchStats 
                stats={stats ?? []} 
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
              />
              <MatchEvents 
                events={events ?? []} 
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
              stats={stats ?? []} 
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}

          {activeTab === "events" && (
            <MatchEvents 
              events={events ?? []} 
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
            />
          )}

          {activeTab === "timeline" && (
            <MatchTimeline
              events={events ?? []}
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






