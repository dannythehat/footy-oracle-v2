"""
Daily Fixture Fetcher
Fetches completed fixtures from API-Football and saves to CSV
"""

import os
import sys
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv('API_FOOTBALL_KEY')
BASE_URL = 'https://v3.football.api-sports.io'

# Top 30 leagues to track
LEAGUES = [
    39,   # Premier League
    140,  # La Liga
    78,   # Bundesliga
    135,  # Serie A
    61,   # Ligue 1
    2,    # Champions League
    3,    # Europa League
    94,   # Primeira Liga
    88,   # Eredivisie
    203,  # Super Lig
    144,  # Belgian Pro League
    179,  # Scottish Premiership
    71,   # Serie A Brazil
    128,  # Argentine Primera
    253,  # MLS
    39,   # Championship
    40,   # FA Cup
    48,   # Copa del Rey
    81,   # DFB Pokal
    137,  # Coppa Italia
    66,   # Coupe de France
]


def fetch_fixtures(date: str):
    """Fetch all fixtures for a specific date"""
    fixtures = []
    
    headers = {
        'x-apisports-key': API_KEY
    }
    
    for league_id in LEAGUES:
        try:
            response = requests.get(
                f'{BASE_URL}/fixtures',
                headers=headers,
                params={
                    'league': league_id,
                    'date': date,
                    'status': 'FT'  # Only finished fixtures
                }
            )
            
            data = response.json()
            if data.get('results', 0) > 0:
                fixtures.extend(data['response'])
                print(f"✅ League {league_id}: {data['results']} fixtures")
        except Exception as e:
            print(f"❌ Error fetching league {league_id}: {e}")
    
    return fixtures


def fetch_fixture_statistics(fixture_id: int):
    """Fetch detailed statistics for a fixture"""
    headers = {
        'x-apisports-key': API_KEY
    }
    
    try:
        response = requests.get(
            f'{BASE_URL}/fixtures/statistics',
            headers=headers,
            params={'fixture': fixture_id}
        )
        return response.json()['response']
    except Exception as e:
        print(f"❌ Error fetching stats for fixture {fixture_id}: {e}")
        return []


def extract_stat_value(stats_list, stat_type):
    """Extract a specific stat value from statistics list"""
    for stat in stats_list:
        if stat['type'] == stat_type:
            value = stat['value']
            # Handle None or string values
            if value is None:
                return 0
            if isinstance(value, str):
                # Remove % sign if present
                value = value.replace('%', '')
                try:
                    return float(value)
                except:
                    return 0
            return value
    return 0


def process_fixture(fixture):
    """Extract relevant data from fixture"""
    fixture_id = fixture['fixture']['id']
    stats = fetch_fixture_statistics(fixture_id)
    
    if not stats or len(stats) < 2:
        print(f"⚠️  No stats for fixture {fixture_id}")
        return None
    
    # Extract key metrics
    home_stats = stats[0]['statistics']
    away_stats = stats[1]['statistics']
    
    return {
        'fixture_id': fixture_id,
        'date': fixture['fixture']['date'],
        'league': fixture['league']['name'],
        'league_id': fixture['league']['id'],
        'season': fixture['league']['season'],
        'home_team': fixture['teams']['home']['name'],
        'home_team_id': fixture['teams']['home']['id'],
        'away_team': fixture['teams']['away']['name'],
        'away_team_id': fixture['teams']['away']['id'],
        'home_goals': fixture['goals']['home'],
        'away_goals': fixture['goals']['away'],
        'total_goals': fixture['goals']['home'] + fixture['goals']['away'],
        
        # BTTS
        'btts': 1 if (fixture['goals']['home'] > 0 and fixture['goals']['away'] > 0) else 0,
        
        # Goals O/U 2.5
        'over_2_5_goals': 1 if (fixture['goals']['home'] + fixture['goals']['away'] > 2.5) else 0,
        
        # Corners
        'home_corners': extract_stat_value(home_stats, 'Corner Kicks'),
        'away_corners': extract_stat_value(away_stats, 'Corner Kicks'),
        'total_corners': extract_stat_value(home_stats, 'Corner Kicks') + extract_stat_value(away_stats, 'Corner Kicks'),
        'over_9_5_corners': 1 if (extract_stat_value(home_stats, 'Corner Kicks') + extract_stat_value(away_stats, 'Corner Kicks') > 9.5) else 0,
        
        # Cards
        'home_yellow_cards': extract_stat_value(home_stats, 'Yellow Cards'),
        'away_yellow_cards': extract_stat_value(away_stats, 'Yellow Cards'),
        'home_red_cards': extract_stat_value(home_stats, 'Red Cards'),
        'away_red_cards': extract_stat_value(away_stats, 'Red Cards'),
        'total_cards': (extract_stat_value(home_stats, 'Yellow Cards') + 
                       extract_stat_value(away_stats, 'Yellow Cards') + 
                       extract_stat_value(home_stats, 'Red Cards') + 
                       extract_stat_value(away_stats, 'Red Cards')),
        'over_3_5_cards': 1 if ((extract_stat_value(home_stats, 'Yellow Cards') + 
                                 extract_stat_value(away_stats, 'Yellow Cards') + 
                                 extract_stat_value(home_stats, 'Red Cards') + 
                                 extract_stat_value(away_stats, 'Red Cards')) > 3.5) else 0,
        
        # Additional stats
        'home_shots': extract_stat_value(home_stats, 'Total Shots'),
        'away_shots': extract_stat_value(away_stats, 'Total Shots'),
        'home_shots_on_target': extract_stat_value(home_stats, 'Shots on Goal'),
        'away_shots_on_target': extract_stat_value(away_stats, 'Shots on Goal'),
        'home_possession': extract_stat_value(home_stats, 'Ball Possession'),
        'away_possession': extract_stat_value(away_stats, 'Ball Possession'),
    }


def main():
    """Main execution"""
    # Get yesterday's date
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    print(f"\n🔄 Fetching fixtures for {yesterday}...")
    
    # Fetch fixtures
    fixtures = fetch_fixtures(yesterday)
    print(f"\n✅ Found {len(fixtures)} completed fixtures")
    
    if not fixtures:
        print("⚠️  No fixtures found for yesterday")
        return
    
    # Process each fixture
    processed_data = []
    for i, fixture in enumerate(fixtures, 1):
        print(f"\n📊 Processing fixture {i}/{len(fixtures)}: {fixture['teams']['home']['name']} vs {fixture['teams']['away']['name']}")
        data = process_fixture(fixture)
        if data:
            processed_data.append(data)
    
    # Save to CSV
    if processed_data:
        df = pd.DataFrame(processed_data)
        
        # Create output directory
        output_dir = Path(__file__).parent.parent / 'data' / 'incremental'
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f'{yesterday}.csv'
        df.to_csv(output_file, index=False)
        
        print(f"\n✅ Saved {len(df)} fixtures to {output_file}")
        print(f"\n📊 Summary:")
        print(f"   BTTS: {df['btts'].sum()} / {len(df)} ({df['btts'].mean():.1%})")
        print(f"   Over 2.5 Goals: {df['over_2_5_goals'].sum()} / {len(df)} ({df['over_2_5_goals'].mean():.1%})")
        print(f"   Over 9.5 Corners: {df['over_9_5_corners'].sum()} / {len(df)} ({df['over_9_5_corners'].mean():.1%})")
        print(f"   Over 3.5 Cards: {df['over_3_5_cards'].sum()} / {len(df)} ({df['over_3_5_cards'].mean():.1%})")
    else:
        print("❌ No data to save")


if __name__ == '__main__':
    main()
