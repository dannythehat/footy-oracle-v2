import React from "react";
import { NormalizedFixture } from "../hooks/useFixtures";

interface Props {
  fixture: NormalizedFixture;
  onClick: () => void;
}

export default function FixtureCard({ fixture, onClick }: Props) {
  return (
    <div
      className="bg-[#1a072e] rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#240a3f] transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-6">
        <div className="font-semibold">
          {fixture.homeTeamName}
        </div>
        <div className="text-sm text-neutral-400">vs</div>
        <div className="font-semibold">
          {fixture.awayTeamName}
        </div>
      </div>

      <div className="text-right text-sm text-neutral-300">
        {fixture.time}
      </div>
    </div>
  );
}
