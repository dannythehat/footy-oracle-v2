import React from 'react';

export default function MatchLineups({ lineups }) {
  if (!lineups || !lineups.home || !lineups.away) {
    return (
      <div style={{ marginTop: '30px', color: '#888' }}>
        Lineups not yet available
      </div>
    );
  }

  const TeamBlock = ({ team, side }) => (
    <div style={{ flex: 1, padding: '10px' }}>
      <h3 style={{ color: '#fff', textAlign: side }}>
        {team.name}
      </h3>
      <p style={{ color: '#aaa', textAlign: side }}>
        {team.formation}
      </p>

      {/* STARTING XI */}
      <div style={{ marginTop: '10px' }}>
        {team.startXI.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
            padding: '5px',
            borderBottom: '1px solid #222'
          }}>
            <span style={{ color: '#0f0', marginRight: '10px' }}>
              {p.number}
            </span>
            <span style={{ color: '#fff' }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* BENCH */}
      <h4 style={{ color: '#fff', marginTop: '20px', textAlign: side }}>Bench</h4>
      <div>
        {team.subs.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
            padding: '5px',
            borderBottom: '1px solid #111'
          }}>
            <span style={{ color: '#999' }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* MANAGER */}
      <h4 style={{ color: '#fff', marginTop: '20px', textAlign: side }}>Manager</h4>
      <p style={{ color: '#ccc', textAlign: side }}>{team.manager}</p>
    </div>
  );

  return (
    <div style={{ marginTop: '35px' }}>
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>Lineups</h3>

      <div style={{
        display: 'flex',
        background: '#111',
        borderRadius: '10px',
        border: '1px solid #333',
        padding: '20px'
      }}>
        <TeamBlock team={lineups.home} side="left" />
        <TeamBlock team={lineups.away} side="right" />
      </div>
    </div>
  );
}
