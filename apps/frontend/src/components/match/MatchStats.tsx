export default function MatchStats({ stats }: { stats: any[] }) {
  if (!stats) return null;

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Stats</div>

      {stats.map((item: any, index: number) => (
        <div key={index} className='flex justify-between bg-gray-800 p-2 rounded mb-1'>
          <span>{item.type}</span>
          <span>{item.home} - {item.away}</span>
        </div>
      ))}
    </div>
  );
}
