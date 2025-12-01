import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Trophy } from 'lucide-react';
import GoldenBetsSection from '../components/sections/GoldenBetsSection';
import ValueBetsSection from '../components/sections/ValueBetsSection';
import BetBuilderSection from '../components/sections/BetBuilderSection';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
        
        {/* Animated glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg shadow-purple-500/50 mb-6 animate-fade-in">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            The Footy Oracle
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-100">
            AI-powered betting insights with proven track record
          </p>

          {/* Stats Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-fade-in-up animation-delay-200">
            <div className="px-6 py-3 rounded-full bg-purple-950/50 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Golden Bets</span>
              </div>
            </div>
            
            <div className="px-6 py-3 rounded-full bg-purple-950/50 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-white">Value Bets</span>
              </div>
            </div>
            
            <div className="px-6 py-3 rounded-full bg-purple-950/50 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-white">Bet Builders</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/fixtures')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-300"
          >
            Browse All Fixtures
          </button>
        </div>
      </section>

      {/* Golden Bets Section */}
      <div className="animate-fade-in-up animation-delay-400">
        <GoldenBetsSection />
      </div>

      {/* Value Bets Section */}
      <div className="animate-fade-in-up animation-delay-500">
        <ValueBetsSection />
      </div>

      {/* Bet Builder Section */}
      <div className="animate-fade-in-up animation-delay-600">
        <BetBuilderSection />
      </div>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center animate-fade-in-up animation-delay-700">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-purple-950/50 to-black border border-purple-500/30 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to explore more?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            View all upcoming fixtures with detailed AI predictions and betting insights
          </p>
          <button
            onClick={() => navigate('/fixtures')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
          >
            Browse All Fixtures
          </button>
        </div>
      </section>
    </div>
  );
}
