import { useEffect, useState } from 'react';
import { fixturesApi } from '../services/api';
import MatchHeader from '../components/match/MatchHeader';
import MatchStats from '../components/match/MatchStats';
import MatchEvents from "../components/match/MatchEvents";`nimport MatchTimeline from "../components/match/MatchTimeline";
import MatchStandings from '../components/match/MatchStandings';

export default function MatchPage() { // timeline added
  const fixtureId = window.location.pathname.split('/').pop();

  const [fixture, setFixture] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([]);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    async function load() {
      const base = await fixturesApi.getById(fixtureId);
      setFixture(base);

      const ev = await fixturesApi.getEvents(fixtureId);
      setEvents(ev?.data || []);

      const st = await fixturesApi.getStats(fixtureId);
      setStats(st?.data?.statistics || []);

      if (base?.leagueId && base?.season) {
        const table = await fixturesApi.getStandings(base.leagueId, base.season);
        setStandings(table?.data || []);
      }
    }
    load();
  }, [fixtureId]);

  if (!fixture) return <div style={{ color: '#fff' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', background: '#111', minHeight: '100vh', color: '#fff' }}>
      <MatchHeader fixture={fixture} />

      <MatchStats stats={stats} />

      <MatchEvents events={events} />

      <MatchStandings
        league={fixture.league}
        season={fixture.season}
        standings={standings}
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
      />
    </div>
  );
}

      <MatchTimeline
        events={events}
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
      />


      <MatchLineups lineups={lineups} />


      <MatchStats stats={data.stats} />


      <MatchStats stats={data.stats} />

