import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: goldenBetsData } = useQuery({
    queryKey: ['golden-bets'],
    queryFn: api.goldenBetsToday,
  });

  const { data: betBuilderData } = useQuery({
    queryKey: ['bet-builder'],
    queryFn: api.betBuilderToday,
  });

  const { data: fixturesData } = useQuery({
    queryKey: ['fixtures-today'],
    queryFn: api.fixturesToday,
  });

  const { data: pnlData } = useQuery({
    queryKey: ['pnl-summary'],
    queryFn: api.pnlSummary,
  });

  const goldenBets = goldenBetsData?.top3 || [];
  const betBuilder = betBuilderData?.betBuilder;
  const fixtures = fixturesData?.fixtures || [];
  const totalPredictions = fixtures.length;
  const avgConfidence = goldenBets.length > 0
    ? (goldenBets.reduce((sum, bet) => sum + bet.confidence, 0) / goldenBets.length).toFixed(1)
    : '0.0';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black text-[#00dd00]">
      {/* Header */}
      <header className="border-b-2 border-[#00dd00]/30 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00dd00]/10 flex items-center justify-center border-2 border-[#00dd00]/50">
                <span className="text-2xl">🔮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#00dd00] tracking-wider font-mono">THE FOOTY ORACLE</h1>
                <p className="text-xs text-[#00dd00]/60">AI-Powered Betting Intelligence</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-[#00dd00]/60 mb-1 font-mono">SYSTEM TIME</div>
              <div className="text-xl font-mono text-[#00dd00] font-bold">{formatTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b-2 border-[#00dd00]/30 bg-black/95">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex gap-2 overflow-x-auto">
            <Link to="/" className="px-6 py-3 bg-[#00dd00] text-black font-bold rounded-lg flex items-center gap-2 whitespace-nowrap">
              <span>🏠</span> HOME
            </Link>
            <Link to="/fixtures" className="px-6 py-3 border-2 border-[#00dd00]/50 text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all">
              <span>🌐</span> FIXTURES
            </Link>
            <Link to="/golden-bets" className="px-6 py-3 border-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all">
              <span>⭐</span> GOLDEN BETS
            </Link>
            <Link to="/bet-builders" className="px-6 py-3 border-2 border-[#00dd00]/50 text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all">
              <span>🎯</span> BET BUILDERS
            </Link>
            <Link to="/league-tables" className="px-6 py-3 border-2 border-[#00dd00]/50 text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all">
              <span>📊</span> LEAGUE TABLES
            </Link>
            <Link to="/pnl-hub" className="px-6 py-3 border-2 border-[#00dd00]/50 text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all">
              <span>💰</span> P&L HUB
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Banner */}
        <div className="mb-8 p-8 border-2 border-[#00dd00]/50 rounded-lg bg-[#00dd00]/5">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🔮</span>
            <h2 className="text-4xl font-bold text-[#00dd00] font-mono">TODAY'S BETTING INTELLIGENCE</h2>
          </div>
          <p className="text-[#00dd00]/70 text-lg">Powered by v29 Anti-Leak ML Models • 75% Historical Accuracy</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
            <div className="text-5xl font-bold text-[#00dd00] mb-2">{fixtures.length}</div>
            <div className="text-[#00dd00]/70 uppercase tracking-wider">Today's Fixtures</div>
          </div>
          
          <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
            <div className="text-5xl font-bold text-[#00dd00] mb-2">{totalPredictions}</div>
            <div className="text-[#00dd00]/70 uppercase tracking-wider">Total Predictions</div>
          </div>
          
          <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
            <div className="text-5xl font-bold text-[#00dd00] mb-2">{avgConfidence}%</div>
            <div className="text-[#00dd00]/70 uppercase tracking-wider">Avg Confidence</div>
          </div>
        </div>

        {/* Golden Bets Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <h3 className="text-3xl font-bold text-yellow-500 font-mono">TODAY'S GOLDEN BETS</h3>
            </div>
            <Link to="/golden-bets" className="px-4 py-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-bold rounded-lg transition-all">
              VIEW ALL BETS →
            </Link>
          </div>
          
          <div className="p-8 border-2 border-yellow-500/50 rounded-lg bg-yellow-500/5">
            {goldenBets.length > 0 ? (
              <div className="space-y-4">
                {goldenBets.map((bet, idx) => (
                  <div key={bet.id} className="p-6 border-2 border-yellow-500/30 rounded-lg bg-black hover:bg-yellow-500/5 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-xl font-bold text-yellow-400 mb-2">
                          {bet.homeTeam} vs {bet.awayTeam}
                        </div>
                        <div className="text-sm text-[#00dd00]/70">{bet.league}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-yellow-400">{bet.confidence.toFixed(1)}%</div>
                        <div className="text-sm text-[#00dd00]/70">Confidence</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 font-bold text-sm uppercase">
                        {bet.market}
                      </span>
                    </div>
                    <div className="text-[#00dd00]/80 text-sm leading-relaxed">
                      {bet.aiExplanation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-yellow-500/50">
                No golden bets available yet today
              </div>
            )}
          </div>
        </div>

        {/* Bet Builder of the Day */}
        {betBuilder && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h3 className="text-3xl font-bold text-[#00dd00] font-mono">BET BUILDER OF THE DAY</h3>
            </div>
            
            <div className="p-8 border-2 border-[#00dd00]/50 rounded-lg bg-[#00dd00]/5">
              <div className="mb-6">
                <div className="text-2xl font-bold text-[#00dd00] mb-2">
                  {betBuilder.homeTeam} vs {betBuilder.awayTeam}
                </div>
                <div className="text-sm text-[#00dd00]/70">{betBuilder.league}</div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {betBuilder.markets?.map((market, idx) => (
                  <div key={idx} className="p-4 border border-[#00dd00]/30 rounded bg-black">
                    <div className="text-lg font-bold text-[#00dd00] mb-1 uppercase">{market.market}</div>
                    <div className="text-[#00dd00]/70">Confidence: {market.confidence?.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="text-[#00dd00]/70 text-sm">Combined Odds:</span>
                  <span className="ml-2 text-2xl font-bold text-[#00dd00]">{betBuilder.combinedOdds}</span>
                </div>
                <div>
                  <span className="text-[#00dd00]/70 text-sm">Confidence:</span>
                  <span className="ml-2 text-2xl font-bold text-[#00dd00]">{betBuilder.confidence?.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="text-[#00dd00]/80 text-sm">
                {betBuilder.aiExplanation}
              </div>
            </div>
          </div>
        )}

        {/* P&L Summary Widget */}
        {pnlData && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <h3 className="text-3xl font-bold text-[#00dd00] font-mono">P&L SUMMARY</h3>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
                <div className={`text-3xl font-bold mb-2 ${pnlData.totalProfitLoss >= 0 ? 'text-[#00dd00]' : 'text-red-500'}`}>
                  £{pnlData.totalProfitLoss?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[#00dd00]/70 text-sm uppercase">Total P&L</div>
              </div>
              
              <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
                <div className="text-3xl font-bold text-[#00dd00] mb-2">
                  {pnlData.winRate?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-[#00dd00]/70 text-sm uppercase">Win Rate</div>
              </div>
              
              <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
                <div className={`text-3xl font-bold mb-2 ${pnlData.roi >= 0 ? 'text-[#00dd00]' : 'text-red-500'}`}>
                  {pnlData.roi?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-[#00dd00]/70 text-sm uppercase">ROI</div>
              </div>
              
              <div className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black">
                <div className="text-3xl font-bold text-[#00dd00] mb-2">
                  {pnlData.totalBets || 0}
                </div>
                <div className="text-[#00dd00]/70 text-sm uppercase">Total Bets</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/pnl-hub" className="px-6 py-3 border-2 border-[#00dd00] text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg inline-block transition-all">
                VIEW FULL P&L HUB →
              </Link>
            </div>
          </div>
        )}

        {/* League Tables Preview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📊</span>
            <h3 className="text-3xl font-bold text-[#00dd00] font-mono">LEAGUE TABLES</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {['Over 2.5 Goals', 'Over 3.5 Goals', 'Over 4.5 Goals', 'Over 8.5 Corners', 'BTTS', 'Over 3.5 Cards'].map((table) => (
              <div key={table} className="p-6 border-2 border-[#00dd00]/50 rounded-lg bg-black hover:bg-[#00dd00]/5 transition-all cursor-pointer">
                <div className="text-lg font-bold text-[#00dd00]">{table}</div>
                <div className="text-sm text-[#00dd00]/70 mt-2">View team performance rankings</div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/league-tables" className="px-6 py-3 border-2 border-[#00dd00] text-[#00dd00] hover:bg-[#00dd00]/10 font-bold rounded-lg inline-block transition-all">
              VIEW ALL LEAGUE TABLES →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
