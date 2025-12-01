import React from 'react';
import { BarChart3, TrendingUp, History, Trophy } from 'lucide-react';

interface MatchDetailTabsProps {
  activeTab: 'match' | 'odds' | 'h2h' | 'standings';
  onTabChange: (tab: 'match' | 'odds' | 'h2h' | 'standings') => void;
}

const MatchDetailTabs: React.FC<MatchDetailTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'match' as const, label: 'Match', icon: BarChart3 },
    { id: 'odds' as const, label: 'Odds', icon: TrendingUp },
    { id: 'h2h' as const, label: 'H2H', icon: History },
    { id: 'standings' as const, label: 'Standings', icon: Trophy },
  ];

  return (
    <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-10">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                isActive
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MatchDetailTabs;
