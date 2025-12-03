import React from 'react';

export default function MatchStandings({ league, season, standings, homeTeam, awayTeam }) {
  if (!standings || !Array.isArray(standings) || standings.length === 0) {
    return <div style={{ color: '#ccc', marginTop: '20px' }}>No league table available</div>;
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>
        {league} — {season} Standings
      </h3>

      <div style={{
        background: '#111',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #333'
      }}>
        <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ opacity: 0.7, fontSize: '12px' }}>
              <th align="left">#</th>
              <th align="left">Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((row, idx) => {
              const highlight =
                row.team === homeTeam
                  ? "#0af33"
                  : row.team === awayTeam
                  ? "#ff4444"
                  : "transparent";

              return (
                <tr key={idx} style={{
                  background: highlight,
                  fontWeight: highlight === "transparent" ? "normal" : "bold"
                }}>
                  <td>{row.rank}</td>
                  <td>{row.team}</td>
                  <td>{row.played}</td>
                  <td>{row.win}</td>
                  <td>{row.draw}</td>
                  <td>{row.loss}</td>
                  <td>{row.goalsFor}</td>
                  <td>{row.goalsAgainst}</td>
                  <td>{row.goalsFor - row.goalsAgainst}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
