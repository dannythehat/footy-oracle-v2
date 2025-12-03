import React from 'react';
import { Link } from 'react-router-dom';

interface FixtureRowProps {
  fixture: any;
}

export default function FixtureRow({ fixture }: FixtureRowProps) {
  if (!fixture) return null;

  const fixtureId = fixture.fixtureId || fixture.id;
  const homeTeam = fixture.homeTeam || fixture.homeTeamName || 'Home';
  const awayTeam = fixture.awayTeam || fixture.awayTeamName || 'Away';
  const league = fixture.league || fixture.leagueName || '';
  const homeScore = fixture.homeScore ?? fixture.score?.home ?? '-';
  const awayScore = fixture.awayScore ?? fixture.score?.away ?? '-';

  return (
    <Link
      to={`/match/${fixtureId}`}
      className='block p-3 bg-gray-800 rounded mb-2 text-white hover:bg-gray-700 transition-colors'
    >
      <div className='flex justify-between items-center'>
        <span className='flex-1'>{homeTeam}</span>
        <span className='px-4 font-bold'>{homeScore} - {awayScore}</span>
        <span className='flex-1 text-right'>{awayTeam}</span>
      </div>
      <div className='text-xs opacity-70 mt-1'>{league}</div>
    </Link>
  );
}
