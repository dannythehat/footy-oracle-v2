import React from 'react';

export default function MatchStats({ stats }) {
  if (!stats || !stats.statistics) {
    return <div style={{ marginTop: '20px', color: '#888' }}>No statistics available</div>;
  }

  const s = stats.statistics;

  const Row = ({ label, home, away }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #222'
    }}>
      <span style={{ flex: 1, textAlign: 'left', color: '#0f0' }}>{home}</span>
      <span style={{ flex: 1, textAlign: 'center', color: '#fff' }}>{label}</span>
      <span style={{ flex: 1, textAlign: 'right', color: '#0f0' }}>{away}</span>
    </div>
  );

  const Bar = ({ home, away }) => {
    const total = home + away;
    const homePct = total ? (home / total) * 100 : 50;
    const awayPct = total ? (away / total) * 100 : 50;

    return (
      <div style={{ display: 'flex', height: '10px', borderRadius: '4px', overflow: 'hidden', marginTop: '5px' }}>
        <div style={{ width: homePct + '%', background: '#00ff00' }}></div>
        <div style={{ width: awayPct + '%', background: '#ff0000' }}></div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '35px' }}>
      <h3 style={{ color: '#fff' }}>Match Statistics</h3>

      {/* POSSESSION */}
      <div style={{ marginTop: '20px', border: '1px solid #333', padding: '15px', borderRadius: '10px', background: '#111' }}>
        <Row label="Possession %" home={s.possession.home} away={s.possession.away} />
        <Bar home={s.possession.home} away={s.possession.away} />
      </div>

      {/* SHOTS */}
      <div style={{ marginTop: '20px', border: '1px solid #333', padding: '15px', borderRadius: '10px', background: '#111' }}>
        <Row label="Shots" home={s.shots.home} away={s.shots.away} />
        <Bar home={s.shots.home} away={s.shots.away} />

        <Row label="Shots on Target" home={s.onTarget.home} away={s.onTarget.away} />
        <Bar home={s.onTarget.home} away={s.onTarget.away} />
      </div>

      {/* OTHER STATS */}
      <div style={{ marginTop: '20px', border: '1px solid #333', padding: '15px', borderRadius: '10px', background: '#111' }}>
        <Row label="Corners" home={s.corners.home} away={s.corners.away} />
        <Row label="Yellow Cards" home={s.yellow.home} away={s.yellow.away} />
        <Row label="Red Cards" home={s.red.home} away={s.red.away} />
        <Row label="Fouls" home={s.fouls.home} away={s.fouls.away} />
        <Row label="Offsides" home={s.offsides.home} away={s.offsides.away} />
      </div>
    </div>
  );
}
