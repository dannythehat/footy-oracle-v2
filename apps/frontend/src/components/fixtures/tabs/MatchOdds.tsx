import React from 'react';
import { TrendingUp, Sparkles, Info } from 'lucide-react';

interface MatchOddsProps {
  fixture: any;
}

interface Market {
  id: string;
  label: string;
  shortLabel: string;
  oddsKey: string;
  aiKey: string;
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
    },
    {
      id: 'over25',
      label: 'Over 2.5 Goals',
      shortLabel: 'O2.5',
      oddsKey: 'over25',
      aiKey: 'over25',
    },
    {
      id: 'over35cards',
      label: 'Over 3.5 Cards',
      shortLabel: 'O3.5 Cards',
      oddsKey: 'over35cards',
      aiKey: 'over35cards',
    },
    {
      id: 'over95corners',
      label: 'Over 9.5 Corners',
      shortLabel: 'O9.5 Corners',
      oddsKey: 'over95corners',
      aiKey: 'over95corners',
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
        goldenMarket = market.id;
      }
    });

    return goldenMarket;
  };

  const goldenBet = getGoldenBet();

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
    const isGolden = goldenBet === market.id;

    return (
      <div
        key={market.id}
        className={`relative bg-white rounded-lg p-4 border-2 transition-all ${
          isGolden
            ? 'border-yellow-400 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {isGolden && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-yellow-400 rounded-full">
            <Sparkles className="w-3 h-3 text-gray-900" />
            <span className="text-xs font-bold text-gray-900">GOLDEN</span>
          </div>
        )}

        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">{market.shortLabel}</h3>
          <p className="text-xs text-gray-600">{market.label}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-600 mb-1">Odds</div>
            <div className="text-lg font-bold text-gray-900">
              {odds ? odds.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="bg-purple-50 rounded p-2">
            <div className="text-xs text-gray-600 mb-1">ML Prob</div>
            <div className="text-lg font-bold text-purple-600">
              {aiData?.percentage ? `${aiData.percentage}%` : 'N/A'}
            </div>
          </div>
        </div>

        {aiData?.percentage && (
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isGolden ? 'bg-yellow-400' : 'bg-purple-500'
              }`}
              style={{ width: `${aiData.percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderAllBookmakerOdds = () => {
    if (!Array.isArray(oddsData) || oddsData.length === 0) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">All Bookmakers</h3>
        {oddsData.map((bookmaker, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">{bookmaker.name}</div>
            <div className="space-y-2">
              {bookmaker.bets?.map((bet: any, betIdx: number) => (
                <div key={betIdx} className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-700 mb-1 font-medium">{bet.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {bet.values?.map((value: any, valIdx: number) => (
                      <div key={valIdx} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                        <span className="text-gray-600">{value.value}:</span>
                        <span className="text-green-600 font-semibold">{value.odd}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-base font-bold text-gray-900">Golden Bets</h2>
        </div>
        {goldenBet && (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full border border-yellow-300">
            <Sparkles className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700">Best Pick</span>
          </div>
        )}
      </div>

      {!hasOdds && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-blue-900 mb-1">
                No Odds Available Yet
              </div>
              <p className="text-xs text-blue-700">
                Odds will be available closer to kickoff time.
              </p>
            </div>
          </div>
        </div>
      )}

      {!fixture.aiBets && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-yellow-900 mb-1">
                AI Predictions Not Available
              </div>
              <p className="text-xs text-yellow-700">
                ML predictions are generated 48 hours before kickoff.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {markets.map(market => renderMarket(market))}
      </div>

      {renderAllBookmakerOdds()}

      {fixture.aiBets?.goldenBet?.reasoning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-yellow-900 mb-1">AI Analysis</div>
              <p className="text-xs text-yellow-700">{fixture.aiBets.goldenBet.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        Odds and predictions are for informational purposes only. Gamble responsibly.
      </div>
    </div>
  );
};

export default MatchOdds;
