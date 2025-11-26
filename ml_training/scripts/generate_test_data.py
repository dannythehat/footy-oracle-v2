"""
Test Data Generator
Generates realistic test predictions to unblock frontend development
Run this to populate predictions.json while fixing the ML pipeline
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

def generate_test_predictions():
    """Generate realistic test predictions"""
    
    teams = [
        ("Manchester City", "Liverpool", "Premier League"),
        ("Real Madrid", "Barcelona", "La Liga"),
        ("Bayern Munich", "Borussia Dortmund", "Bundesliga"),
        ("Inter Milan", "AC Milan", "Serie A"),
        ("PSG", "Marseille", "Ligue 1"),
        ("Arsenal", "Chelsea", "Premier League"),
        ("Atletico Madrid", "Sevilla", "La Liga"),
        ("RB Leipzig", "Bayer Leverkusen", "Bundesliga"),
        ("Napoli", "Roma", "Serie A"),
        ("Monaco", "Lyon", "Ligue 1"),
    ]
    
    markets = [
        ("Over/Under 2.5", ["Over 2.5", "Under 2.5"]),
        ("Both Teams to Score", ["Yes", "No"]),
        ("Match Winner", ["Home Win", "Draw", "Away Win"]),
        ("Over/Under 9.5 Corners", ["Over 9.5", "Under 9.5"]),
    ]
    
    predictions = []
    fixture_id = 1000
    
    for home, away, league in teams:
        for market_name, outcomes in markets:
            predictions.append({
                "fixtureId": fixture_id,
                "homeTeam": home,
                "awayTeam": away,
                "league": league,
                "market": market_name,
                "prediction": outcomes[0],  # Pick first outcome
                "confidence": 75 + (fixture_id % 20)  # Vary confidence 75-95
            })
            fixture_id += 1
    
    return predictions


def generate_golden_bets(predictions):
    """Select top 3 predictions as Golden Bets"""
    
    # Sort by confidence and take top 3
    sorted_preds = sorted(predictions, key=lambda x: x['confidence'], reverse=True)
    golden = sorted_preds[:3]
    
    # Add betting info
    for i, bet in enumerate(golden):
        bet['odds'] = 1.85 + (i * 0.1)  # Realistic odds
        bet['stake'] = 10
        bet['potentialReturn'] = round(bet['stake'] * bet['odds'], 2)
        bet['reasoning'] = f"High confidence {bet['market']} prediction based on recent form and statistics."
    
    return golden


def generate_value_bets(predictions):
    """Generate value bets with EV calculations"""
    
    # Take predictions with 80%+ confidence
    high_conf = [p for p in predictions if p['confidence'] >= 80]
    
    value_bets = []
    for bet in high_conf[:5]:  # Top 5
        odds = 2.1
        prob = bet['confidence'] / 100
        ev = (prob * odds) - 1
        edge = ev / odds
        
        value_bets.append({
            **bet,
            'odds': odds,
            'expectedValue': round(ev, 2),
            'edge': round(edge, 2),
            'reasoning': f"Expected value of {round(ev, 2)} with {round(edge*100, 1)}% edge"
        })
    
    return value_bets


def main():
    """Generate all test data files"""
    
    print("🎲 Generating test data...\n")
    
    # Generate predictions
    predictions = generate_test_predictions()
    print(f"✅ Generated {len(predictions)} predictions")
    
    # Generate Golden Bets
    golden_bets = generate_golden_bets(predictions)
    print(f"✅ Generated {len(golden_bets)} Golden Bets")
    
    # Generate Value Bets
    value_bets = generate_value_bets(predictions)
    print(f"✅ Generated {len(value_bets)} Value Bets")
    
    # Save to files
    output_dir = Path(__file__).parent.parent.parent / 'shared' / 'ml_outputs'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_dir / 'predictions.json', 'w') as f:
        json.dump(predictions, f, indent=2)
    print(f"\n📁 Saved: {output_dir / 'predictions.json'}")
    
    with open(output_dir / 'golden_bets.json', 'w') as f:
        json.dump(golden_bets, f, indent=2)
    print(f"📁 Saved: {output_dir / 'golden_bets.json'}")
    
    with open(output_dir / 'value_bets.json', 'w') as f:
        json.dump(value_bets, f, indent=2)
    print(f"📁 Saved: {output_dir / 'value_bets.json'}")
    
    print("\n✅ Test data generation complete!")
    print("\n🚀 Next steps:")
    print("1. Commit and push these files")
    print("2. Frontend should now display data")
    print("3. Fix ML pipeline in parallel")


if __name__ == '__main__':
    main()
