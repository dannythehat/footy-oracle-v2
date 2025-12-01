import React, { useState } from 'react';
import { Crown, Brain, TrendingUp, Target, Clock, Trophy, Zap, Share2, Copy, Check, Sparkles } from 'lucide-react';

interface MarketPrediction {
  market: string;
  marketName: string;
  confidence: number;
  probability: number;
  estimatedOdds: number;
}

interface BetBuilderOfTheDay {
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
  enhancedReasoning?: string;
  compositeScore?: number;
  result?: 'win' | 'loss' | 'pending';
  profit?: number;
}

interface BetBuilderOfTheDayProps {
  betBuilder: BetBuilderOfTheDay | null;
  loading?: boolean;
}

const BetBuilderOfTheDay: React.FC<BetBuilderOfTheDayProps> = ({ betBuilder, loading }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullReasoning, setShowFullReasoning] = useState(false);

  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-yellow-900/30 via-purple-900/30 to-pink-900/30 border-2 border-yellow-500/50 rounded-xl p-8 animate-pulse">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
          <div className="h-8 bg-yellow-500/20 rounded w-64"></div>
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-purple-500/20 rounded w-3/4"></div>
          <div className="h-4 bg-purple-500/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!betBuilder) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-xl p-8 text-center">
        <Crown className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-purple-300 mb-2">
          No Bet Builder of the Day
        </h3>
        <p className="text-gray-400">
          Check back tomorrow for our ML-selected premium pick!
        </p>
      </div>
    );
  }

  const {
    homeTeam,
    awayTeam,
    league,
    kickoff,
    markets,
    combinedConfidence,
    estimatedCombinedOdds,
    enhancedReasoning,
    compositeScore,
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
      <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${
        result === 'win' 
          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
          : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
      }`}>
        {result === 'win' ? '✓ WON' : '✗ LOST'}
        {profit !== undefined && profit !== null && (
          <span className="ml-2">
            {profit > 0 ? '+' : ''}{profit.toFixed(2)}€
          </span>
        )}
      </div>
    );
  };

  const generateShareText = () => {
    const marketsList = markets?.map(m => `${m.marketName} (${m.confidence ?? 0}%)`).join(', ') ?? '';
    const oddsText = estimatedCombinedOdds ? estimatedCombinedOdds.toFixed(2) : 'N/A';
    const returnText = estimatedCombinedOdds ? (10 * estimatedCombinedOdds).toFixed(2) : 'N/A';
    const scoreText = compositeScore ? compositeScore.toFixed(2) : 'N/A';
    
    return `👑 BET BUILDER OF THE DAY 👑\n\n${homeTeam} vs ${awayTeam}\n${league} • ${kickoffTime}\n\nMarkets: ${marketsList}\n\nCombined Confidence: ${combinedConfidence ?? 0}%\nCombined Odds: ${oddsText}x\n€10 → €${returnText}\n\nML Composite Score: ${scoreText}/100\n\n#FootyOracle #BetBuilderOfTheDay`;
  };

  const handleShare = (platform: string) => {
    const text = generateShareText();
    const url = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(text + '\n' + url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="relative bg-gradient-to-br from-yellow-900/20 via-purple-900/30 to-pink-900/20 border-4 border-yellow-500/60 rounded-2xl p-8 hover:border-yellow-400/80 hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] transition-all duration-300 group">
      {/* Premium Crown Badge */}
      <div className="absolute -top-5 -left-5 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full p-4 shadow-2xl shadow-yellow-500/50 group-hover:scale-110 transition-transform animate-pulse">
        <Crown className="w-8 h-8 text-white" />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute top-4 right-20 animate-bounce">
        <Sparkles className="w-6 h-6 text-yellow-400" />
      </div>

      {/* Share Button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-yellow-600/80 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors shadow-lg"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        
        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute top-12 left-0 bg-gray-900 border-2 border-yellow-500/50 rounded-lg shadow-2xl p-2 z-10 min-w-[160px]">
            <button
              onClick={() => handleShare('twitter')}
              className="w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded text-sm text-white flex items-center gap-2"
            >
              <span>🐦</span> Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded text-sm text-white flex items-center gap-2"
            >
              <span>📘</span> Facebook
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded text-sm text-white flex items-center gap-2"
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded text-sm text-white flex items-center gap-2"
            >
              <span>✈️</span> Telegram
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-full text-left px-3 py-2 hover:bg-yellow-600/20 rounded text-sm text-white flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>

      {getResultBadge()}

      {/* Premium Header */}
      <div className="mt-4 mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400">
            BET BUILDER OF THE DAY
          </h2>
          <Crown className="w-6 h-6 text-yellow-400" />
        </div>
        
        <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm mb-3">
          <Trophy className="w-4 h-4" />
          <span className="font-semibold">{league}</span>
          <span className="text-gray-500">•</span>
          <Clock className="w-4 h-4" />
          <span>{kickoffTime}</span>
        </div>
        
        <h3 className="text-3xl font-bold text-white mb-2">
          {homeTeam} <span className="text-yellow-400">vs</span> {awayTeam}
        </h3>

        {/* ML Composite Score */}
        {compositeScore !== undefined && compositeScore !== null && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full mt-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-semibold">
              ML Composite Score: <span className="text-purple-100 font-bold">{compositeScore.toFixed(2)}/100</span>
            </span>
          </div>
        )}
      </div>

      {/* Markets Grid */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-yellow-300 mb-3">
          <Target className="w-5 h-5" />
          <span>Premium Multi-Market Convergence ({markets?.length ?? 0} Markets)</span>
        </div>
        
        {markets?.map((market, index) => (
          <div
            key={index}
            className="bg-black/50 border-2 border-yellow-500/30 rounded-lg p-4 hover:border-yellow-500/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-lg">{market.marketName}</span>
              <span className="text-yellow-400 font-black text-2xl">
                {market.estimatedOdds?.toFixed(2) ?? 'N/A'}
              </span>
            </div>
            
            {/* Confidence Bar */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-400 rounded-full transition-all duration-500 shadow-lg shadow-yellow-500/50"
                style={{ width: `${market.confidence ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400 font-semibold">AI Confidence</span>
              <span className="text-sm font-black text-yellow-300">
                {market.confidence ?? 0}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Stats - Premium Style */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-6 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 border-2 border-yellow-500/40 rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-bold">Combined Confidence</span>
          </div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {combinedConfidence ?? 0}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">Combined Odds</span>
          </div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {estimatedCombinedOdds?.toFixed(2) ?? 'N/A'}
          </div>
        </div>
      </div>

      {/* Potential Return - Premium */}
      {estimatedCombinedOdds !== undefined && estimatedCombinedOdds !== null && (
        <div className="mb-6 p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/40 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-bold text-lg">€10 Stake Returns:</span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              €{(10 * estimatedCombinedOdds).toFixed(2)}
            </span>
          </div>
          <div className="text-right text-sm text-green-400/80 mt-2 font-semibold">
            Profit: €{(10 * estimatedCombinedOdds - 10).toFixed(2)}
          </div>
        </div>
      )}

      {/* Enhanced AI Reasoning */}
      {enhancedReasoning && (
        <div className="mt-6 p-5 bg-black/50 border-2 border-purple-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-purple-300 font-bold mb-3">
            <Brain className="w-5 h-5" />
            <span>ML-Enhanced Analysis</span>
          </div>
          <div className={`text-gray-300 text-sm leading-relaxed whitespace-pre-wrap ${!showFullReasoning && 'line-clamp-4'}`}>
            {enhancedReasoning}
          </div>
          {enhancedReasoning.length > 200 && (
            <button
              onClick={() => setShowFullReasoning(!showFullReasoning)}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
            >
              {showFullReasoning ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      )}

      {/* Premium Badge Footer */}
      <div className="mt-6 pt-4 border-t border-yellow-500/20 text-center">
        <p className="text-xs text-yellow-400/70 font-semibold">
          🏆 Selected by ML algorithm as today's optimal value opportunity
        </p>
      </div>
    </div>
  );
};

export default BetBuilderOfTheDay;
