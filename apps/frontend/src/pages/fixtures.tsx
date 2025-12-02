import { useState } from "react";
import dayjs from "dayjs";
import { useFixtures } from "../hooks/useFixtures";
import FixtureCard from "../components/FixtureCard";
import FixtureDetails from "../components/FixtureDetails";

export default function FixturesPage() {
  const [selectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedFixture, setSelectedFixture] = useState<any | null>(null);

  const { data: fixtures = [], isLoading } = useFixtures(selectedDate);

  if (isLoading) return <div className="p-4">Loading fixtures…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Fixtures</h1>

      <div className="space-y-3">
        {fixtures.map((fx) => (
          <FixtureCard
            key={fx.id}
            fixture={fx}
            onClick={() => setSelectedFixture(fx)}
          />
        ))}
      </div>

      {selectedFixture && (
        <FixtureDetails
          fixture={selectedFixture}
          onClose={() => setSelectedFixture(null)}
        />
      )}
    </div>
  );
}
