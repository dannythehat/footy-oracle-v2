interface MatchStatsProps {
  stats: any[];
}

export default function MatchStats({ stats }: MatchStatsProps) {
  if (!stats || stats.length === 0) {
    return <div className='text-white opacity-70'>No statistics available</div>;
  }

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Stats</div>

      {stats.map((item: any, index: number) => (
        <div key={index} className='flex justify-between bg-gray-800 p-2 rounded mb-1'>
          <span>{item.type || 'Stat'}</span>
          <span>{item.home || 0} - {item.away || 0}</span>
        </div>
      ))}
    </div>
  );
}
