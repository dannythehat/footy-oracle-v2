export default function MatchTimeline({
  events,
  homeTeam,
  awayTeam
}: {
  events: any[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (!events) return null;

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Timeline</div>

      {events.map((ev: any, idx: number) => (
        <div key={idx} className='p-2 bg-gray-800 rounded mb-1'>
          <div>{ev.minute}' — {ev.type}</div>
          <div className='opacity-70'>{ev.team} — {ev.player}</div>
        </div>
      ))}
    </div>
  );
}
