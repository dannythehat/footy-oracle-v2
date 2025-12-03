import React, { useEffect, useState } from "react";
import { fixturesApi } from "../services/api";
import MatchHeader from "../components/match/MatchHeader";
import MatchStats from "../components/match/MatchStats";
import MatchEvents from "../components/match/MatchEvents";
import MatchTimeline from "../components/match/MatchTimeline";
import MatchH2H from "../components/match/MatchH2H";
import MatchStandings from "../components/match/MatchStandings";

type TabKey = "overview" | "stats" | "events" | "h2h" | "standings" | "timeline";

export default function MatchPage() {
  const parts = window.location.pathname.split("/");
  const fixtureId = parts[parts.length - 1];

  const [fixture, setFixture] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [h2h, setH2h] = useState<any | null>(null);
  const [standings, setStandings] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!fixtureId) return;

    async function load() {
      try {
        setLoading(true);

        const base = await fixturesApi.getById(fixtureId);
        setFixture(base);

        const [ev, st, h] = await Promise.all([
          fixturesApi.getEvents(fixtureId),
          fixturesApi.getStats(fixtureId),
          fixturesApi.getH2H(fixtureId),
        ]);

        setEvents(ev || []);
        setStats(st || null);
        setH2h(h || null);

        if (base?.leagueId && base?.season) {
          const table = await fixturesApi.getStandings(
            base.leagueId,
            base.season
          );
          setStandings(table || null);
        }
      } catch (err) {
        console.error("MatchPage load error", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fixtureId]);

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
        onClick={() => (window.location.href = "/")}
        style={{
          marginBottom: "10px",
          background: "transparent",
          border: "none",
          color: "#9ca3af",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        ? Back to Fixtures
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
          <MatchStats stats={stats} />
          <MatchEvents events={events} />
        </div>
      )}

      {activeTab === "stats" && <MatchStats stats={stats} />}

      {activeTab === "events" && <MatchEvents events={events} />}

      {activeTab === "timeline" && (
        <MatchTimeline
          events={events}
          homeTeam={fixture.homeTeam}
          awayTeam={fixture.awayTeam}
        />
      )}

      {activeTab === "h2h" && <MatchH2H h2h={h2h} />}

      {activeTab === "standings" && (
        <MatchStandings
          league={fixture.league}
          season={fixture.season}
          standings={standings}
          homeTeam={fixture.homeTeam}
          awayTeam={fixture.awayTeam}
        />
      )}
    </div>
  );
}
