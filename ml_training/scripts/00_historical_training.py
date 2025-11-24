"""
Historical Training Pipeline
Trains LM babies with historical data going back year by year
Designed to run daily at 2am, training on progressively older data

Usage:
    python 00_historical_training.py --start-year 2018 --leagues 50
"""

import os
import sys
import json
import requests
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time
import logging

# Setup logging
log_dir = Path(__file__).parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)
log_file = log_dir / f'historical_training_{datetime.now().strftime("%Y%m%d")}.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

API_KEY = os.getenv('API_FOOTBALL_KEY')
BASE_URL = 'https://v3.football.api-sports.io'

# Top 50 leagues worldwide
TOP_50_LEAGUES = [
    39,   # Premier League (England)
    140,  # La Liga (Spain)
    78,   # Bundesliga (Germany)
    135,  # Serie A (Italy)
    61,   # Ligue 1 (France)
    94,   # Primeira Liga (Portugal)
    88,   # Eredivisie (Netherlands)
    144,  # Belgian Pro League
    203,  # Super Lig (Turkey)
    235,  # Russian Premier League
    71,   # Serie A (Brazil)
    128,  # Argentine Primera
    253,  # MLS (USA)
    262,  # Liga MX (Mexico)
    2,    # Champions League
    3,    # Europa League
    848,  # Conference League
    45,   # FA Cup
    143,  # Copa del Rey
    81,   # DFB Pokal
    137,  # Coppa Italia
    66,   # Coupe de France
    48,   # Championship (England)
    141,  # La Liga 2 (Spain)
    79,   # 2. Bundesliga (Germany)
    136,  # Serie B (Italy)
    62,   # Ligue 2 (France)
    119,  # Danish Superliga
    103,  # Eliteserien (Norway)
    113,  # Allsvenskan (Sweden)
    207,  # Swiss Super League
    218,  # Bundesliga (Austria)
    345,  # Czech First League
    197,  # Greek Super League
    179,  # Scottish Premiership
    283,  # UAE Pro League
    307,  # Saudi Pro League
    188,  # Romanian Liga 1
    271,  # Australian A-League
    169,  # Polish Ekstraklasa
    172,  # Croatian First League
    318,  # J1 League (Japan)
    292,  # K League 1 (South Korea)
    266,  # Chinese Super League
    98,   # Segunda División (Portugal)
    106,  # Superettan (Sweden)
    104,  # 1. Division (Norway)
    120,  # 1st Division (Denmark)
    384,  # Premiership (Northern Ireland)
]


