export default function FixtureRow({ fixture }) {
  const goToMatch = () => {
    window.location.href = \/match/\\;
  };

  return (
    <div
      onClick={goToMatch}
      style={{
        padding: '12px 16px',
        background: '#1a1a1a',
        borderBottom: '1px solid #333',
        cursor: 'pointer',
        color: '#fff'
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: '600' }}>
        {fixture.homeTeam} vs {fixture.awayTeam}
      </div>
      <div style={{ opacity: 0.7, fontSize: '14px' }}>
        {fixture.league} — {new Date(fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
