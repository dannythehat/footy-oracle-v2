export default function MatchStats({ stats }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-3">Match Statistics</h2>

      <div className="space-y-2">
        {stats.map((item, index) => (
          <div key={index} className="flex justify-between bg-gray-800 p-2 rounded">
            <span>{item.type}</span>
            <span>{item.home} - {item.away}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
