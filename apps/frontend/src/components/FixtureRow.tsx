export default function FixtureRow({ fixture }) {
  return (
    <div
      className="p-3 border-b border-gray-800 text-white cursor-pointer hover:bg-gray-900"
      onClick={() => (window.location.href = "/match/" + fixture.fixtureId)}
    >
      <div className="flex justify-between">
        <strong>{fixture.homeTeam}</strong>
        <span>{fixture.homeScore} - {fixture.awayScore}</span>
        <strong>{fixture.awayTeam}</strong>
      </div>

      <div className="opacity-60 text-sm">{fixture.league}</div>
    </div>
  );
}
