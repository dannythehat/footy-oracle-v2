export default function MatchHeader({ fixture }) {
  if (!fixture) return null;

  return (
    <div className="text-white p-4 border-b border-gray-800">
      <h1 className="text-2xl font-bold">
        {fixture.homeTeam} vs {fixture.awayTeam}
      </h1>

      <p className="opacity-70 mt-1">
        {fixture.league} — {fixture.status}
      </p>
    </div>
  );
}
