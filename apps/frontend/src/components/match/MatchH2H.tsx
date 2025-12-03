export default function MatchH2H({ h2h }: { h2h: any }) {
  if (!h2h) return null;

  return (
    <div className='text-white space-y-2'>
      {(h2h.matches || []).map((m: any, i: number) => (
        <div key={i} className='p-2 bg-gray-800 rounded'>
          <div className='font-bold'>{m.homeTeam} {m.score.home}-{m.score.away} {m.awayTeam}</div>
          <div className='opacity-70'>{m.league} — {m.date}</div>
        </div>
      ))}
    </div>
  );
}
