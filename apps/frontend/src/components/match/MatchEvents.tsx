import React from "react";

export default function MatchEvents({ events }) {
  if (!events || events.length === 0)
    return <div className="text-gray-400 text-sm">No events available.</div>;

  return (
    <div className="bg-[#1b1b1b] p-4 rounded-xl mt-4">
      <h3 className="text-lg font-bold mb-3">Events</h3>
      <ul className="space-y-2">
        {events.map((ev, i) => (
          <li key={i} className="flex justify-between border-b border-gray-700 pb-2">
            <span>{ev.minute}'</span>
            <span>{ev.team}</span>
            <span className="text-gray-300">{ev.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
