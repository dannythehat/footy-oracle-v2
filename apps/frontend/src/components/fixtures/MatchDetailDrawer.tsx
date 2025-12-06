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
      {/* Backdrop - Mobile optimized */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer - Black background with neon purple theme */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-black z-50 transform transition-transform duration-300 ease-out shadow-2xl border-t-2 border-purple-500 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          height: '95vh', 
          borderTopLeftRadius: '20px', 
          borderTopRightRadius: '20px',
          maxHeight: '95vh'
        }}
      >
        {/* Close Button - Neon purple theme */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-3 sm:right-3 p-3 sm:p-2 bg-purple-900/30 hover:bg-purple-800/50 active:bg-purple-700/50 rounded-full transition-all z-10 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center border border-purple-500/30"
          aria-label="Close"
        >
          <X className="w-6 h-6 sm:w-5 sm:h-5 text-purple-400" />
        </button>

        {/* Drag Handle - Neon purple */}
        <div className="flex justify-center pt-4 pb-3 sm:pt-3 sm:pb-2">
          <div className="w-16 h-1.5 sm:w-12 sm:h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
        </div>

        {/* Header - Mobile optimized */}
        <div className="flex-shrink-0">
          <MatchDetailHeader fixture={fixture} />
        </div>

        {/* Tabs - Mobile optimized */}
        <div className="flex-shrink-0">
          <MatchDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content - Scrollable with black background */}
        <div 
          className="overflow-y-auto bg-black overscroll-contain" 
          style={{ height: 'calc(95vh - 240px)' }}
        >
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default MatchDetailDrawer;
