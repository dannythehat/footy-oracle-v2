"""
Bet Builder Detection Algorithm for LM System
Identifies fixtures with multi-market convergence (3+ markets @ 75%+ confidence)

This script should be integrated into your existing ML pipeline in the 
football-betting-ai-system repository.

Usage:
    python bet_builder_detector.py
    
Output:
    shared/ml_outputs/bet_builders.json
"""

import json
from datetime import datetime
from typing import List, Dict, Any

# Configuration
MIN_CONFIDENCE = 75  # Minimum confidence per market
MIN_PROBABILITY = 0.70  # Minimum probability for positive outcome
MIN_MARKETS = 3  # Minimum markets required for bet builder
MAX_DAILY_BUILDERS = 5  # Top N bet builders per day

# Supported leagues (top-tier only for bet builders)
SUPPORTED_LEAGUES = [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Champions League',
    'Europa League',
]

# Market odds mapping (typical bookmaker odds)
MARKET_ODDS = {
    'btts': 1.75,
    'over_2_5_goals': 1.85,
    'over_9_5_corners': 1.90,
    'over_3_5_cards': 2.00
}

# Market display names
MARKET_NAMES = {
    'btts': 'Both Teams To Score',
    'over_2_5_goals': 'Over 2.5 Goals',
    'over_9_5_corners': 'Over 9.5 Corners',
    'over_3_5_cards': 'Over 3.5 Cards'
}


def is_league_supported(league: str) -> bool:
    """Check if league is supported for bet builders"""
    return league in SUPPORTED_LEAGUES


def get_market_name(market: str) -> str:
    """Convert market key to display name"""
    return MARKET_NAMES.get(market, market)


def get_selection(market: str) -> str:
    """Get the selection for the market"""
    if market == 'btts':
        return 'Yes'
    return 'Over'


