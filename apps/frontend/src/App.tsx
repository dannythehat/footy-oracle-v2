import React, { useEffect, useState } from 'react';
import { api } from './services/api';

function App() {
  const [fixtures, setFixtures] = useState([]);
  const [golden, setGolden] = useState([]);
  const [valueBets, setValueBets] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const f = await api.fixturesToday();
        const g = await api.goldenBetsToday();
        const v = await api.valueBetsToday();

        setFixtures(f.fixtures || []);
        setGolden(g.goldenBets || []);
        setValueBets(v.valueBets || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', color: '#fff', background: '#111', minHeight: '100vh' }}>
      <h1>Footy Oracle</h1>

      <h2>Fixtures Today</h2>
      <ul>
        {fixtures.map((fx: any) => (
          <li key={fx.fixtureId}>
            {fx.homeTeam} vs {fx.awayTeam} — {fx.date}
          </li>
        ))}
      </ul>

      <h2>Golden Bets</h2>
      <ul>
        {golden.map((b: any) => (
          <li key={b.fixtureId}>
            {b.market} — {Math.round(b.probability * 100)}%
          </li>
        ))}
      </ul>

      <h2>Value Bets</h2>
      <ul>
        {valueBets.map((b: any) => (
          <li key={b.fixtureId}>
            {b.market} — Value: {b.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
