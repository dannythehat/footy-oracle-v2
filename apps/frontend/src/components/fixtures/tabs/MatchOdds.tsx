import React from 'react';
import { TrendingUp, Sparkles, Info, Trophy } from 'lucide-react';

interface MatchOddsProps {
  fixture: any;
}

interface Market {
  id: string;
  label: string;
  shortLabel: string;
  oddsKey: string;
  aiKey: string;
  icon?: string;
}

const MatchOdds: React.FC<MatchOddsProps> = ({ fixture }) => {
  if (!fixture) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <Info className="w-5 h-5" />
          <span className="text-sm">No fixture data available</span>
        </div>
      </div>
    );
  }

  const markets: Market[] = [
    {
      id: 'btts',
      label: 'Both Teams to Score',
      shortLabel: 'BTTS',
      oddsKey: 'btts',
      aiKey: 'bts',
      icon: '⚽'
    },
    {
      id: 'over25',
      label: 'Over 2.5 Goals',
      shortLabel: 'O2.5 Goals',
      oddsKey: 'over25',
      aiKey: 'over25',
      icon: '🎯'
    },
    {
      id: 'over35cards',
      label: 'Over 3.5 Cards',
      shortLabel: 'O3.5 Cards',
      oddsKey: 'over35cards',
      aiKey: 'over35cards',
      icon: '🟨'
    },
    {
      id: 'over95corners',
      label: 'Over 9.5 Corners',
      shortLabel: 'O9.5 Corners',
      oddsKey: 'over95corners',
      aiKey: 'over95corners',
      icon: '🚩'
    }
  ];

  const oddsData = fixture.odds || fixture.bookmakers;
  const hasOdds = oddsData && (
    (typeof oddsData === 'object' && Object.keys(oddsData).length > 0) ||
    (Array.isArray(oddsData) && oddsData.length > 0)
  );

  const getGoldenBet = () => {
    if (!fixture.aiBets) return null;

    let maxProb = 0;
    let goldenMarket = null;

    markets.forEach(market => {
      const aiData = fixture.aiBets?.[market.aiKey];
      if (aiData?.percentage > maxProb) {
        maxProb = aiData.percentage;
        goldenMarket = market;
      }
    });

    return goldenMarket;
  };

  const goldenBet = getGoldenBet();
  const goldenBetData = goldenBet ? fixture.aiBets?.[goldenBet.aiKey] : null;

  const getBookmakerOdds = (market: Market) => {
    if (!hasOdds) return null;

    if (typeof oddsData === 'object' && !Array.isArray(oddsData)) {
      return oddsData[market.oddsKey] || null;
    }

    if (Array.isArray(oddsData)) {
      for (const bookmaker of oddsData) {
        if (!bookmaker.bets) continue;
        
        for (const bet of bookmaker.bets) {
          const betName = bet.name?.toLowerCase() || '';
          const marketLabel = market.label.toLowerCase();
          
          if (betName.includes(marketLabel) || 
              betName.includes(market.shortLabel.toLowerCase()) ||
              betName.includes(market.oddsKey)) {
            
            if (bet.values && bet.values.length > 0) {
              return parseFloat(bet.values[0].odd);
            }
          }
        }
      }
    }

    return null;
  };

  const renderMarket = (market: Market) => {
    const odds = getBookmakerOdds(market);
    const aiData = fixture.aiBets?.[market.aiKey];
    const isGolden = goldenBet?.id === market.id;

    return (
      <div
        key={market.id}
        className={`relative bg-white rounded-lg p-3 border-2 transition-all ${
          isGolden
            ? 'border-yellow-400 shadow-md bg-yellow-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {isGolden && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-sm">
            <Trophy className="w-3 h-3 text-gray-900" />
            <span className="text-[10px] font-bold text-gray-900">GOLDEN</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{market.icon}</span>
            <div>
              <h3 className="text-xs font-bold text-gray-900">{market.shortLabel}</h3>
              <p className="text-[10px] text-gray-600">{market.label}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded p-2 ${isGolden ? 'bg-yellow-100' : 'bg-gray-50'}`}>
            <div className="text-[10px] text-gray-600 mb-0.5">Odds</div>
            <div className="text-base font-bold text-gray-900">
              {odds ? odds.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className={`rounded p-2 ${isGolden ? 'bg-yellow-100' : 'bg-purple-50'}`}>
            <div className="text-[10px] text-gray-600 mb-0.5">AI ML %</div>
            <div className={`text-base font-bold ${isGolden ? 'text-yellow-700' : 'text-purple-600'}`}>
              {aiData?.percentage ? `${aiData.percentage}%` : 'N/A'}
            </div>
          </div>
        </div>

        {aiData?.percentage && (
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isGolden ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-purple-500'
              }`}
              style={{ width: `${aiData.percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">Betting Markets</h2>
        </div>
      </div>

      {/* No Odds Warning */}
      {!hasOdds && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-blue-900 mb-0.5">
                No Odds Available Yet
              </div>
              <p className="text-[10px] text-blue-700">
                Odds will be available closer to kickoff time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No AI Predictions Warning */}
      {!fixture.aiBets && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-yellow-900 mb-0.5">
                AI Predictions Not Available
              </div>
              <p className="text-[10px] text-yellow-700">
                ML predictions are generated 48 hours before kickoff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Golden Bet Section - Only show if we have AI data */}
      {goldenBet && goldenBetData && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full">
              <Sparkles className="w-3 h-3 text-gray-900" />
              <span className="text-xs font-bold text-gray-900">GOLDEN BET</span>
            </div>
            <span className="text-lg">{goldenBet.icon}</span>
            <span className="text-sm font-bold text-gray-900">{goldenBet.label}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
              <div className="text-[10px] text-gray-600 mb-0.5">AI Confidence</div>
              <div className="text-xl font-bold text-yellow-600">
                {goldenBetData.percentage}%
              </div>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
              <div className="text-[10px] text-gray-600 mb-0.5">Odds</div>
              <div className="text-xl font-bold text-gray-900">
                {getBookmakerOdds(goldenBet)?.toFixed(2) || 'N/A'}
              </div>
            </div>
          </div>

          {goldenBetData.reasoning && (
            <div className="bg-white rounded-lg p-3 border border-yellow-300">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">AI Analysis</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{goldenBetData.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Markets Grid */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2">All Markets</h3>
        <div className="grid grid-cols-2 gap-3">
          {markets.map(market => renderMarket(market))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-[10px] text-gray-500 text-center pt-2 border-t border-gray-200">
        Odds and predictions are for informational purposes only. Gamble responsibly.
      </div>
    </div>
  );
};

export default MatchOdds;
