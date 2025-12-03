interface MatchHeaderProps {
  fixture: any;
}

export default function MatchHeader({ fixture }: MatchHeaderProps) {
  if (!fixture) return null;

  const homeTeam = fixture.homeTeam || fixture.homeTeamName || 'Home';
  const awayTeam = fixture.awayTeam || fixture.awayTeamName || 'Away';
  const league = fixture.league || fixture.leagueName || '';
  const status = fixture.status || fixture.statusShort || '';

  return (
    <div className="text-white p-4 border-b border-gray-800">
      <h1 className="text-2xl font-bold">
        {homeTeam} vs {awayTeam}
      </h1>

      <p className="opacity-70 mt-1">
        {league} — {status}
      </p>
    </div>
  );
}
