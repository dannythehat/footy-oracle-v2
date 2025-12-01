import React, { useState } from "react";
import dayjs from "dayjs";
import { useFixtures } from "../hooks/useFixtures";
import FixtureDetails, { FixtureSummary } from "../components/fixtures/FixtureDetails";

const FixturesPage = () => {
  const { data: fixtures, isLoading } = useFixtures();
  const [selected, setSelected] = useState<FixtureSummary | null>(null);

  if (isLoading) {
    return <div className="text-white p-4">Loading fixtures…</div>;
  }

  return (
    <div className="p-4 text-white flex flex-col gap-4">
      <h1 className="text-xl font-bold">Fixtures</h1>

      {/* Fixture List */}
      <div className="flex flex-col gap-3">
        {fixtures?.map((fx: any) => {
          const kickoff = dayjs(fx.date).format("HH:mm");

          return (
            <div
              key={fx.id}
              onClick={() =>
                setSelected({
                  id: fx.id,
                  date: fx.date,
                  status: fx.status,
                  homeTeam: {
                    id: fx.homeTeam.id,
                    name: fx.homeTeam.name,
                    logo: fx.homeTeam.logo,
                  },
                  awayTeam: {
                    id: fx.awayTeam.id,
                    name: fx.awayTeam.name,
                    logo: fx.awayTeam.logo,
                  },
                  league: {
                    id: fx.league.id,
                    name: fx.league.name,
                    country: fx.league.country,
                    season: fx.league.season,
                  },
                })
              }
              className="bg-purple-900/40 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-purple-800/60 transition"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {fx.homeTeam.logo && (
                    <img
                      src={fx.homeTeam.logo}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{fx.homeTeam.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {fx.awayTeam.logo && (
                    <img
                      src={fx.awayTeam.logo}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{fx.awayTeam.name}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-mono text-sm">{kickoff}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixture Details Drawer */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 h-[75vh] bg-slate-950 rounded-t-2xl shadow-xl overflow-y-auto z-50">
          <button
            className="text-white p-3 text-center w-full bg-slate-800"
            onClick={() => setSelected(null)}
          >
            Close
          </button>

          <FixtureDetails fixture={selected} />
        </div>
      )}
    </div>
  );
};

export default FixturesPage;
