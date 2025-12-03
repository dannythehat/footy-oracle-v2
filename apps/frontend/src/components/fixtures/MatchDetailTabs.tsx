import React from 'react';
import { BarChart3, TrendingUp, History, Trophy, Activity } from 'lucide-react';

interface MatchDetailTabsProps {
  activeTab: 'match' | 'events' | 'odds' | 'h2h' | 'standings';
  onTabChange: (tab: 'match' | 'events' | 'odds' | 'h2h' | 'standings') => void;
}

const MatchDetailTabs: React.FC<MatchDetailTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'match' as const, label: 'Stats', icon: BarChart3 },
    { id: 'events' as const, label: 'Events', icon: Activity },
    { id: 'odds' as const, label: 'Odds', icon: TrendingUp },
    { id: 'h2h' as const, label: 'H2H', icon: History },
    { id: 'standings' as const, label: 'Table', icon: Trophy },
  ];

  return (
    <div className="sticky top-0 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-md border-b border-gray-700/50 z-10 shadow-lg">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 font-medium transition-all duration-200 relative group ${
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-gray-300 hover:-translate-y-0.5'
              }`}
            >
              {/* Active indicator with glow */}
              {isActive && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-lg shadow-purple-500/50"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                </>
              )}

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-gray-700/0 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}

              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'drop-shadow-lg' : ''}`} />
              <span className={`text-xs sm:text-sm relative z-10 ${isActive ? 'drop-shadow-lg' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MatchDetailTabs;
