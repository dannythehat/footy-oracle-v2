import React from "react";

export default function MatchH2H({ h2h }) {
  if (!h2h || !h2h.matches || h2h.matches.length === 0) {
    return (
      <div style={{ color: '#ccc', marginTop: 20 }}>
        No head-to-head data available.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, background: '#222', padding: 15, borderRadius: 8 }}>
      <h3 style={{ marginBottom: 10 }}>Head-to-Head</h3>

      {h2h.matches.map((m, idx) => (
        <div key={idx} style={{
          padding: '8px 0',
          borderBottom: '1px solid #333'
        }}>
          <div>{new Date(m.date).toLocaleDateString()}</div>
          <div>{m.homeTeam} vs {m.awayTeam}</div>
          <strong>{m.score.home} - {m.score.away}</strong>
          <div style={{ opacity: 0.6 }}>{m.league}</div>
        </div>
      ))}

      <div style={{ marginTop: 10, opacity: 0.7 }}>
        Total Matches: {h2h.stats.totalMatches} | 
        Home Wins: {h2h.stats.homeWins} | 
        Away Wins: {h2h.stats.awayWins} | 
        Draws: {h2h.stats.draws}
      </div>
    </div>
  );
}
