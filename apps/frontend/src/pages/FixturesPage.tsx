import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fixturesApi } from "../services/api";
import FixtureRow from "../components/FixtureRow";
import { FixtureSummary } from "../types/fixtures";

const FixturesPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["fixtures-today"],
    queryFn: () => fixturesApi.getByDate(new Date().toISOString().slice(0, 10)),
  });

  if (isLoading) {
    return <div className="p-4 text-gray-300">Loading fixtures…</div>;
  }

  const fixtures: FixtureSummary[] = data ?? [];

  return (
    <div className="p-4 space-y-2">
      {fixtures.map((fx: FixtureSummary) => (
        <FixtureRow key={fx.fixtureId} fixture={fx} />
      ))}
    </div>
  );
};

export default FixturesPage;
