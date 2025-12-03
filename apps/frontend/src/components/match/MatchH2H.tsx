import React from "react";

export default function MatchH2H({ h2h }) {
  if (!h2h)
    return <div className="text-gray-400 text-sm">No H2H data.</div>;

  return (
    <div className="bg-[#1b1b1b] p-4 rounded-xl mt-4">
      <h3 className="text-lg font-bold mb-3">Head-to-Head</h3>

      {h2h.matches?.map((m, i) => (
        <div key={i} className="border-b border-gray-700 pb-2 mb-2">
          <div>{m.homeTeam} vs {m.awayTeam}</div>
          <div className="text-gray-400 text-sm">{m.score.home}-{m.score.away}</div>
          <div className="text-gray-500 text-xs">{m.league}</div>
        </div>
      ))}
    </div>
  );
}
