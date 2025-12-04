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
  // Guard against missing fixture data
  if (!fixture) {
    return (
      <div className="p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-red-400 mb-1">
                No Fixture Data
              </div>
              <p className="text-[10px] text-gray-300">
                Unable to load fixture information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define the 4 Footy Oracle markets
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

  // Check if odds data is available - handle both formats
  const oddsData = fixture.odds || fixture.bookmakers;
  const hasOdds = oddsData && (
    (typeof oddsData === 'object' && Object.keys(oddsData).length > 0) ||
    (Array.isArray(oddsData) && oddsData.length > 0)
  );

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

  // Extract bookmaker odds from API format
  const getBookmakerOdds = (market: Market) => {
    if (!hasOdds) return null;

    // Handle simple object format {btts: 1.85, over25: 2.10, ...}
    if (typeof oddsData === 'object' && !Array.isArray(oddsData)) {
      return oddsData[market.oddsKey] || null;
    }

    // Handle API-Football format (array of bookmakers)
    if (Array.isArray(oddsData)) {
      // Find the first bookmaker with this market
      for (const bookmaker of oddsData) {
        if (!bookmaker.bets) continue;
        
        for (const bet of bookmaker.bets) {
          // Match market by name
          const betName = bet.name?.toLowerCase() || '';
          const marketLabel = market.label.toLowerCase();
          
          if (betName.includes(marketLabel) || 
              betName.includes(market.shortLabel.toLowerCase()) ||
              betName.includes(market.oddsKey)) {
            
            // Return first value's odd
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
        className={`relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-3 border transition-all hover:scale-[1.02] ${
          isGolden
            ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20'
            : 'border-gray-700/50 hover:border-gray-600'
        }`}
      >
        {/* Golden Badge */}
        {isGolden && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-yellow-400 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3 text-gray-900" />
            <span className="text-[10px] font-bold text-gray-900">GOLDEN</span>
          </div>
        )}

        {/* Market Name */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-white">{market.shortLabel}</h3>
          <p className="text-[10px] text-gray-400">{market.label}</p>
        </div>

        {/* Odds & Probability */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex-1 bg-gray-900/60 rounded px-2 py-1.5">
            <div className="text-[9px] text-gray-400 mb-0.5">Odds</div>
            <div className="text-base font-bold text-white">
              {odds ? odds.toFixed(2) : 'N/A'}
            </div>
          </div>

          <div className="flex-1 bg-purple-900/40 rounded px-2 py-1.5">
            <div className="text-[9px] text-gray-400 mb-0.5">ML Prob</div>
            <div className="text-base font-bold text-purple-400">
              {aiData?.percentage ? `${aiData.percentage}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        {aiData?.percentage && (
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isGolden
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}
              style={{ width: `${aiData.percentage}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // Render all available bookmaker markets
  const renderAllBookmakerOdds = () => {
    if (!Array.isArray(oddsData) || oddsData.length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white mb-3">All Available Markets</h3>
        <div className="space-y-4">
          {oddsData.map((bookmaker, idx) => (
            <div key={idx} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
              <div className="text-xs font-semibold text-gray-400 mb-2">{bookmaker.name}</div>
              <div className="space-y-2">
                {bookmaker.bets?.map((bet: any, betIdx: number) => (
                  <div key={betIdx} className="bg-gray-900/50 rounded p-2">
                    <div className="text-xs text-gray-300 mb-1">{bet.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {bet.values?.map((value: any, valIdx: number) => (
                        <div key={valIdx} className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400">{value.value}:</span>
                          <span className="text-green-400 font-semibold">{value.odd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Golden Bets</h2>
        </div>
        {goldenBet && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/30">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400">Best Pick</span>
          </div>
        )}
      </div>

      {/* No Odds Warning */}
      {!hasOdds && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-blue-400 mb-1">
                No Odds Available Yet
              </div>
              <p className="text-[10px] text-gray-300">
                Odds will be available closer to kickoff time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No AI Data Warning */}
      {!fixture.aiBets && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-yellow-400 mb-1">
                AI Predictions Not Available
              </div>
              <p className="text-[10px] text-gray-300">
                ML predictions are generated 48 hours before kickoff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Markets Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {markets.map(market => renderMarket(market))}
      </div>

      {/* All Bookmaker Odds */}
      {renderAllBookmakerOdds()}

      {/* AI Reasoning (if available) */}
      {fixture.aiBets?.goldenBet?.reasoning && (
        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-yellow-400 mb-1">AI Analysis</div>
              <p className="text-xs text-gray-300">{fixture.aiBets.goldenBet.reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-[10px] text-gray-500 text-center pt-2 border-t border-gray-800">
        Odds and predictions are for informational purposes only. Gamble responsibly.
      </div>
    </div>
  );
};

export default MatchOdds;
