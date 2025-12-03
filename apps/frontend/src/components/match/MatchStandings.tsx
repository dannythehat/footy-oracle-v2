interface MatchStandingsProps {
  standings: any;
  league?: string;
  season?: number;
  homeTeam?: string;
  awayTeam?: string;
}

export default function MatchStandings({ standings }: MatchStandingsProps) {
  if (!standings || (Array.isArray(standings) && standings.length === 0)) {
    return <div className='text-white opacity-70'>No standings available</div>;
  }

  const standingsArray = Array.isArray(standings) ? standings : [];

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Standings</div>

      <div className='space-y-1'>
        {standingsArray.map((t: any, i: number) => (
          <div key={i} className='flex justify-between bg-gray-800 p-2 rounded text-sm'>
            <span>{t.rank || i + 1}. {t.team || t.teamName || 'Team'}</span>
            <span>{t.points || 0} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
