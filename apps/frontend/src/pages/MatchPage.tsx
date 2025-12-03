import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fixturesApi } from "../services/api";
import MatchHeader from "../components/match/MatchHeader";
import MatchStats from "../components/match/MatchStats";
import MatchEvents from "../components/match/MatchEvents";
import MatchTimeline from "../components/match/MatchTimeline";
import MatchH2H from "../components/match/MatchH2H";
import MatchStandings from "../components/match/MatchStandings";

type TabKey = "overview" | "stats" | "events" | "h2h" | "standings" | "timeline";

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

        // Get base fixture data
        const base = await fixturesApi.getById(id);
        setFixture(base);

        // Get events and stats in parallel
        const [ev, st] = await Promise.all([
          fixturesApi.getEvents(id).catch(() => []),
          fixturesApi.getStats(id).catch(() => []),
        ]);

        setEvents(ev || []);
        setStats(st || []);

        // Get H2H if we have team IDs
        if (base?.homeTeamId && base?.awayTeamId) {
          const h2hData = await fixturesApi.getH2H(base.homeTeamId, base.awayTeamId).catch(() => null);
          setH2h(h2hData);
        }

        // Get standings if we have league and season
        if (base?.leagueId && base?.season) {
          const table = await fixturesApi.getStandings(base.leagueId, base.season).catch(() => null);
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
      <div
        style={{
          padding: "20px",
          background: "#020617",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        Loading match...
      </div>
    );
  }

  if (!fixture) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#020617",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        Match not found.
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "stats", label: "Stats" },
    { key: "events", label: "Events" },
    { key: "timeline", label: "Timeline" },
    { key: "h2h", label: "H2H" },
    { key: "standings", label: "Table" },
  ];

  return (
    <div
      style={{
        padding: "20px",
        background: "#020617",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "10px",
          background: "transparent",
          border: "none",
          color: "#9ca3af",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        ← Back to Fixtures
      </button>

      <MatchHeader fixture={fixture} />

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border:
                activeTab === t.key
                  ? "1px solid #22c55e"
                  : "1px solid #1f2937",
              background:
                activeTab === t.key ? "#16a34a33" : "transparent",
              color: "#e5e7eb",
              fontSize: "12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <div>
          <MatchStats stats={stats ?? []} />
          <MatchEvents events={events ?? []} />
        </div>
      )}

      {activeTab === "stats" && <MatchStats stats={stats ?? []} />}

      {activeTab === "events" && <MatchEvents events={events ?? []} />}

      {activeTab === "timeline" && (
        <MatchTimeline
          events={events ?? []}
          homeTeam={fixture?.homeTeam || fixture?.homeTeamName || "Home"}
          awayTeam={fixture?.awayTeam || fixture?.awayTeamName || "Away"}
        />
      )}

      {activeTab === "h2h" && <MatchH2H h2h={h2h} />}

      {activeTab === "standings" && (
        <MatchStandings
          league={fixture?.league || fixture?.leagueName}
          season={fixture?.season}
          standings={standings}
          homeTeam={fixture?.homeTeam || fixture?.homeTeamName}
          awayTeam={fixture?.awayTeam || fixture?.awayTeamName}
        />
      )}
    </div>
  );
}
