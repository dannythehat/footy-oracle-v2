import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fixturesApi } from "../services/api";
import FixtureRow from "../components/FixtureRow";
import { FixtureSummary } from "../types/fixtures";

const FixturesPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fixtures-today"],
    queryFn: () => fixturesApi.getByDate(new Date().toISOString().slice(0, 10)),
  });

  if (isLoading) {
    return <div className="p-4 text-gray-300">Loading fixtures…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        <p>Error loading fixtures: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  const fixtures: FixtureSummary[] = data ?? [];

  if (fixtures.length === 0) {
    return <div className="p-4 text-gray-300">No fixtures available for today</div>;
  }

  return (
    <div className="p-4 space-y-2">
      {fixtures.map((fx: FixtureSummary) => (
        <FixtureRow key={fx.fixtureId} fixture={fx} />
      ))}
    </div>
  );
};

export default FixturesPage;
