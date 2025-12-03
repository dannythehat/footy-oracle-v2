interface MatchH2HProps {
  h2h: any;
}

export default function MatchH2H({ h2h }: MatchH2HProps) {
  if (!h2h || !h2h.matches || h2h.matches.length === 0) {
    return <div className='text-white opacity-70'>No head-to-head data available</div>;
  }

  return (
    <div className='text-white space-y-2'>
      {(h2h.matches || []).map((m: any, i: number) => (
        <div key={i} className='p-2 bg-gray-800 rounded'>
          <div className='font-bold'>
            {m.homeTeam || 'Home'} {m.score?.home || 0}-{m.score?.away || 0} {m.awayTeam || 'Away'}
          </div>
          <div className='opacity-70'>{m.league || ''} — {m.date || ''}</div>
        </div>
      ))}
    </div>
  );
}
