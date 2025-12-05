import React from 'react';
import { BarChart3, TrendingUp, History } from 'lucide-react';

interface MatchDetailTabsProps {
  activeTab: 'summary' | 'odds' | 'h2h';
  onTabChange: (tab: 'summary' | 'odds' | 'h2h') => void;
}

const MatchDetailTabs: React.FC<MatchDetailTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'summary' as const, label: 'SUMMARY', icon: BarChart3 },
    { id: 'odds' as const, label: 'ODDS', icon: TrendingUp },
    { id: 'h2h' as const, label: 'H2H', icon: History },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-2 sm:gap-1.5 py-4 px-6 sm:py-3 sm:px-4 font-semibold text-sm sm:text-xs transition-all relative flex-1 min-h-[56px] sm:min-h-0 ${
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-600 hover:text-gray-900 active:bg-gray-50'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
              
              {/* Active indicator - Mobile optimized */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-0.5 bg-pink-600"></div>
              )}
            </button>
          );
        })}\n      </div>
    </div>
  );
};

export default MatchDetailTabs;
