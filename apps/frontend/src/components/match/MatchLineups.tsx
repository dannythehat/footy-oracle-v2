export default function MatchLineups({ lineups }) {
  if (!lineups) return null;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-3">Lineups</h2>

      <pre className="bg-gray-800 p-3 rounded">
        {JSON.stringify(lineups, null, 2)}
      </pre>
    </div>
  );
}
