import React from 'react';
import { TrendingUp, Sparkles, Info } from 'lucide-react';

interface MatchOddsProps {
  fixture: any;
}

interface Market {
  id: string;
  label: string;
  oddsKey: string;
  aiKey: string;
  description: string;
}

const MatchOdds: React.FC<MatchOddsProps> = ({ fixture }) => {
  // Define the 4 Footy Oracle markets
  const markets: Market[] = [
    {
      id: 'btts',
      label: 'Both Teams to Score',
      oddsKey: 'btts',
      aiKey: 'bts',
      description: 'Both teams score at least one goal'
    },
    {
      id: 'over25',
      label: 'Over 2.5 Goals',
      oddsKey: 'over25',
      aiKey: 'over25',
      description: 'Total goals in the match exceed 2.5'
    },
    {
      id: 'over35cards',
      label: 'Over 3.5 Cards',
      oddsKey: 'over35cards',
      aiKey: 'over35cards',
      description: 'Total cards in the match exceed 3.5'
    },
    {
      id: 'over95corners',
      label: 'Over 9.5 Corners',
      oddsKey: 'over95corners',
      aiKey: 'over95corners',
      description: 'Total corners in the match exceed 9.5'
    }
  ];

  // Find Golden Bet (highest ML probability)
  const getGoldenBet = () => {
    if (!fixture.aiBets) return null;

    let maxProb = 0;
    let goldenMarket = null;

    markets.forEach(market => {
      const aiData = fixture.aiBets?.[market.aiKey];
      if (aiData?.percentage > maxProb) {
        maxProb = aiData.percentage;
        goldenMarket = market.id;
      }
    });

    return goldenMarket;
  };

  const goldenBet = getGoldenBet();

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderMarket = (market: Market) => {
    const odds = fixture.odds?.[market.oddsKey];
    const aiData = fixture.aiBets?.[market.aiKey];
    const isGolden = goldenBet === market.id;

    return (
      <div
        key={market.id}
        className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:-translate-y-1 shadow-lg relative group ${
          isGolden
            ? 'border-yellow-400/60 shadow-yellow-400/30 hover:shadow-yellow-400/50'
            : 'border-gray-700/60 hover:border-gray-600 hover:shadow-purple-500/20'
        }`}
      >
        {/* Hover glow effect */}
        <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
          isGolden 
            ? 'bg-gradient-to-br from-yellow-500/5 to-transparent' 
            : 'bg-gradient-to-br from-purple-500/5 to-transparent'
        }`}></div>

        {/* Market Header */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold drop-shadow-lg">{market.label}</h3>
              {isGolden && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 rounded-full shadow-lg shadow-yellow-400/30 border border-yellow-400/30">
                  <Sparkles className="w-3 h-3 text-yellow-400 drop-shadow-lg" />
                  <span className="text-xs font-semibold text-yellow-400">Golden Bet</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">{market.description}</p>
          </div>
        </div>

        {/* Odds & Probability */}
        <div className="grid grid-cols-2 gap-4 mb-3 relative z-10">
          {/* Bookmaker Odds */}
          <div className="bg-gray-900/70 rounded-lg p-3 shadow-lg border border-gray-800/50 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Bookmaker Odds</div>
            <div className="text-2xl font-bold text-white drop-shadow-lg">
              {odds ? odds.toFixed(2) : 'N/A'}
            </div>
          </div>

          {/* ML Probability */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/30 rounded-lg p-3 shadow-lg border border-purple-500/30 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">ML Probability</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-purple-400 drop-shadow-lg">
                {aiData?.percentage ? `${aiData.percentage}%` : 'N/A'}
              </div>
              {aiData?.confidence && (
                <span className={`text-xs font-medium ${getConfidenceColor(aiData.confidence)}`}>
                  {aiData.confidence}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Probability Bar */}
        {aiData?.percentage && (
          <div className="mb-3 relative z-10">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Confidence</span>
              <span>{aiData.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 shadow-lg ${
                  isGolden
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
                style={{ width: `${aiData.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* AI Explanation (if available) */}
        {fixture.aiBets?.goldenBet?.type === market.aiKey && fixture.aiBets?.goldenBet?.reasoning && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 shadow-lg backdrop-blur-sm relative z-10">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0 drop-shadow-lg" />
              <div>
                <div className="text-xs font-semibold text-yellow-400 mb-1">AI Analysis</div>
                <p className="text-xs text-gray-300">{fixture.aiBets.goldenBet.reasoning}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-purple-400 drop-shadow-lg" />
        <h2 className="text-lg font-bold text-white drop-shadow-lg">Footy Oracle Markets</h2>
      </div>

      {/* No AI Data Warning */}
      {!fixture.aiBets && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 mt-0.5 drop-shadow-lg" />
            <div>
              <div className="text-sm font-semibold text-yellow-400 mb-1">
                AI Predictions Not Available
              </div>
              <p className="text-xs text-gray-300">
                ML predictions are generated 48 hours before kickoff. Check back closer to match time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Markets */}
      <div className="space-y-4">
        {markets.map(market => renderMarket(market))}
      </div>

      {/* Footer Note */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-800">
        Odds and predictions are for informational purposes only. Gamble responsibly.
      </div>
    </div>
  );
};

export default MatchOdds;
