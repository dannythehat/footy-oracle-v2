interface MatchTimelineProps {
  events: any[];
  homeTeam: string;
  awayTeam: string;
}

export default function MatchTimeline({ events, homeTeam, awayTeam }: MatchTimelineProps) {
  if (!events || events.length === 0) {
    return <div className='text-white opacity-70'>No timeline events available</div>;
  }

  return (
    <div className='text-white'>
      <div className='font-bold mb-2'>Timeline</div>

      {events.map((ev: any, idx: number) => (
        <div key={idx} className='p-2 bg-gray-800 rounded mb-1'>
          <div>{ev.minute || ev.time?.elapsed || '?'}' — {ev.type || 'Event'}</div>
          <div className='opacity-70'>{ev.team || ev.team?.name || ''} — {ev.player || ev.player?.name || ''}</div>
        </div>
      ))}
    </div>
  );
}
