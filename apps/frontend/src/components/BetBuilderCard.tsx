import React, { useState } from 'react';
import { Brain, TrendingUp, Target, Clock, Trophy, Zap, Share2, Copy, Check } from 'lucide-react';

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

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const kickoffTime = new Date(kickoff).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getResultBadge = () => {
    if (!result || result === 'pending') return null;
    
    return (
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${ 
        result === 'win' 
          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
          : 'bg-red-500/20 text-red-400 border border-red-500/50'
      }`}>
        {result === 'win' ? '✓ WON' : '✗ LOST'}
        {profit !== undefined && (
          <span className="ml-1 sm:ml-2">
            {profit > 0 ? '+' : ''}{profit.toFixed(2)}€
          </span>
        )}
      </div>
    );
  };

  const generateShareText = () => {
    const marketsList = markets.map(m => `${m.marketName} (${m.confidence}%)`).join(', ');
    return `🧠 Bet Builder: ${homeTeam} vs ${awayTeam}\\n${league} • ${kickoffTime}\\n\\nMarkets: ${marketsList}\\n\\nCombined Confidence: ${combinedConfidence}%\\nCombined Odds: ${estimatedCombinedOdds.toFixed(2)}x\\n€10 → €${(10 * estimatedCombinedOdds).toFixed(2)}\\n\\n#FootyOracle #BetBuilder`;
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
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\\n' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(text + '\\n' + url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-xl p-4 sm:p-6 hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 group touch-target">
      {/* Brain Badge - Mobile optimized */}
      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-2 sm:p-3 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
        <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
      </div>

      {/* Share Button - Mobile optimized touch target */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-purple-600/80 hover:bg-purple-600 active:bg-purple-700 text-white p-2 sm:p-2 rounded-full transition-colors touch-target no-tap-highlight"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        
        {/* Share Menu - Mobile optimized */}
        {showShareMenu && (
          <div className="absolute top-12 left-0 bg-gray-900 border border-purple-500/50 rounded-lg shadow-xl p-2 z-10 min-w-[160px]">
            <button
              onClick={() => handleShare('twitter')}
              className="w-full text-left px-3 py-2 hover:bg-purple-600/20 active:bg-purple-600/30 rounded text-sm text-white flex items-center gap-2 touch-target no-tap-highlight"
            >
              <span>🐦</span> Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="w-full text-left px-3 py-2 hover:bg-purple-600/20 active:bg-purple-600/30 rounded text-sm text-white flex items-center gap-2 touch-target no-tap-highlight"
            >
              <span>📘</span> Facebook
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full text-left px-3 py-2 hover:bg-purple-600/20 active:bg-purple-600/30 rounded text-sm text-white flex items-center gap-2 touch-target no-tap-highlight"
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="w-full text-left px-3 py-2 hover:bg-purple-600/20 active:bg-purple-600/30 rounded text-sm text-white flex items-center gap-2 touch-target no-tap-highlight"
            >
              <span>✈️</span> Telegram
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-full text-left px-3 py-2 hover:bg-purple-600/20 active:bg-purple-600/30 rounded text-sm text-white flex items-center gap-2 touch-target no-tap-highlight"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>

      {getResultBadge()}

      {/* Header - Mobile optimized */}
      <div className="mt-2 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-purple-400 text-xs sm:text-sm mb-2">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-semibold">{league}</span>
          <span className="text-gray-500">•</span>
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>{kickoffTime}</span>
        </div>
        
        <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 break-words">
          {homeTeam} <span className="text-purple-400">vs</span> {awayTeam}
        </h3>
      </div>

      {/* Markets Grid - Mobile optimized */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-purple-300 mb-2">
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Multi-Market Convergence ({markets.length} Markets)</span>
        </div>
        
        {markets.map((market, index) => (
          <div
            key={index}
            className="bg-black/40 border border-purple-500/20 rounded-lg p-2.5 sm:p-3 hover:border-purple-500/40 active:border-purple-500/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm sm:text-base">{market.marketName}</span>
              <span className="text-purple-400 font-bold text-base sm:text-lg">
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

      {/* Combined Stats - Mobile optimized */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-xs sm:text-sm mb-1">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Combined Confidence</span>
            <span className="sm:hidden">Confidence</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {combinedConfidence}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-xs sm:text-sm mb-1">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Combined Odds</span>
            <span className="sm:hidden">Odds</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {estimatedCombinedOdds.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Potential Return - Mobile optimized */}
      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-semibold text-xs sm:text-base">€10 Stake Returns:</span>
          <span className="text-xl sm:text-2xl font-bold text-yellow-300">
            €{(10 * estimatedCombinedOdds).toFixed(2)}
          </span>
        </div>
        <div className="text-right text-xs sm:text-sm text-yellow-400/70 mt-1">
          Profit: €{(10 * estimatedCombinedOdds - 10).toFixed(2)}
        </div>
      </div>

      {/* AI Reasoning - Mobile optimized */}
      {aiReasoning && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-black/40 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-1.5 sm:gap-2 text-purple-400 text-xs sm:text-sm font-semibold mb-2">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>AI Analysis</span>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            {aiReasoning}
          </p>
        </div>
      )}

      {/* Convergence Badge - Mobile optimized */}
      <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-purple-400">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <span className="font-semibold">MULTI-MARKET CONVERGENCE</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
    </div>
  );
};

export default BetBuilderCard;
