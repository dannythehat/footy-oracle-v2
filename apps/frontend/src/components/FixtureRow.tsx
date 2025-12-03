import React from "react";
import { useNavigate } from "react-router-dom";

export default function FixtureRow({ fixture }) {
  const navigate = useNavigate();

  return (
    <div
      className="p-3 bg-[#1b1b1b] rounded-xl mb-2 cursor-pointer hover:bg-[#222]"
      onClick={() => navigate(`/match/${fixture.fixtureId}`)}
    >
      <div className="flex justify-between">
        <span>{fixture.homeTeam}</span>
        <span className="text-gray-400">{fixture.homeScore} - {fixture.awayScore}</span>
        <span>{fixture.awayTeam}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{fixture.league}</div>
    </div>
  );
}
