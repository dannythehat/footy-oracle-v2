import React from "react";
import dayjs from "dayjs";

export interface FixtureSummary {
  id: number;
  date: string;
  status: string;
  homeTeam: {
    id: number;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo?: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
}

interface Props {
  fixture: FixtureSummary;
}

const FixtureDetails: React.FC<Props> = ({ fixture }) => {
  const kickoff = dayjs(fixture.date).format("YYYY-MM-DD HH:mm");

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">
        {fixture.homeTeam.name} vs {fixture.awayTeam.name}
      </h2>

      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            {fixture.homeTeam.logo && (
              <img
                src={fixture.homeTeam.logo}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span>{fixture.homeTeam.name}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {fixture.awayTeam.logo && (
              <img
                src={fixture.awayTeam.logo}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span>{fixture.awayTeam.name}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono">{kickoff}</div>
          <div className="text-sm opacity-80">{fixture.status}</div>
        </div>
      </div>

      <div className="mt-6 text-sm opacity-90">
        <p>League: {fixture.league.name}</p>
        <p>Country: {fixture.league.country}</p>
        <p>Season: {fixture.league.season}</p>
      </div>

      <div className="mt-6">
        <p className="text-yellow-400 text-sm">
          Additional stats, H2H, odds and insights will appear here later.
        </p>
      </div>
    </div>
  );
};

export default FixtureDetails;