class HistoricalTrainer:
    """Manages historical data collection and training"""
    
    def __init__(self, start_year=2018, num_leagues=50):
        self.start_year = start_year
        self.current_training_year = self.load_progress()
        self.leagues = TOP_50_LEAGUES[:num_leagues]
        
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.raw_dir = self.data_dir / 'raw'
        self.historical_dir = self.data_dir / 'historical'
        self.progress_file = self.data_dir / 'training_progress.json'
        
        # Create directories
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.historical_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"🤖 Historical Trainer initialized")
        logger.info(f"   Start year: {self.start_year}")
        logger.info(f"   Current training year: {self.current_training_year}")
        logger.info(f"   Tracking {len(self.leagues)} leagues")
    
    def load_progress(self):
        """Load training progress from file"""
        progress_file = Path(__file__).parent.parent / 'data' / 'training_progress.json'
        
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                progress = json.load(f)
                return progress.get('current_year', self.start_year)
        
        return self.start_year
    
    def save_progress(self, year, stats):
        """Save training progress"""
        progress = {
            'current_year': year,
            'last_trained': datetime.now().isoformat(),
            'stats': stats,
            'next_year': year - 1 if year > 2000 else None
        }
        
        with open(self.progress_file, 'w') as f:
            json.dump(progress, f, indent=2)
        
        logger.info(f"💾 Progress saved: Year {year} complete")
    
    def fetch_season_fixtures(self, league_id, season):
        """Fetch all fixtures for a league season"""
        logger.info(f"   Fetching league {league_id}, season {season}...")
        
        try:
            response = requests.get(
                f'{BASE_URL}/fixtures',
                headers={'x-rapidapi-key': API_KEY},
                params={
                    'league': league_id,
                    'season': season,
                    'status': 'FT'  # Only finished fixtures
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                fixtures = data.get('response', [])
                logger.info(f"   ✅ Found {len(fixtures)} fixtures")
                return fixtures
            else:
                logger.warning(f"   ⚠️  API error {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"   ❌ Error fetching fixtures: {e}")
            return []
        
        # Rate limiting
        time.sleep(0.5)
    
    def fetch_fixture_statistics(self, fixture_id):
        """Fetch detailed statistics for a fixture"""
        try:
            response = requests.get(
                f'{BASE_URL}/fixtures/statistics',
                headers={'x-rapidapi-key': API_KEY},
                params={'fixture': fixture_id},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', [])
            else:
                return []
                
        except Exception as e:
            logger.error(f"   ❌ Error fetching stats for fixture {fixture_id}: {e}")
            return []
        
        time.sleep(0.3)
    
    def process_fixture(self, fixture):
        """Extract relevant data from fixture"""
        try:
            fixture_id = fixture['fixture']['id']
            
            # Fetch detailed statistics
            stats = self.fetch_fixture_statistics(fixture_id)
            
            if len(stats) < 2:
                logger.warning(f"   ⚠️  Incomplete stats for fixture {fixture_id}")
                return None
            
            # Extract statistics
            home_stats = {s['type']: s['value'] for s in stats[0]['statistics']}
            away_stats = {s['type']: s['value'] for s in stats[1]['statistics']}
            
            # Calculate targets
            home_goals = fixture['goals']['home'] or 0
            away_goals = fixture['goals']['away'] or 0
            total_goals = home_goals + away_goals
            
            home_corners = home_stats.get('Corner Kicks', 0) or 0
            away_corners = away_stats.get('Corner Kicks', 0) or 0
            total_corners = home_corners + away_corners
            
            home_yellow = home_stats.get('Yellow Cards', 0) or 0
            away_yellow = away_stats.get('Yellow Cards', 0) or 0
            home_red = home_stats.get('Red Cards', 0) or 0
            away_red = away_stats.get('Red Cards', 0) or 0
            total_cards = home_yellow + away_yellow + home_red + away_red
            
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
                'home_goals': home_goals,
                'away_goals': away_goals,
                'total_goals': total_goals,
                
                # Targets
                'btts': 1 if (home_goals > 0 and away_goals > 0) else 0,
                'over_2_5_goals': 1 if total_goals > 2.5 else 0,
                'over_9_5_corners': 1 if total_corners > 9.5 else 0,
                'over_3_5_cards': 1 if total_cards > 3.5 else 0,
                
                # Stats
                'home_corners': home_corners,
                'away_corners': away_corners,
                'total_corners': total_corners,
                'home_yellow_cards': home_yellow,
                'away_yellow_cards': away_yellow,
                'home_red_cards': home_red,
                'away_red_cards': away_red,
                'total_cards': total_cards,
                'home_shots': home_stats.get('Shots on Goal', 0) or 0,
                'away_shots': away_stats.get('Shots on Goal', 0) or 0,
                'home_possession': home_stats.get('Ball Possession', '0%').replace('%', ''),
                'away_possession': away_stats.get('Ball Possession', '0%').replace('%', ''),
            }
            
        except Exception as e:
            logger.error(f"   ❌ Error processing fixture: {e}")
            return None
    
    def collect_year_data(self, year):
        """Collect all fixtures for a specific year"""
        logger.info(f"\n{'='*60}")
        logger.info(f"📥 Collecting data for year {year}")
        logger.info(f"{'='*60}\n")
        
        all_fixtures = []
        
        for league_id in self.leagues:
            fixtures = self.fetch_season_fixtures(league_id, year)
            
            for fixture in fixtures:
                processed = self.process_fixture(fixture)
                if processed:
                    all_fixtures.append(processed)
            
            # Rate limiting between leagues
            time.sleep(1)
        
        # Save to CSV
        if all_fixtures:
            df = pd.DataFrame(all_fixtures)
            output_file = self.historical_dir / f'fixtures_{year}.csv'
            df.to_csv(output_file, index=False)
            
            logger.info(f"\n✅ Year {year} complete:")
            logger.info(f"   Total fixtures: {len(all_fixtures):,}")
            logger.info(f"   Saved to: {output_file}")
            
            return {
                'year': year,
                'total_fixtures': len(all_fixtures),
                'leagues_covered': len(self.leagues),
                'file': str(output_file)
            }
        else:
            logger.warning(f"⚠️  No fixtures collected for year {year}")
            return None
    
    def train_on_year(self, year):
        """Train models on data up to and including specified year"""
        logger.info(f"\n🤖 Training models on data through {year}...")
        
        # Combine all historical data up to this year
        all_data = []
        
        for y in range(year, self.start_year + 1):
            file_path = self.historical_dir / f'fixtures_{y}.csv'
            if file_path.exists():
                df = pd.read_csv(file_path)
                all_data.append(df)
                logger.info(f"   Loaded {len(df):,} fixtures from {y}")
        
        if not all_data:
            logger.error(f"❌ No data available for training!")
            return False
        
        # Combine all data
        combined_df = pd.concat(all_data, ignore_index=True)
        logger.info(f"\n   Total training data: {len(combined_df):,} fixtures")
        
        # Save combined training data
        training_file = self.data_dir / 'processed' / 'training_data.csv'
        training_file.parent.mkdir(exist_ok=True)
        combined_df.to_csv(training_file, index=False)
        
        # Run training script
        logger.info(f"\n   Running model training...")
        train_script = Path(__file__).parent / '03_train_models.py'
        
        import subprocess
        result = subprocess.run(
            [sys.executable, str(train_script)],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info(f"✅ Training complete!")
            logger.info(result.stdout)
            return True
        else:
            logger.error(f"❌ Training failed!")
            logger.error(result.stderr)
            return False
    
    def run_daily_pipeline(self):
        """Run the daily historical training pipeline"""
        logger.info(f"\n{'='*60}")
        logger.info(f"🚀 Starting Daily Historical Training Pipeline")
        logger.info(f"{'='*60}\n")
        logger.info(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Training year: {self.current_training_year}")
        
        # Check if we've gone back far enough
        if self.current_training_year < 2000:
            logger.info(f"\n✅ Historical training complete! Reached year 2000.")
            return
        
        # Step 1: Collect data for current year
        stats = self.collect_year_data(self.current_training_year)
        
        if not stats:
            logger.error(f"❌ Failed to collect data for {self.current_training_year}")
            return
        
        # Step 2: Train models on all data up to this year
        success = self.train_on_year(self.current_training_year)
        
        if success:
            # Step 3: Save progress and move to next year
            self.save_progress(self.current_training_year, stats)
            
            # Update for next run
            self.current_training_year -= 1
            
            logger.info(f"\n{'='*60}")
            logger.info(f"✅ Daily pipeline complete!")
            logger.info(f"{'='*60}")
            logger.info(f"Next run will train on year: {self.current_training_year}")
            logger.info(f"Estimated fixtures so far: ~{stats['total_fixtures'] * (self.start_year - self.current_training_year + 1):,}")
        else:
            logger.error(f"❌ Pipeline failed during training phase")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Historical Training Pipeline')
    parser.add_argument('--start-year', type=int, default=2018, help='Starting year (default: 2018)')
    parser.add_argument('--leagues', type=int, default=50, help='Number of leagues to track (default: 50)')
    parser.add_argument('--test', action='store_true', help='Test mode (single year only)')
    
    args = parser.parse_args()
    
    trainer = HistoricalTrainer(start_year=args.start_year, num_leagues=args.leagues)
    
    if args.test:
        logger.info("🧪 Running in TEST mode")
        stats = trainer.collect_year_data(trainer.current_training_year)
        if stats:
            logger.info(f"\n✅ Test successful: {stats}")
    else:
        trainer.run_daily_pipeline()


if __name__ == '__main__':
    main()
