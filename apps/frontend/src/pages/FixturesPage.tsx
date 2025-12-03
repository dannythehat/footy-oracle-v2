import { useEffect, useState } from 'react';
import { fixturesApi } from '../services/api';
import FixtureRow from '../components/FixtureRow';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    fixturesApi.getByDate(today).then((res) => {
      setFixtures(res.data || []);
      setLoading(false);
    });
  }, [today]);

  if (loading) {
    return (
      <div style={{ background: '#111', color: '#fff', minHeight: '100vh', padding: '20px' }}>
        Loading fixtures...
      </div>
    );
  }

  return (
    <div style={{ background: '#111', minHeight: '100vh', padding: '20px', color: '#fff' }}>
      <h2 style={{ marginBottom: '15px' }}>Today's Fixtures</h2>

      {fixtures.length === 0 && (
        <div>No fixtures found for today.</div>
      )}

      {fixtures.map((fx) => (
        <FixtureRow key={fx.fixtureId} fixture={fx} />
      ))}
    </div>
  );
}
