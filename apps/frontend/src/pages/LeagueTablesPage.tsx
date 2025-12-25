import React, { useState } from 'react';
import { useLeagueTables } from '../hooks/useLeagueTables';
import { TrendingUp, Trophy, Target } from 'lucide-react';
import Premium3DCard from '../components/Premium3DCard';

export default function LeagueTablesPage() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState<'goals' | 'btts' | 'corners' | 'cards'>('goals');
  const [selectedStat, setSelectedStat] = useState('over_2_5');
  
  const { data: tables, isLoading } = useLeagueTables(selectedRegion);

  const regions = ['All', 'Europe', 'Asia', 'Americas'];
  
  const marketOptions = {
    goals: ['over_1_5', 'over_2_5', 'over_3_5', 'under_1_5', 'under_2_5', 'under_3_5'],
    btts: ['yes', 'no'],
    corners: ['over_8_5', 'over_9_5', 'over_10_5', 'over_11_5', 'over_12_5', 'under_8_5', 'under_9_5', 'under_10_5'],
    cards: ['over_3_5', 'over_4_5', 'over_5_5', 'under_3_5', 'under_4_5']
  };

  const formatStatName = (stat: string) => {
    return stat
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const currentData = tables?.[selectedMarket]?.[selectedStat] || [];

  return (
    <div className="min-h-screen bg-[#0a0015] text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl font-bold">League Tables</h1>
        </div>
        <p className="text-zinc-400 text-lg">
          Statistical performance rankings across all markets
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <Premium3DCard glowColor="purple" className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Region */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Market */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Market</label>
              <select
                value={selectedMarket}
                onChange={(e) => {
                  const market = e.target.value as 'goals' | 'btts' | 'corners' | 'cards';
                  setSelectedMarket(market);
                  setSelectedStat(marketOptions[market][0]);
                }}
                className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              >
                <option value="goals">Goals</option>
                <option value="btts">BTTS</option>
                <option value="corners">Corners</option>
                <option value="cards">Cards</option>
              </select>
            </div>

            {/* Stat Type */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Stat</label>
              <select
                value={selectedStat}
                onChange={(e) => setSelectedStat(e.target.value)}
                className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              >
                {marketOptions[selectedMarket].map(stat => (
                  <option key={stat} value={stat}>{formatStatName(stat)}</option>
                ))}
              </select>
            </div>
          </div>
        </Premium3DCard>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-zinc-400">Loading tables...</p>
          </div>
        ) : (
          <Premium3DCard glowColor="purple" className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-zinc-400">Rank</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-zinc-400">Team</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-zinc-400">League</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-zinc-400">Games</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-zinc-400">Success Rate</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-zinc-400">Avg Value</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.slice(0, 50).map((entry, idx) => (
                    <tr 
                      key={`${entry.team}-${idx}`}
                      className="border-b border-zinc-800 hover:bg-purple-500/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {idx < 3 && <Trophy className="w-4 h-4 text-yellow-400" />}
                          <span className="text-white font-semibold">#{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white font-medium">{entry.team}</td>
                      <td className="py-4 px-4 text-zinc-400 text-sm">{entry.league}</td>
                      <td className="py-4 px-4 text-center text-zinc-300">{entry.games}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-[100px] bg-zinc-800 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                              style={{ width: `${entry.percentage}%` }}
                            />
                          </div>
                          <span className="text-purple-300 font-semibold">{entry.percentage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-white font-semibold">
                        {entry.avgValue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Premium3DCard>
        )}
      </div>
    </div>
  );
}
