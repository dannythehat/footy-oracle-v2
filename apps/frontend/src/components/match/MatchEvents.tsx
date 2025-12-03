interface MatchEventsProps {
  events: any[];
}

export default function MatchEvents({ events }: MatchEventsProps) {
  if (!events || events.length === 0) {
    return <div className='text-white opacity-70'>No events available</div>;
  }

  return (
    <div className='text-white space-y-2'>
      {events.map((ev: any, i: number) => (
        <div key={i} className='p-2 bg-gray-800 rounded'>
          <div className='font-bold'>{ev.minute || ev.time?.elapsed || '?'}' - {ev.type || 'Event'}</div>
          <div className='opacity-70'>{ev.player || ev.player?.name || 'Unknown'}</div>
        </div>
      ))}
    </div>
  );
}
