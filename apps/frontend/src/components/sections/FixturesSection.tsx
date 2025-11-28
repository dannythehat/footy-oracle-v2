import React, { useMemo, useState } from "react";
import { CalendarDays, RefreshCcw, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { useFixtures } from "../../hooks/useFixtures";

const formatDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatTime = (iso: string) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const classifyStatus = (status: string) => {
  const s = (status || "").toLowerCase();
  if (["live", "inplay", "1h", "2h", "et"].some((k) => s.includes(k))) return "live";
  if (["ft", "finished", "match_finished"].some((k) => s.includes(k))) return "finished";
  if (["ht"].includes(s)) return "live";
  if (!s || ["ns", "not_started", "scheduled"].includes(s)) return "upcoming";
  return "other";
};

const formatStatusLabel = (status: string) => {
  const type = classifyStatus(status);
  if (type === "live") return "LIVE";
  if (type === "finished") return "FT";
  if (type === "upcoming") return "Scheduled";
  return status || "Scheduled";
};

type TabType = "today" | "tomorrow" | "yesterday" | "live" | "custom";

const getToday = () => formatDateString(new Date());

export default function FixturesSection() {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [collapsedLeagues, setCollapsedLeagues] = useState<Record<string, boolean>>({});

  const { data: fixtures = [], isLoading, isError, refetch } = useFixtures(selectedDate);

  const leagueGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        league: string;
        country: string;
        fixtures: ReturnType<typeof useFixtures>["data"];
      }
    >();

    fixtures.forEach((fx: any) => {
      const leagueName = fx.league || "Unknown League";
      const country = fx.country || "Unknown";
      const key = `${leagueName}__${country}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          league: leagueName,
          country,
          fixtures: [],
        });
      }

      // @ts-ignore
      groups.get(key)!.fixtures.push(fx);
    });

    // Sort leagues alphabetically
    return Array.from(groups.values()).sort((a, b) =>
      a.league.localeCompare(b.league)
    );
  }, [fixtures]);

  const filteredLeagueGroups = useMemo(() => {
    if (activeTab !== "live") return leagueGroups;

    // LIVE tab ? filter fixtures to only live ones
    return leagueGroups
      .map((group) => {
        const liveFixtures = (group.fixtures || []).filter(
          (fx: any) => classifyStatus(fx.status) === "live"
        );
        return { ...group, fixtures: liveFixtures };
      })
      .filter((g) => (g.fixtures || []).length > 0);
  }, [leagueGroups, activeTab]);

  const handleQuickTab = (tab: TabType) => {
    const base = new Date();
    if (tab === "today") {
      setSelectedDate(formatDateString(base));
    } else if (tab === "tomorrow") {
      base.setDate(base.getDate() + 1);
      setSelectedDate(formatDateString(base));
    } else if (tab === "yesterday") {
      base.setDate(base.getDate() - 1);
      setSelectedDate(formatDateString(base));
    }
    setActiveTab(tab);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) return;
    setSelectedDate(v);
    setActiveTab("custom");
  };

  const toggleLeague = (key: string) => {
    setCollapsedLeagues((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-8 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Fixtures & Live Scores
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            All fixtures from the Footy Oracle engine — past, present and future.
          </p>
        </div>

        {/* Date + Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-700 rounded-xl px-3 py-1.5">
            <CalendarDays className="w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateInputChange}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-xl px-3 py-1.5 bg-zinc-900/70"
          >
            <RefreshCcw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleQuickTab("today")}
          className={`px-3 py-1.5 text-xs rounded-full border ${
            activeTab === "today"
              ? "bg-purple-600 text-white border-purple-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleQuickTab("tomorrow")}
          className={`px-3 py-1.5 text-xs rounded-full border ${
            activeTab === "tomorrow"
              ? "bg-purple-600 text-white border-purple-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Tomorrow
        </button>
        <button
          onClick={() => handleQuickTab("yesterday")}
          className={`px-3 py-1.5 text-xs rounded-full border ${
            activeTab === "yesterday"
              ? "bg-purple-600 text-white border-purple-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          Yesterday / Results
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`px-3 py-1.5 text-xs rounded-full border inline-flex items-center gap-1 ${
            activeTab === "live"
              ? "bg-red-600 text-white border-red-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Radio className="w-3 h-3" />
          Live
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-zinc-400">
          Showing{" "}
          <span className="text-zinc-100 font-semibold">
            {filteredLeagueGroups.reduce(
              (acc, g) => acc + (g.fixtures?.length || 0),
              0
            )}
          </span>{" "}
          fixtures for{" "}
          <span className="text-zinc-100 font-semibold">{selectedDate}</span>
          {activeTab === "live" && (
            <span className="ml-2 text-red-400 inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live only
            </span>
          )}
        </div>
      </div>

      {/* Loading / error / empty */}
      {isLoading && (
        <div className="w-full py-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="w-full py-10 text-center text-sm text-red-400">
          Failed to load fixtures. Please try again later.
        </div>
      )}

      {!isLoading &&
        !isError &&
        filteredLeagueGroups.length === 0 && (
          <div className="w-full py-10 text-center text-sm text-zinc-400">
            No fixtures found for this selection.
          </div>
        )}

      {/* League cards */}
      {!isLoading && !isError && filteredLeagueGroups.length > 0 && (
        <div className="space-y-4 mt-2">
          {filteredLeagueGroups.map((group) => {
            const isCollapsed = collapsedLeagues[group.key];

            return (
              <div
                key={group.key}
                className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 shadow-xl shadow-black/60 overflow-hidden"
              >
                {/* League header */}
                <button
                  type="button"
                  onClick={() => toggleLeague(group.key)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-950/90 hover:bg-zinc-900/90 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-amber-400 opacity-80" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-zinc-100">
                        {group.league}
                      </span>
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wide">
                        {group.country}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded-full border border-zinc-700">
                      {group.fixtures?.length ?? 0} matches
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-zinc-800">
                    {group.fixtures?.map((fx: any) => {
                      const statusType = classifyStatus(fx.status);
                      const isLive = statusType === "live";
                      const isFinished = statusType === "finished";

                      return (
                        <div
                          key={fx.fixtureId}
                          className="px-4 py-2.5 flex items-center gap-3 text-sm hover:bg-zinc-900/80 transition"
                        >
                          {/* Time + status */}
                          <div className="w-20 flex flex-col">
                            <span className="text-xs text-zinc-400">
                              {formatTime(fx.kickoff)}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isLive
                                  ? "text-red-400"
                                  : isFinished
                                  ? "text-emerald-400"
                                  : "text-zinc-500"
                              }`}
                            >
                              {formatStatusLabel(fx.status)}
                            </span>
                          </div>

                          {/* Teams */}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-zinc-200 truncate">
                                {fx.homeTeam || "Home"}
                              </span>
                              <span className="text-xs text-zinc-500 mx-1">
                                vs
                              </span>
                              <span className="text-zinc-200 truncate text-right">
                                {fx.awayTeam || "Away"}
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="w-14 text-right">
                            {fx.homeScore != null && fx.awayScore != null ? (
                              <span className="text-sm font-semibold text-zinc-100">
                                {fx.homeScore} : {fx.awayScore}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-500">
                                - : -
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
