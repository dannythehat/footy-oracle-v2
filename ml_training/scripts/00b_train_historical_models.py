"""
Historical Model Training
Processes pre-downloaded data and trains models (runs at 2am)
Uses data downloaded by 00a_download_historical_data.py at midnight

Usage:
    python 00b_train_historical_models.py --year 2015
"""

import os
import sys
import json
import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Setup logging
log_dir = Path(__file__).parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)
log_file = log_dir / f'train_historical_{datetime.now().strftime("%Y%m%d")}.log'

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


class HistoricalModelTrainer:
    """Processes pre-downloaded data and trains models"""
    
    def __init__(self, year):
        self.year = year
        
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.raw_dir = self.data_dir / 'historical' / 'raw'
        self.historical_dir = self.data_dir / 'historical'
        self.progress_file = self.data_dir / 'training_progress.json'
        
        self.fixtures_file = self.raw_dir / f'{year}_fixtures.json'
        self.stats_file = self.raw_dir / f'{year}_stats.json'
        self.output_file = self.historical_dir / f'fixtures_{year}.csv'
        
        logger.info(f"🤖 Historical Model Trainer initialized")
        logger.info(f"   Year: {year}")
        logger.info(f"   Fixtures: {self.fixtures_file}")
        logger.info(f"   Stats: {self.stats_file}")
    
    def load_downloaded_data(self):
        """Load pre-downloaded fixtures and stats"""
        logger.info(f"\n📂 Loading pre-downloaded data...")
        
        if not self.fixtures_file.exists():
            logger.error(f"❌ Fixtures file not found: {self.fixtures_file}")
            return None, None
        
        if not self.stats_file.exists():
            logger.error(f"❌ Stats file not found: {self.stats_file}")
            return None, None
        
        with open(self.fixtures_file, 'r') as f:
            fixtures = json.load(f)
        
        with open(self.stats_file, 'r') as f:
            stats = json.load(f)
        
        logger.info(f"✅ Loaded {len(fixtures)} fixtures")
        logger.info(f"✅ Loaded {len(stats)} stats")
        
        return fixtures, stats
    
    def process_fixture(self, fixture, stats_dict):
        """Process a single fixture with its stats"""
        try:
            fixture_id = str(fixture['fixture']['id'])
            
            if fixture_id not in stats_dict:
                logger.warning(f"⚠️  No stats for fixture {fixture_id}")
                return None
            
            stats = stats_dict[fixture_id]
            
            if len(stats) < 2:
                logger.warning(f"⚠️  Incomplete stats for fixture {fixture_id}")
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
                'home_possession': str(home_stats.get('Ball Possession', '0%')).replace('%', ''),
                'away_possession': str(away_stats.get('Ball Possession', '0%')).replace('%', ''),
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing fixture: {e}")
            return None
    
    def process_all_fixtures(self):
        """Process all fixtures and create CSV"""
        logger.info(f"\n{'='*60}")
        logger.info(f"🔄 Processing fixtures for year {self.year}")
        logger.info(f"{'='*60}\n")
        
        # Load data
        fixtures, stats_dict = self.load_downloaded_data()
        
        if not fixtures or not stats_dict:
            logger.error("❌ Failed to load data")
            return None
        
        # Process all fixtures
        all_data = []
        for i, fixture in enumerate(fixtures, 1):
            if i % 1000 == 0:
                logger.info(f"Processing: {i}/{len(fixtures)} ({i/len(fixtures)*100:.1f}%)")
            
            processed = self.process_fixture(fixture, stats_dict)
            if processed:
                all_data.append(processed)
        
        # Save to CSV
        if all_data:
            df = pd.DataFrame(all_data)
            df.to_csv(self.output_file, index=False)
            
            logger.info(f"\n✅ Processing complete:")
            logger.info(f"   Total fixtures: {len(all_data):,}")
            logger.info(f"   Output file: {self.output_file}")
            
            return {
                'year': self.year,
                'total_fixtures': len(all_data),
                'file': str(self.output_file)
            }
        else:
            logger.error("❌ No data processed")
            return None
    
    def train_models(self):
        """Train models on all historical data up to this year"""
        logger.info(f"\n🤖 Training models on data through {self.year}...")
        
        # Combine all historical data
        all_data = []
        
        # Get all CSV files from historical directory
        csv_files = sorted(self.historical_dir.glob('fixtures_*.csv'))
        
        for csv_file in csv_files:
            year = int(csv_file.stem.split('_')[1])
            if year <= self.year:
                df = pd.read_csv(csv_file)
                all_data.append(df)
                logger.info(f"   Loaded {len(df):,} fixtures from {year}")
        
        if not all_data:
            logger.error("❌ No data available for training")
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
            logger.info("✅ Training complete!")
            logger.info(result.stdout)
            return True
        else:
            logger.error("❌ Training failed!")
            logger.error(result.stderr)
            return False
    
    def save_progress(self, stats):
        """Save training progress"""
        progress = {
            'current_year': self.year,
            'last_trained': datetime.now().isoformat(),
            'stats': stats,
            'next_year': self.year - 1 if self.year > 2000 else None
        }
        
        with open(self.progress_file, 'w') as f:
            json.dump(progress, f, indent=2)
        
        logger.info(f"💾 Progress saved: Year {self.year} complete")
    
    def run_pipeline(self):
        """Run the complete training pipeline"""
        logger.info(f"\n{'='*60}")
        logger.info(f"🚀 Starting Historical Training Pipeline")
        logger.info(f"{'='*60}\n")
        logger.info(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Training year: {self.year}")
        
        # Step 1: Process downloaded data
        stats = self.process_all_fixtures()
        
        if not stats:
            logger.error("❌ Failed to process fixtures")
            return False
        
        # Step 2: Train models
        success = self.train_models()
        
        if success:
            # Step 3: Save progress
            self.save_progress(stats)
            
            logger.info(f"\n{'='*60}")
            logger.info(f"✅ Pipeline complete!")
            logger.info(f"{'='*60}")
            logger.info(f"Next year to train: {self.year - 1}")
            
            return True
        else:
            logger.error("❌ Pipeline failed during training")
            return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train Historical Models')
    parser.add_argument('--year', type=int, help='Year to train (default: from progress file)')
    
    args = parser.parse_args()
    
    # Determine year to train
    if args.year:
        year = args.year
    else:
        # Read from progress file
        progress_file = Path(__file__).parent.parent / 'data' / 'training_progress.json'
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                progress = json.load(f)
                year = progress.get('current_year', 2018)
        else:
            year = 2018
    
    logger.info(f"🎯 Target year: {year}")
    
    trainer = HistoricalModelTrainer(year)
    success = trainer.run_pipeline()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
