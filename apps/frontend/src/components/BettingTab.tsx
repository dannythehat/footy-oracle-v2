import React, { useState } from 'react';
import { Star, TrendingUp, Eye, EyeOff, Sparkles } from 'lucide-react';

interface BettingInsight {
  percentage: number;
  confidence: 'high' | 'medium' | 'low';
  revealed: boolean;
}

interface GoldenBet {
  type: 'bts' | 'over25' | 'over35cards' | 'over95corners';
  percentage: number;
  reasoning: string;
  revealed: boolean;
}

interface AIBets {
  bts: BettingInsight;
  over25: BettingInsight;
  over35cards: BettingInsight;
  over95corners: BettingInsight;
  goldenBet: GoldenBet;
  generatedAt?: Date;
}

interface BettingTabProps {
  aiBets?: AIBets;
  onRevealBet: (betType: string) => void;
  onRevealGolden: () => void;
}

const BettingTab: React.FC<BettingTabProps> = ({ 
  aiBets, 
  onRevealBet, 
  onRevealGolden 
}) => {
  const [revealedBets, setRevealedBets] = useState<Set<string>>(new Set());
  const [goldenRevealed, setGoldenRevealed] = useState(false);

  if (!aiBets) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400/50" />
          <p className="text-lg font-semibold">AI Betting Insights Coming Soon</p>
          <p className="text-sm mt-2">
            Insights are generated 48 hours before kickoff
          </p>
        </div>
      </div>
    );
  }

  const betTypes = [
    { 
      id: 'bts', 
      label: 'Both Teams to Score', 
      shortLabel: 'BTS',
      icon: '⚽',
      data: aiBets.bts 
    },
    { 
      id: 'over25', 
      label: 'Over 2.5 Goals', 
      shortLabel: 'O2.5',
      icon: '🎯',
      data: aiBets.over25 
    },
    { 
      id: 'over35cards', 
      label: 'Over 3.5 Cards', 
      shortLabel: 'O3.5 Cards',
      icon: '🟨',
      data: aiBets.over35cards 
    },
    { 
      id: 'over95corners', 
      label: 'Over 9.5 Corners', 
      shortLabel: 'O9.5 Corners',
      icon: '🚩',
      data: aiBets.over95corners 
    }
  ];

  const handleRevealBet = (betId: string) => {
    setRevealedBets(prev => new Set(prev).add(betId));
    onRevealBet(betId);
  };

  const handleRevealGolden = () => {
    setGoldenRevealed(true);
    onRevealGolden();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const isGoldenBet = (betId: string) => {
    return aiBets.goldenBet.type === betId;
  };

  return (
    <div className="space-y-6">
      {/* Bet Type Buttons */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          AI Betting Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {betTypes.map((bet) => {
            const isRevealed = revealedBets.has(bet.id) || bet.data.revealed;
            const isGolden = isGoldenBet(bet.id);

            return (
              <button
                key={bet.id}
                onClick={() => !isRevealed && handleRevealBet(bet.id)}
                disabled={isRevealed}
                className={`relative p-4 rounded-lg border transition-all ${
                  isGolden
                    ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50'
                    : 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40'
                } ${isRevealed ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'}`}
              >
                {/* Golden Badge */}
                {isGolden && (
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{bet.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{bet.label}</div>
                      <div className="text-xs text-gray-500">{bet.shortLabel}</div>
                    </div>
                  </div>
                  {!isRevealed && (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {isRevealed ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-400">
                        {bet.data.percentage}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getConfidenceColor(bet.data.confidence)}`}>
                        {bet.data.confidence.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${bet.data.percentage}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Eye className="w-6 h-6 mx-auto text-gray-500 mb-1" />
                    <p className="text-xs text-gray-500">Click to reveal AI %</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Golden Bet Section */}
      <div className="border-t border-purple-500/20 pt-6">
        <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 fill-yellow-400" />
          Golden Bet
        </h3>
        
        {goldenRevealed || aiBets.goldenBet.revealed ? (
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-lg p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-yellow-400">
                    {betTypes.find(b => b.id === aiBets.goldenBet.type)?.label}
                  </span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {aiBets.goldenBet.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full"
                    style={{ width: `${aiBets.goldenBet.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">AI Reasoning</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {aiBets.goldenBet.reasoning}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleRevealGolden}
            className="w-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-yellow-400">Reveal Golden Bet</span>
            </div>
            <p className="text-sm text-gray-400">
              Discover our highest confidence pick with AI reasoning
            </p>
          </button>
        )}
      </div>

      {/* Info Footer */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-purple-500/10">
        <p>
          AI insights generated {aiBets.generatedAt ? new Date(aiBets.generatedAt).toLocaleString() : '48 hours before kickoff'}
        </p>
      </div>
    </div>
  );
};

export default BettingTab;
