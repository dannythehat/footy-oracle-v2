import React from 'react';
import { Brain, TrendingUp, Target, Clock, Trophy, Zap } from 'lucide-react';

interface MarketPrediction {
  market: string;
  marketName: string;
  confidence: number;
  probability: number;
  estimatedOdds: number;
}

interface BetBuilder {
  _id: string;
  fixtureId: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  markets: MarketPrediction[];
  combinedConfidence: number;
  estimatedCombinedOdds: number;
  aiReasoning?: string;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
}

interface BetBuilderCardProps {
  betBuilder: BetBuilder;
}

const BetBuilderCard: React.FC<BetBuilderCardProps> = ({ betBuilder }) => {
  const {
    homeTeam,
    awayTeam,
    league,
    kickoff,
    markets,
    combinedConfidence,
    estimatedCombinedOdds,
    aiReasoning,
    result,
    profit,
  } = betBuilder;

  const kickoffTime = new Date(kickoff).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getResultBadge = () => {
    if (!result || result === 'pending') return null;
    
    return (
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
        result === 'win' 
          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
          : 'bg-red-500/20 text-red-400 border border-red-500/50'
      }`}>
        {result === 'win' ? '✓ WON' : '✗ LOST'}
        {profit !== undefined && (
          <span className="ml-2">
            {profit > 0 ? '+' : ''}{profit.toFixed(2)}€
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 group">
      {/* Brain Badge */}
      <div className="absolute -top-3 -left-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
        <Brain className="w-6 h-6 text-white" />
      </div>

      {getResultBadge()}

      {/* Header */}
      <div className="mt-2 mb-4">
        <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
          <Trophy className="w-4 h-4" />
          <span className="font-semibold">{league}</span>
          <span className="text-gray-500">•</span>
          <Clock className="w-4 h-4" />
          <span>{kickoffTime}</span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-1">
          {homeTeam} <span className="text-purple-400">vs</span> {awayTeam}
        </h3>
      </div>

      {/* Markets Grid */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-purple-300 mb-2">
          <Target className="w-4 h-4" />
          <span>Multi-Market Convergence ({markets.length} Markets)</span>
        </div>
        
        {markets.map((market, index) => (
          <div
            key={index}
            className="bg-black/40 border border-purple-500/20 rounded-lg p-3 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{market.marketName}</span>
              <span className="text-purple-400 font-bold text-lg">
                {market.estimatedOdds.toFixed(2)}
              </span>
            </div>
            
            {/* Confidence Bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${market.confidence}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">AI Confidence</span>
              <span className="text-xs font-bold text-purple-300">
                {market.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-sm mb-1">
            <Zap className="w-4 h-4" />
            <span>Combined Confidence</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {combinedConfidence}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Combined Odds</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {estimatedCombinedOdds.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Potential Return */}
      <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-semibold">€10 Stake Returns:</span>
          <span className="text-2xl font-bold text-yellow-300">
            €{(10 * estimatedCombinedOdds).toFixed(2)}
          </span>
        </div>
        <div className="text-right text-sm text-yellow-400/70 mt-1">
          Profit: €{(10 * estimatedCombinedOdds - 10).toFixed(2)}
        </div>
      </div>

      {/* AI Reasoning */}
      {aiReasoning && (
        <div className="mt-4 p-4 bg-black/40 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <Brain className="w-4 h-4" />
            <span>AI Analysis</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {aiReasoning}
          </p>
        </div>
      )}

      {/* Convergence Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-400">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <span className="font-semibold">MULTI-MARKET CONVERGENCE</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
    </div>
  );
};

export default BetBuilderCard;
