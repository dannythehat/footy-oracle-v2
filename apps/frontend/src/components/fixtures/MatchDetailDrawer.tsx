import React, { useState } from 'react';
import { X } from 'lucide-react';
import MatchDetailHeader from './MatchDetailHeader';
import MatchDetailTabs from './MatchDetailTabs';
import MatchOdds from './tabs/MatchOdds';
import MatchStats from './tabs/MatchStats';
import MatchH2H from './tabs/MatchH2H';
import MatchStandings from './tabs/MatchStandings';

interface MatchDetailDrawerProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'match' | 'odds' | 'h2h' | 'standings';

const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({ fixture, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('odds');

  if (!isOpen || !fixture) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'match':
        return <MatchStats fixture={fixture} />;
      case 'odds':
        return <MatchOdds fixture={fixture} />;
      case 'h2h':
        return <MatchH2H fixture={fixture} />;
      case 'standings':
        return <MatchStandings fixture={fixture} />;
      default:
        return <MatchOdds fixture={fixture} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-t-3xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <MatchDetailHeader fixture={fixture} />

        {/* Tabs */}
        <MatchDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default MatchDetailDrawer;
