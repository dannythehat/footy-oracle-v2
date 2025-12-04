import React, { useState } from 'react';
import { X } from 'lucide-react';
import MatchDetailHeader from './MatchDetailHeader';
import MatchDetailTabs from './MatchDetailTabs';
import MatchOdds from './tabs/MatchOdds';
import MatchStats from './tabs/MatchStats';
import MatchEvents from './tabs/MatchEvents';
import MatchH2H from './tabs/MatchH2H';
import MatchStandings from './tabs/MatchStandings';

interface MatchDetailDrawerProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'match' | 'events' | 'odds' | 'h2h' | 'standings';

const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({ fixture, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  // CRITICAL: Do NOT render until we have valid fixture data
  // This prevents the drawer from opening with empty {} object
  if (!isOpen) return null;
  
  if (!fixture || (!fixture.fixtureId && !fixture.id)) {
    console.warn('⚠️ MatchDetailDrawer: No valid fixture data, not rendering');
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'match':
        return <MatchStats fixture={fixture} />;
      case 'events':
        return <MatchEvents fixture={fixture} />;
      case 'odds':
        return <MatchOdds fixture={fixture} />;
      case 'h2h':
        return <MatchH2H fixture={fixture} />;
      case 'standings':
        return <MatchStandings fixture={fixture} />;
      default:
        return <MatchEvents fixture={fixture} />;
    }
  };

  return (
    <>
      {/* Backdrop - Enhanced */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer - Full height with proper scrolling */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-900 rounded-t-3xl z-50 transform transition-transform duration-300 ease-out shadow-2xl border-t-2 border-purple-500/30 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '95vh' }}
      >
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

        {/* Close Button - Enhanced */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800/80 rounded-full transition-all z-10 shadow-lg hover:shadow-purple-500/50 backdrop-blur-sm border border-gray-700/50"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        {/* Drag Handle - Enhanced */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-600 rounded-full shadow-lg" />
        </div>

        {/* Header - Fixed at top */}
        <div className="flex-shrink-0">
          <MatchDetailHeader fixture={fixture} />
        </div>

        {/* Tabs - Fixed below header */}
        <div className="flex-shrink-0">
          <MatchDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content - Scrollable area */}
        <div className="overflow-y-auto" style={{ height: 'calc(95vh - 220px)' }}>
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default MatchDetailDrawer;
