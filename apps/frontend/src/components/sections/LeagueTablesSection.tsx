import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagueTables } from '../../hooks/useLeagueTables';
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import Premium3DCard from '../Premium3DCard';

export default function LeagueTablesSection() {
  const navigate = useNavigate();
  const { data: tables, isLoading } = useLeagueTables('All');

  const topGoalsOver = tables?.goals?.over_2_5?.slice(0, 5) || [];
  const topBTTS = tables?.btts?.yes?.slice(0, 5) || [];
  const topCorners = tables?.corners?.over_9_5?.slice(0, 5) || [];
  const topCards = tables?.cards?.over_3_5?.slice(0, 5) || [];

  return (
    <section className="max-w-7xl mx-auto mt-20 px-4 animate-fade-in">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl shadow-purple-500/50 mb-6 transform hover:scale-110 transition-transform duration-300">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent mb-4">
          League Tables
        </h2>
        
        <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-6">
          Top performing teams across all markets
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative h-80 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black border border-purple-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Goals Over 2.5 */}
            <Premium3DCard glowColor="purple" className="p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Goals Over 2.5
              </h3>
              <div className="space-y-3">
                {topGoalsOver.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-purple-500/10">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{entry.team}</div>
                      <div className="text-xs text-zinc-500">{entry.league}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-300">{entry.percentage.toFixed(0)}%</div>
                      <div className="text-xs text-zinc-500">{entry.games} games</div>
                    </div>
                  </div>
                ))}
              </div>
            </Premium3DCard>

            {/* BTTS */}
            <Premium3DCard glowColor="purple" className="p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Both Teams to Score
              </h3>
              <div className="space-y-3">
                {topBTTS.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-purple-500/10">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{entry.team}</div>
                      <div className="text-xs text-zinc-500">{entry.league}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-300">{entry.percentage.toFixed(0)}%</div>
                      <div className="text-xs text-zinc-500">{entry.games} games</div>
                    </div>
                  </div>
                ))}
              </div>
            </Premium3DCard>

            {/* Corners */}
            <Premium3DCard glowColor="purple" className="p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Corners Over 9.5
              </h3>
              <div className="space-y-3">
                {topCorners.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-purple-500/10">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{entry.team}</div>
                      <div className="text-xs text-zinc-500">{entry.league}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-300">{entry.percentage.toFixed(0)}%</div>
                      <div className="text-xs text-zinc-500">{entry.games} games</div>
                    </div>
                  </div>
                ))}
              </div>
            </Premium3DCard>

            {/* Cards */}
            <Premium3DCard glowColor="purple" className="p-6">
              <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Cards Over 3.5
              </h3>
              <div className="space-y-3">
                {topCards.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/50 border border-purple-500/10">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{entry.team}</div>
                      <div className="text-xs text-zinc-500">{entry.league}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-300">{entry.percentage.toFixed(0)}%</div>
                      <div className="text-xs text-zinc-500">{entry.games} games</div>
                    </div>
                  </div>
                ))}
              </div>
            </Premium3DCard>
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/league-tables')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              View All League Tables
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
