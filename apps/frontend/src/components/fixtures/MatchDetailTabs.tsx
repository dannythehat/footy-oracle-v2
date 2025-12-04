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
              className={`flex items-center justify-center gap-2 py-3 px-6 font-semibold text-sm transition-all relative ${
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MatchDetailTabs;
