import React from "react";

interface MatchLineupsProps {
  lineups?: any;
}

const MatchLineups: React.FC<MatchLineupsProps> = ({ lineups }) => {
  if (!lineups) {
    return (
      <div className="p-4 text-gray-400">
        Lineups not available.
      </div>
    );
  }

  return (
    <div className="p-4 text-gray-200">
      <pre>{JSON.stringify(lineups, null, 2)}</pre>
    </div>
  );
};

export default MatchLineups;
