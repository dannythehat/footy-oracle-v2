import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Plus, X, AlertCircle, Trophy } from 'lucide-react';

interface Bet {
  id: string;
  fixture: string;
  market: string;
  selection: string;
  odds: number;
}

interface TrebleCalculatorProps {
  availableBets?: Bet[];
}

const TrebleCalculator: React.FC<TrebleCalculatorProps> = ({ availableBets = [] }) => {
  const [selectedBets, setSelectedBets] = useState<Bet[]>([]);
  const [stake, setStake] = useState<number>(10);
  const [showBetSelector, setShowBetSelector] = useState(false);

  const calculateTotalOdds = () => {
    if (selectedBets.length === 0) return 1;
    return selectedBets.reduce((total, bet) => total * bet.odds, 1);
  };

  const calculatePotentialReturn = () => {
    return stake * calculateTotalOdds();
  };

  const calculatePotentialProfit = () => {
    return calculatePotentialReturn() - stake;
  };

  const addBet = (bet: Bet) => {
    if (selectedBets.length < 10 && !selectedBets.find(b => b.id === bet.id)) {
      setSelectedBets([...selectedBets, bet]);
    }
  };

  const removeBet = (betId: string) => {
    setSelectedBets(selectedBets.filter(b => b.id !== betId));
  };

  const clearAll = () => {
    setSelectedBets([]);
  };

  // Mock available bets if none provided
  const mockBets: Bet[] = availableBets.length > 0 ? availableBets : [
    {
      id: '1',
      fixture: 'Arsenal vs Chelsea',
      market: 'Over 2.5 Goals',
      selection: 'Yes',
      odds: 1.85
    },
    {
      id: '2',
      fixture: 'Man United vs Liverpool',
      market: 'BTTS',
      selection: 'Yes',
      odds: 1.70
    },
    {
      id: '3',
      fixture: 'Real Madrid vs Barcelona',
      market: 'Over 9.5 Corners',
      selection: 'Yes',
      odds: 1.90
    },
    {
      id: '4',
      fixture: 'Bayern vs Dortmund',
      market: 'Over 3.5 Cards',
      selection: 'Yes',
      odds: 2.00
    },
    {
      id: '5',
      fixture: 'PSG vs Marseille',
      market: 'BTTS',
      selection: 'Yes',
      odds: 1.75
    }
  ];

  const totalOdds = calculateTotalOdds();
  const potentialReturn = calculatePotentialReturn();
  const potentialProfit = calculatePotentialProfit();

  return (
    <div className="bg-gradient-to-br from-purple-950/40 to-black border border-purple-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Calculator className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Treble Calculator</h2>
            <p className="text-sm text-gray-400">Build your accumulator and calculate returns</p>
          </div>
        </div>
        {selectedBets.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Stake Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-purple-300 mb-2">
          Stake Amount (€)
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={stake}
          onChange={(e) => setStake(Math.max(1, parseFloat(e.target.value) || 1))}
          className="w-full bg-black/50 border border-purple-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Selected Bets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-purple-300">
            Selected Bets ({selectedBets.length}/10)
          </h3>
          <button
            onClick={() => setShowBetSelector(!showBetSelector)}
            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Bet
          </button>
        </div>

        {selectedBets.length === 0 ? (
          <div className="bg-black/40 border border-purple-900/50 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No bets selected</p>
            <p className="text-sm text-gray-500">Add bets to calculate your accumulator</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedBets.map((bet, index) => (
              <div
                key={bet.id}
                className="bg-black/40 border border-purple-900/50 rounded-lg p-3 flex items-center justify-between hover:border-purple-700 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-purple-400">#{index + 1}</span>
                    <span className="text-sm font-semibold text-white">{bet.fixture}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {bet.market} - {bet.selection}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-purple-400">{bet.odds.toFixed(2)}</span>
                  <button
                    onClick={() => removeBet(bet.id)}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bet Selector Modal */}
      {showBetSelector && (
        <div className="mb-6 bg-black/60 border border-purple-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-purple-300">Available Bets</h4>
            <button
              onClick={() => setShowBetSelector(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {mockBets
              .filter(bet => !selectedBets.find(sb => sb.id === bet.id))
              .map((bet) => (
                <button
                  key={bet.id}
                  onClick={() => {
                    addBet(bet);
                    if (selectedBets.length >= 9) setShowBetSelector(false);
                  }}
                  disabled={selectedBets.length >= 10}
                  className="w-full bg-purple-950/40 border border-purple-900/50 rounded-lg p-3 text-left hover:border-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white mb-1">{bet.fixture}</div>
                      <div className="text-xs text-gray-400">
                        {bet.market} - {bet.selection}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-purple-400">{bet.odds.toFixed(2)}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Calculation Summary */}
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-600 rounded-lg p-6">
        <div className="space-y-4">
          {/* Total Odds */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-800">
            <span className="text-sm text-gray-400">Total Odds</span>
            <span className="text-2xl font-bold text-purple-400">
              {totalOdds.toFixed(2)}
            </span>
          </div>

          {/* Stake */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-800">
            <span className="text-sm text-gray-400">Stake</span>
            <span className="text-xl font-bold text-white">€{stake.toFixed(2)}</span>
          </div>

          {/* Potential Return */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-800">
            <span className="text-sm text-gray-400">Potential Return</span>
            <span className="text-xl font-bold text-green-400">
              €{potentialReturn.toFixed(2)}
            </span>
          </div>

          {/* Potential Profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Potential Profit</span>
            </div>
            <span className="text-2xl font-bold text-yellow-400">
              €{potentialProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {selectedBets.length >= 3 && (
          <div className="mt-6 pt-6 border-t border-purple-800">
            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50">
              <Trophy className="w-5 h-5" />
              Place {selectedBets.length}-Fold Accumulator
            </button>
          </div>
        )}

        {selectedBets.length > 0 && selectedBets.length < 3 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Add at least {3 - selectedBets.length} more bet(s) for a treble</span>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-950/20 border border-blue-700/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="space-y-1 text-blue-400">
              <li>• Select 3+ bets to create an accumulator</li>
              <li>• All selections must win for the bet to pay out</li>
              <li>• Returns are calculated by multiplying all odds together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrebleCalculator;
