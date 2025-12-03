import React from "react";

export default function MatchStandings({ standings }) {
  if (!standings)
    return <div className="text-gray-400 text-sm">No standings.</div>;

  return (
    <div className="bg-[#1b1b1b] p-4 rounded-xl mt-4">
      <h3 className="text-lg font-bold mb-3">League Standings</h3>

      {standings.map((t, i) => (
        <div key={i} className="flex justify-between border-b border-gray-800 py-1">
          <span>{t.rank}. {t.team}</span>
          <span className="text-gray-300">{t.points} pts</span>
        </div>
      ))}
    </div>
  );
}
