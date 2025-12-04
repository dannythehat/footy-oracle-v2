import React, { useState } from 'react';
import { X } from 'lucide-react';
import MatchDetailHeader from './MatchDetailHeader';
import MatchDetailTabs from './MatchDetailTabs';
import MatchSummary from './tabs/MatchSummary';
import MatchOdds from './tabs/MatchOdds';
import MatchH2H from './tabs/MatchH2H';

interface MatchDetailDrawerProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'summary' | 'odds' | 'h2h';

const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({ fixture, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // CRITICAL: Do NOT render until we have valid fixture data
  if (!isOpen) return null;
  
  if (!fixture || (!fixture.fixtureId && !fixture.id)) {
    console.warn('⚠️ MatchDetailDrawer: No valid fixture data, not rendering');
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <MatchSummary fixture={fixture} />;
      case 'odds':
        return <MatchOdds fixture={fixture} />;
      case 'h2h':
        return <MatchH2H fixture={fixture} />;
      default:
        return <MatchSummary fixture={fixture} />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '95vh', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0">
          <MatchDetailHeader fixture={fixture} />
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0">
          <MatchDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content - Scrollable */}
        <div className="overflow-y-auto bg-gray-50" style={{ height: 'calc(95vh - 220px)' }}>
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default MatchDetailDrawer;
