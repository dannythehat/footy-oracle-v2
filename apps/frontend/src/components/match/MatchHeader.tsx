export default function MatchHeader({ fixture }) {
  if (!fixture) return null;

  return (
    <div
      style={{
        background: "#111",
        padding: "20px",
        color: "#fff",
        borderBottom: "1px solid #222"
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "6px" }}>
        {fixture.homeTeam} vs {fixture.awayTeam}
      </h2>
      <div style={{ opacity: 0.7 }}>
        {fixture.league} • {fixture.status}
      </div>
    </div>
  );
}
