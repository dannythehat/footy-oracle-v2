export default function MatchTimeline({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-3">Timeline</h2>

      <div className="space-y-3">
        {events.map((ev, idx) => (
          <div key={idx} className="flex justify-between bg-gray-800 p-2 rounded">
            <span>{ev.minute}'</span>
            <span>{ev.type}</span>
            <span>{ev.team}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
