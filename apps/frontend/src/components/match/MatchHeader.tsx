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
    <div className="bg-[#0a0a0a] text-white p-4 border border-gray-800 rounded-lg mb-4">
      <h1 className="text-2xl font-bold text-white">
        {homeTeam} <span className="text-purple-500">vs</span> {awayTeam}
      </h1>

      <p className="text-gray-400 mt-2 text-sm">
        {league} {status && `• ${status}`}
      </p>
    </div>
  );
}
