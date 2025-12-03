import React from 'react';

export default function FixtureRow({ fixture }: { fixture: any }) {
  if (!fixture) return null;

  return (
    <div
      className='p-3 bg-gray-800 rounded mb-2 text-white cursor-pointer'
      onClick={() => window.location.href = '/match/' + fixture.fixtureId}
    >
      <div className='flex justify-between'>
        <span>{fixture.homeTeam}</span>
        <span>{fixture.score?.home} - {fixture.score?.away}</span>
        <span>{fixture.awayTeam}</span>
      </div>
      <div className='text-xs opacity-70'>{fixture.league}</div>
    </div>
  );
}
