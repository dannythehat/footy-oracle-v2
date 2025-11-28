import { useState } from 'react';
import FixturesModal from '../components/FixturesModal';

export default function HomePageWithBetBuilder() {
  const [showFixtures, setShowFixtures] = useState(false);

  return (
    <div style={{ background: '#0a0015', color: '#fff', minHeight: '100vh', paddingBottom: '200px' }}>

      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 700, color: '#c28cff' }}>The Footy Oracle</h1>
        <p style={{ fontSize: '20px', marginTop: '10px', opacity: 0.8 }}>
          Machine learning meets expert analysis. Get premium Golden Bets daily with AI reasoning and transparent performance tracking.
        </p>

        <button
          onClick={() => setShowFixtures(true)}
          style={{
            marginTop: '30px',
            background: '#7d4cff',
            padding: '14px 28px',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ?? Browse All Fixtures
        </button>
      </div>

      {/* BET BUILDER SECTION (unchanged for now) */}
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '10px', background: 'linear-gradient(to right, gold, orange)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          ?? BET BUILDER OF THE DAY ??
        </h2>
        <p style={{ opacity: 0.7 }}>
          Our ML algorithm selects the single best bet builder each day – the optimal balance between confidence and value.
        </p>
      </div>

      {/* FIXTURES MODAL */}
      {showFixtures && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#151021',
              padding: '20px',
              borderRadius: '12px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setShowFixtures(false)}
              style={{
                background: 'red',
                color: '#fff',
                padding: '8px 14px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Close
            </button>

            <FixturesModal />
          </div>
        </div>
      )}

    </div>
  );
}
