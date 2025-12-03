import React from 'react';

export default function MatchEvents({ events }) {
  if (!events || events.length === 0) {
    return <div style={{ color: '#ccc' }}>No events available</div>;
  }

  const iconForType = (type) => {
    if (type === 'goal') return '?';
    if (type === 'yellow card') return '??';
    if (type === 'red card') return '??';
    if (type === 'substitution') return '??';
    return '•';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {events.map((ev, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: ev.teamSide === 'home' ? 'flex-start' : 'flex-end'
          }}
        >
          <div
            style={{
              background: '#333',
              padding: '10px 14px',
              borderRadius: '6px',
              maxWidth: '70%'
            }}
          >
            <strong style={{ marginRight: '10px' }}>
              {iconForType(ev.type)}
            </strong>

            <strong>{ev.player}</strong>

            <span style={{ opacity: 0.7 }}> — {ev.minute}'</span>

            {ev.detail && (
              <div style={{ opacity: 0.5, fontSize: '0.9em' }}>
                {ev.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
