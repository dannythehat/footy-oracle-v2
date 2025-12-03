import React from "react";

export default function MatchLineups({ lineups }) {
  if (!lineups)
    return <div className="text-gray-400 text-sm">No lineup data.</div>;

  return (
    <div className="bg-[#1b1b1b] p-4 rounded-xl mt-4">
      <h3 className="text-lg font-bold mb-3">Lineups</h3>
      <pre className="text-xs text-gray-300">
        {JSON.stringify(lineups, null, 2)}
      </pre>
    </div>
  );
}
