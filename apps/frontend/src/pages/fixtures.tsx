import { useState } from "react";
import dayjs from "dayjs";
import { useFixtures } from "../hooks/useFixtures";
import FixtureCard from "../components/FixtureCard";
import { FixtureStatsModal } from "../components/FixtureStatsModal";

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
        <FixtureStatsModal
          isOpen={!!selectedFixture}
          onClose={() => setSelectedFixture(null)}
          fixtureId={selectedFixture.id || selectedFixture.fixtureId}
          homeTeamId={selectedFixture.homeTeamId}
          awayTeamId={selectedFixture.awayTeamId}
          homeTeam={selectedFixture.homeTeam || selectedFixture.homeTeamName}
          awayTeam={selectedFixture.awayTeam || selectedFixture.awayTeamName}
          leagueId={selectedFixture.leagueId}
          season={selectedFixture.season || new Date().getFullYear()}
        />
      )}
    </div>
  );
}