def detect_bet_builders(predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify fixtures with multi-market convergence
    
    Args:
        predictions: List of fixture predictions with all 4 markets
        
    Returns:
        List of bet builder opportunities
    """
    bet_builders = []
    
    for fixture in predictions:
        # Filter: Only top-tier leagues
        if not is_league_supported(fixture.get('league', '')):
            continue
        
        high_confidence_markets = []
        
        # Check each market for high confidence
        preds = fixture.get('predictions', {})
        
        # Check BTTS
        if 'btts' in preds:
            btts = preds['btts']
            prob = btts.get('yes_probability', 0)
            confidence = btts.get('confidence', 0)
            
            if confidence >= MIN_CONFIDENCE and prob >= MIN_PROBABILITY:
                high_confidence_markets.append({
                    'market': 'btts',
                    'market_name': get_market_name('btts'),
                    'selection': get_selection('btts'),
                    'probability': prob,
                    'confidence': confidence,
                    'estimated_odds': MARKET_ODDS['btts']
                })
        
        # Check Over 2.5 Goals
        if 'over_2_5_goals' in preds:
            goals = preds['over_2_5_goals']
            prob = goals.get('over_probability', 0)
            confidence = goals.get('confidence', 0)
            
            if confidence >= MIN_CONFIDENCE and prob >= MIN_PROBABILITY:
                high_confidence_markets.append({
                    'market': 'over_2_5_goals',
                    'market_name': get_market_name('over_2_5_goals'),
                    'selection': get_selection('over_2_5_goals'),
                    'probability': prob,
                    'confidence': confidence,
                    'estimated_odds': MARKET_ODDS['over_2_5_goals']
                })
        
        # Check Over 9.5 Corners
        if 'over_9_5_corners' in preds:
            corners = preds['over_9_5_corners']
            prob = corners.get('over_probability', 0)
            confidence = corners.get('confidence', 0)
            
            if confidence >= MIN_CONFIDENCE and prob >= MIN_PROBABILITY:
                high_confidence_markets.append({
                    'market': 'over_9_5_corners',
                    'market_name': get_market_name('over_9_5_corners'),
                    'selection': get_selection('over_9_5_corners'),
                    'probability': prob,
                    'confidence': confidence,
                    'estimated_odds': MARKET_ODDS['over_9_5_corners']
                })
        
        # Check Over 3.5 Cards
        if 'over_3_5_cards' in preds:
            cards = preds['over_3_5_cards']
            prob = cards.get('over_probability', 0)
            confidence = cards.get('confidence', 0)
            
            if confidence >= MIN_CONFIDENCE and prob >= MIN_PROBABILITY:
                high_confidence_markets.append({
                    'market': 'over_3_5_cards',
                    'market_name': get_market_name('over_3_5_cards'),
                    'selection': get_selection('over_3_5_cards'),
                    'probability': prob,
                    'confidence': confidence,
                    'estimated_odds': MARKET_ODDS['over_3_5_cards']
                })
        
        # Bet Builder requires minimum number of markets
        if len(high_confidence_markets) >= MIN_MARKETS:
            # Calculate combined stats
            combined_confidence = sum(m['confidence'] for m in high_confidence_markets) / len(high_confidence_markets)
            combined_odds = 1.0
            for market in high_confidence_markets:
                combined_odds *= market['estimated_odds']
            
            bet_builders.append({
                'fixture_id': fixture.get('fixture_id'),
                'home_team': fixture.get('home_team'),
                'away_team': fixture.get('away_team'),
                'league': fixture.get('league'),
                'kickoff': fixture.get('kickoff'),
                'predictions': fixture.get('predictions'),
                'high_confidence_markets': high_confidence_markets,
                'combined_confidence': round(combined_confidence),
                'estimated_combined_odds': round(combined_odds, 2),
                'market_count': len(high_confidence_markets)
            })
    
    # Sort by combined confidence (highest first)
    bet_builders.sort(key=lambda x: x['combined_confidence'], reverse=True)
    
    # Return top N
    return bet_builders[:MAX_DAILY_BUILDERS]


def save_bet_builders(bet_builders: List[Dict[str, Any]], 
                     total_fixtures: int,
                     output_path: str = '../shared/ml_outputs/bet_builders.json') -> None:
    """Save bet builders to JSON file"""
    output = {
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'date': datetime.utcnow().strftime('%Y-%m-%d'),
        'total_fixtures_analyzed': total_fixtures,
        'bet_builders_found': len(bet_builders),
        'bet_builders': bet_builders
    }
    
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✅ Saved {len(bet_builders)} bet builders to {output_path}")
    
    # Print summary
    if bet_builders:
        print("\n🧠 Bet Builder Summary:")
        for i, bb in enumerate(bet_builders, 1):
            print(f"{i}. {bb['home_team']} vs {bb['away_team']}")
            print(f"   League: {bb['league']}")
            print(f"   Markets: {bb['market_count']} @ {bb['combined_confidence']}% confidence")
            print(f"   Combined Odds: {bb['estimated_combined_odds']}x")
            print()


def load_predictions(predictions_path: str = '../shared/ml_outputs/predictions.json') -> List[Dict[str, Any]]:
    """
    Load predictions from your existing ML pipeline output
    
    This is a placeholder - replace with your actual prediction loading logic
    """
    try:
        with open(predictions_path, 'r') as f:
            data = json.load(f)
            return data.get('fixtures', [])
    except FileNotFoundError:
        print(f"⚠️ Predictions file not found: {predictions_path}")
        return []
    except Exception as e:
        print(f"❌ Error loading predictions: {e}")
        return []


def main():
    """Main execution"""
    print("🧠 Bet Builder Detection Algorithm")
    print("=" * 50)
    
    # Load predictions from your ML pipeline
    predictions = load_predictions()
    
    if not predictions:
        print("⚠️ No predictions found. Exiting.")
        return
    
    print(f"📊 Analyzing {len(predictions)} fixtures...")
    
    # Detect bet builders
    bet_builders = detect_bet_builders(predictions)
    
    print(f"✅ Found {len(bet_builders)} bet builders with {MIN_MARKETS}+ markets @ {MIN_CONFIDENCE}%+ confidence")
    
    # Save to file
    save_bet_builders(bet_builders, len(predictions))
    
    print("\n✅ Bet builder detection complete!")


if __name__ == '__main__':
    main()
