import React from "react";

export default function MatchHeader({ fixture }) {
  if (!fixture) return null;

  const {
    homeTeam,
    awayTeam,
    league,
    timestamp,
    status,
    homeScore,
    awayScore
  } = fixture;

  const matchDate = timestamp
    ? new Date(timestamp * 1000).toLocaleString()
    : "";

  return (
    <div
      style={{
        background: "#141414",
        padding: "20px",
        borderBottom: "1px solid #222",
        textAlign: "center",
        color: "#fff"
      }}
    >
      <h2 style={{ margin: 0, fontSize: "26px" }}>
        {homeTeam} <span style={{ opacity: 0.7 }}>vs</span> {awayTeam}
      </h2>

      <div style={{ marginTop: "6px", opacity: 0.8 }}>
        {league} • {matchDate}
      </div>

      <div
        style={{
          marginTop: "20px",
          fontSize: "36px",
          fontWeight: "bold"
        }}
      >
        {status === "NS" || homeScore === null
          ? "– : –"
          : ${homeScore} : }
      </div>

      <div style={{ marginTop: "4px", fontSize: "14px", opacity: 0.7 }}>
        {status}
      </div>
    </div>
  );
}
