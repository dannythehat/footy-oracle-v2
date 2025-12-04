import React, { useState } from 'react';
import MatchStats from './MatchStats';
import MatchEvents from './MatchEvents';
import MatchStandings from './MatchStandings';

interface MatchSummaryProps {
  fixture: any;
}

type SubTab = 'overall' | 'home' | 'away';

const MatchSummary: React.FC<MatchSummaryProps> = ({ fixture }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overall');

  const subTabs = [
    { id: 'overall' as const, label: 'OVERALL' },
    { id: 'home' as const, label: `${fixture.homeTeamName || fixture.homeTeam || 'HOME'}` },
    { id: 'away' as const, label: `${fixture.awayTeamName || fixture.awayTeam || 'AWAY'}` },
  ];

  return (
    <div className="bg-gray-50">
      {/* Secondary Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex gap-2 px-4 py-2">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-4">
        {/* Match Stats Section */}
        {activeSubTab === 'overall' && (
          <>
            <MatchStats fixture={fixture} />
            <MatchEvents fixture={fixture} />
          </>
        )}

        {/* Home Team Section */}
        {activeSubTab === 'home' && (
          <div className="space-y-4">
            {/* Last Matches Header */}
            <div className="bg-gray-200 px-4 py-2 rounded">
              <h3 className="text-xs font-semibold text-gray-700 uppercase">
                Last Matches: {fixture.homeTeamName || fixture.homeTeam}
              </h3>
            </div>
            
            {/* Placeholder for last matches */}
            <div className="bg-white rounded-lg p-4 text-center text-gray-500 text-sm">
              Last matches data coming soon
            </div>

            {/* Standings */}
            <MatchStandings fixture={fixture} />
          </div>
        )}

        {/* Away Team Section */}
        {activeSubTab === 'away' && (
          <div className="space-y-4">
            {/* Last Matches Header */}
            <div className="bg-gray-200 px-4 py-2 rounded">
              <h3 className="text-xs font-semibold text-gray-700 uppercase">
                Last Matches: {fixture.awayTeamName || fixture.awayTeam}
              </h3>
            </div>
            
            {/* Placeholder for last matches */}
            <div className="bg-white rounded-lg p-4 text-center text-gray-500 text-sm">
              Last matches data coming soon
            </div>

            {/* Standings */}
            <MatchStandings fixture={fixture} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchSummary;
