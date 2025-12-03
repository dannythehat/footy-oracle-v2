import React from "react";

interface FixtureRowProps {
  fixture: any;
}

export default function FixtureRow({ fixture }: FixtureRowProps) {
  const handleClick = () => {
    if (fixture?.fixtureId) {
      window.location.href = /match/;
    }
  };

  const time = fixture?.date
    ? new Date(fixture.date).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const status =
    typeof fixture?.status === "string"
      ? fixture.status.toUpperCase()
      : "";

  const scoreText =
    fixture?.score &&
    fixture.score.home !== undefined &&
    fixture.score.away !== undefined
      ? ${fixture.score.home} - 
      : status;

  return (
    <div
      onClick={handleClick}
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr 70px",
        padding: "10px 14px",
        borderBottom: "1px solid #1f2937",
        cursor: "pointer",
        alignItems: "center",
        background: "#020617",
      }}
    >
      <div style={{ color: "#9ca3af", fontSize: "12px" }}>{time}</div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#e5e7eb",
            fontSize: "14px",
          }}
        >
          <span>{fixture?.homeTeam}</span>
          <span style={{ opacity: 0.4 }}>vs</span>
          <span>{fixture?.awayTeam}</span>
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: "11px",
            marginTop: "2px",
          }}
        >
          {fixture?.league}
          {fixture?.country ?  •  : ""}
        </div>
      </div>

      <div
        style={{
          textAlign: "right",
          color: "#22c55e",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        {scoreText}
      </div>
    </div>
  );
}
