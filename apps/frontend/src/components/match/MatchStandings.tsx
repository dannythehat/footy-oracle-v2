export default function MatchStandings({ standings }: { standings: any }) {
  if (!standings) return null;

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Standings</div>

      <div className='space-y-1'>
        {(standings || []).map((t: any, i: number) => (
          <div key={i} className='flex justify-between bg-gray-800 p-2 rounded text-sm'>
            <span>{t.rank}. {t.team}</span>
            <span>{t.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
