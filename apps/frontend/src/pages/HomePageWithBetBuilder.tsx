import React from 'react';
import { useNavigate } from 'react-router-dom';
import GoldenBetsSection from '../components/sections/GoldenBetsSection';
import ValueBetsSection from '../components/sections/ValueBetsSection';
import BetBuilderSection from '../components/sections/BetBuilderSection';

export default function HomePageWithBetBuilder() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0a0015', color: '#fff', minHeight: '100vh', paddingBottom: '200px' }}>
      
      {/* HERO */}
      <div style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 700, color: '#c28cff' }}>
          The Footy Oracle
        </h1>

        <p style={{ fontSize: '20px', marginTop: '10px', opacity: 0.8 }}>
          World-class football insights powered by AI.
        </p>

        <button
          onClick={() => navigate('/fixtures')}
          style={{
            marginTop: '35px',
            background: '#7d4cff',
            padding: '14px 28px',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 12px #7d4cff55'
          }}
        >
          ? Browse All Fixtures
        </button>
      </div>

      {/* GOLDEN BETS */}
      <GoldenBetsSection />

      {/* VALUE BETS */}
      <ValueBetsSection />

      {/* BET BUILDER */}
      <BetBuilderSection />

    </div>
  );
}
