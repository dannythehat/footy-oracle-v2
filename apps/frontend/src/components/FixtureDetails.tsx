import React from "react";
import { NormalizedFixture } from "../hooks/useFixtures";

interface Props {
  fixture: NormalizedFixture;
  onClose: () => void;
}

export default function FixtureDetails({ fixture, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-xl space-y-4">
        <button
          className="text-neutral-400 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>

        <h2 className="text-2xl font-bold">
          {fixture.homeTeamName} vs {fixture.awayTeamName}
        </h2>

        <div className="text-neutral-400 space-y-1">
          <div>League: {fixture.leagueName}</div>
          {fixture.country && <div>Country: {fixture.country}</div>}
          {fixture.season && <div>Season: {fixture.season}</div>}
          <div>Date: {fixture.date}</div>
          <div>Time: {fixture.time}</div>
          <div>Status: {fixture.status}</div>
        </div>
      </div>
    </div>
  );
}
