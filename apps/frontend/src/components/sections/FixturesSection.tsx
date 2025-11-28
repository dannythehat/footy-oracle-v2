import React, { useMemo, useState } from "react";
import { CalendarDays, RefreshCcw, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { useFixtures } from "../../hooks/useFixtures";

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const classifyStatus = (status) => {
  if (!status) return "upcoming";
  const s = status.toLowerCase();
  if (s.includes("live") || s.includes("inplay") || s.includes("1h") || s.includes("2h"))
    return "live";
  if (s.includes("ft")) return "finished";
  return "upcoming";
};

export default function FixturesSection() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: fixtures = [], isLoading } = useFixtures(selectedDate);

  const leagues = useMemo(() => {
    const map = {};
    fixtures.forEach((fx) => {
      const key = `${fx.league}__${fx.country}`;
      if (!map[key]) map[key] = { league: fx.league, country: fx.country, fixtures: [] };
      map[key].fixtures.push(fx);
    });

    return Object.values(map).sort((a, b) =>
      a.league.localeCompare(b.league)
    );
  }, [fixtures]);

  if (isLoading) {
    return (
      <div className="text-center py-16 text-purple-300">Loading fixtures...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-purple-300">
        Fixtures & Live Scores
      </h1>

      {/* DATE PICKER */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="date"
          className="bg-black border border-purple-500/40 text-white py-2 px-3 rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button
          onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          className="bg-purple-600 text-white px-3 py-2 rounded shadow"
        >
          Today
        </button>
      </div>

      {/* LEAGUE CARDS */}
      <div className="space-y-6">
        {leagues.map((lg) => (
          <div
            key={lg.league}
            className="bg-gradient-to-br from-zinc-900 to-black p-5 rounded-2xl shadow-xl border border-purple-900/40"
          >
            {/* LEAGUE HEADER */}
            <h2 className="text-xl font-semibold text-purple-300 mb-4 flex items-center justify-between">
              <span>{lg.league}</span>
              <span className="text-sm text-purple-500">
                {lg.fixtures.length} matches
              </span>
            </h2>

            {/* FIXTURES LIST */}
            <div className="divide-y divide-purple-950/40">
              {lg.fixtures.map((fx) => {
                const statusType = classifyStatus(fx.status);
                const isLive = statusType === "live";
                const isFinished = statusType === "finished";

                return (
                  <div
                    key={fx.fixtureId}
                    className="py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-purple-400">
                        {formatTime(fx.kickoff)}
                      </span>

                      {isLive && (
                        <span className="text-xs text-red-400 font-bold">LIVE</span>
                      )}
                      {isFinished && (
                        <span className="text-xs text-green-400 font-bold">FT</span>
                      )}
                    </div>

                    <div className="flex-1 text-center">
                      <span className="text-white">{fx.homeTeam}</span>
                      <span className="text-purple-400 mx-2">vs</span>
                      <span className="text-white">{fx.awayTeam}</span>
                    </div>

                    <div className="text-right w-16 text-purple-300 font-bold">
                      {fx.homeScore != null ? `${fx.homeScore} : ${fx.awayScore}` : "- : -"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
