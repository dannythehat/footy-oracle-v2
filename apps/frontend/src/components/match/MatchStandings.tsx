export default function MatchStandings({ standings }) {
  if (!standings) return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-3">League Table</h2>

      <ul className="space-y-2">
        {standings.map((t, i) => (
          <li key={i} className="bg-gray-800 p-2 rounded">
            {i + 1}. {t.team} — {t.points} pts
          </li>
        ))}
      </ul>
    </div>
  );
}
