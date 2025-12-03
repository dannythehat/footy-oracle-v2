import { useEffect, useState } from "react";
import { fixturesApi } from "../services/api";

export default function MatchPage() {
  const fixtureId = window.location.pathname.split("/").pop();

  const [fixture, setFixture] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any>(null);
  const [h2h, setH2h] = useState<any>(null);

  useEffect(() => {
    if (!fixtureId) return;

    // Load main fixture
    fixturesApi.getById(fixtureId).then((d) => setFixture(d?.data));

    // Load stats
    fixturesApi.getStats(fixtureId).then((d) => setStats(d?.data));

    // Load events
    fixturesApi.getEvents(fixtureId).then((d) => setEvents(d?.data));

    // Load h2h
    fixturesApi.getH2H(fixtureId).then((d) => setH2h(d?.data));
  }, [fixtureId]);

  if (!fixture)
    return <div style={{ color: "#fff" }}>Loading match...</div>;

  return (
    <div style={{ padding: "20px", background: "#111", minHeight: "100vh", color: "#fff" }}>
      <button onClick={() => (window.location.href = "/")} style={{ marginBottom: 20 }}>
        ⬅ Back
      </button>

      <h1>{fixture.homeTeam} vs {fixture.awayTeam}</h1>
      <p style={{ opacity: 0.7 }}>{fixture.league}</p>

      {/* EVENTS */}
      <h2 style={{ marginTop: 40 }}>Events</h2>
      <pre>{JSON.stringify(events, null, 2)}</pre>

      {/* STATS */}
      <h2 style={{ marginTop: 40 }}>Statistics</h2>
      <pre>{JSON.stringify(stats, null, 2)}</pre>

      {/* H2H */}
      <h2 style={{ marginTop: 40 }}>Head-to-Head</h2>
      <pre>{JSON.stringify(h2h, null, 2)}</pre>
    </div>
  );
}
