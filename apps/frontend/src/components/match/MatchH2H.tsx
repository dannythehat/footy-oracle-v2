export default function MatchH2H({ h2h }) {
  if (!h2h || !h2h.matches) return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-3">Head to Head</h2>

      <ul className="space-y-2">
        {h2h.matches.map((m, i) => (
          <li key={i} className="bg-gray-800 p-2 rounded">
            {m.homeTeam} {m.score.home} - {m.score.away} {m.awayTeam}
            <div className="opacity-60 text-sm">{m.league}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
