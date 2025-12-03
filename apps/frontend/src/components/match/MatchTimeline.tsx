import React from 'react';

export default function MatchTimeline({ events, homeTeam, awayTeam }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ marginTop: '30px', color: '#888' }}>
        No match events available
      </div>
    );
  }

  return (
    <div style={{ marginTop: '35px' }}>
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>Match Timeline</h3>

      <div style={{
        background: '#111',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #333'
      }}>
        {events.map((ev, idx) => {
          const isHome = ev.team === homeTeam;
          const icon =
            ev.type === 'Goal' ? '?' :
            ev.type === 'Yellow Card' ? '??' :
            ev.type === 'Red Card' ? '??' :
            ev.type === 'Substitution' ? '??' :
            '•';

          return (
            <div key={idx} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 50px 1fr',
              padding: '8px 0',
              borderBottom: idx < events.length - 1 ? '1px solid #222' : 'none'
            }}>
              {/* HOME SIDE */}
              <div style={{
                textAlign: 'right',
                opacity: isHome ? 1 : 0.4
              }}>
                {isHome && (
                  <span>
                    {icon} {ev.player}
                  </span>
                )}
              </div>

              {/* MINUTE */}
              <div style={{ textAlign: 'center', color: '#999' }}>
                {ev.minute}' 
              </div>

              {/* AWAY SIDE */}
              <div style={{
                textAlign: 'left',
                opacity: isHome ? 0.4 : 1
              }}>
                {!isHome && (
                  <span>
                    {icon} {ev.player}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
