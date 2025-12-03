import React from "react";

interface MatchHeaderProps {
  fixture: any;
}

export default function MatchHeader({ fixture }: MatchHeaderProps) {
  if (!fixture) return null;

  const dateStr = fixture?.date
    ? new Date(fixture.date).toLocaleString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const rawStatus = String(fixture?.status || "").toLowerCase();
  const isLive = rawStatus.includes("live") || rawStatus.includes("inplay");
  const isFinished =
    rawStatus === "ft" ||
    rawStatus === "finished" ||
    rawStatus === "fulltime";

  const hasScore =
    fixture?.score &&
    fixture.score.home !== undefined &&
    fixture.score.away !== undefined;

  const scoreText = hasScore
    ? ${fixture.score.home} - 
    : isFinished
    ? "FT"
    : isLive
    ? "LIVE"
    : "";

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at top, #1f2937 0%, #020617 60%)",
        borderRadius: "16px",
        padding: "18px 20px",
        border: "1px solid #1f2937",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: "12px" }}>
          {fixture?.league}
          {fixture?.country ?  •  : ""}
        </div>
        <div>
          {isLive && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              LIVE
            </span>
          )}
          {isFinished && !isLive && (
            <span
              style={{
                background: "#111827",
                color: "#e5e7eb",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              FULL TIME
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{
              color: "#e5e7eb",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {fixture?.homeTeam}
          </div>
        </div>

        <div style={{ width: "90px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#f9fafb",
            }}
          >
            {scoreText}
          </div>
          {dateStr && (
            <div
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                marginTop: "4px",
              }}
            >
              {dateStr}
            </div>
          )}
        </div>

        <div style={{ flex: 1, textAlign: "left" }}>
          <div
            style={{
              color: "#e5e7eb",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {fixture?.awayTeam}
          </div>
        </div>
      </div>
    </div>
  );
}
