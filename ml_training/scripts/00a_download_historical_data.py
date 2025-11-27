"""
Historical Data Downloader
Downloads fixtures and stats for a historical year (runs at midnight)
Saves raw data for processing by 00b_train_historical_models.py at 2am

Usage:
    python 00a_download_historical_data.py --year 2015
"""

import os
import sys
import json
import requests
import time
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Setup logging
log_dir = Path(__file__).parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)
log_file = log_dir / f'download_historical_{datetime.now().strftime("%Y%m%d")}.log'

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

# Top 50 leagues
TOP_50_LEAGUES = [
    39, 140, 78, 135, 61, 94, 88, 144, 203, 235, 71, 128, 253, 262,
    2, 3, 848, 45, 143, 81, 137, 66, 48, 141, 79, 136, 62, 119, 103,
    113, 207, 218, 345, 197, 179, 283, 307, 188, 271, 169, 172, 318,
    292, 266, 98, 106, 104, 120, 384
]


class HistoricalDataDownloader:
    """Downloads fixtures and stats for a historical year"""
    
    def __init__(self, year, num_leagues=50):
        self.year = year
        self.leagues = TOP_50_LEAGUES[:num_leagues]
        
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.raw_dir = self.data_dir / 'historical' / 'raw'
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        
        self.fixtures_file = self.raw_dir / f'{year}_fixtures.json'
        self.stats_file = self.raw_dir / f'{year}_stats.json'
        
        logger.info(f"📥 Historical Data Downloader initialized")
        logger.info(f"   Year: {year}")
        logger.info(f"   Leagues: {len(self.leagues)}")
        logger.info(f"   Output: {self.raw_dir}")
    
    def fetch_season_fixtures(self, league_id):
        """Fetch all fixtures for a league season"""
        logger.info(f"   Fetching league {league_id}, season {self.year}...")
        
        try:
            response = requests.get(
                f'{BASE_URL}/fixtures',
                headers={'x-apisports-key': API_KEY},
                params={
                    'league': league_id,
                    'season': self.year,
                    'status': 'FT'
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
            logger.error(f"   ❌ Error: {e}")
            return []
        
        finally:
            time.sleep(0.5)  # Rate limiting
    
    def fetch_fixture_statistics(self, fixture_id):
        """Fetch detailed statistics for a fixture"""
        try:
            response = requests.get(
                f'{BASE_URL}/fixtures/statistics',
                headers={'x-apisports-key': API_KEY},
                params={'fixture': fixture_id},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', [])
            else:
                return []
                
        except Exception as e:
            logger.error(f"   ❌ Error fetching stats for {fixture_id}: {e}")
            return []
        
        finally:
            time.sleep(0.3)  # Rate limiting
    
    def download_all_data(self):
        """Download all fixtures and stats for the year"""
        logger.info(f"\n{'='*60}")
        logger.info(f"📥 Downloading data for year {self.year}")
        logger.info(f"{'='*60}\n")
        
        start_time = datetime.now()
        all_fixtures = []
        all_stats = {}
        
        # Step 1: Download all fixtures
        logger.info("STEP 1: Downloading fixtures...")
        for i, league_id in enumerate(self.leagues, 1):
            logger.info(f"\nLeague {i}/{len(self.leagues)}: {league_id}")
            fixtures = self.fetch_season_fixtures(league_id)
            all_fixtures.extend(fixtures)
            time.sleep(1)  # Rate limiting between leagues
        
        logger.info(f"\n✅ Downloaded {len(all_fixtures)} fixtures")
        
        # Save fixtures immediately
        with open(self.fixtures_file, 'w') as f:
            json.dump(all_fixtures, f, indent=2)
        logger.info(f"💾 Saved fixtures to {self.fixtures_file}")
        
        # Step 2: Download stats for each fixture
        logger.info(f"\nSTEP 2: Downloading stats for {len(all_fixtures)} fixtures...")
        logger.info("⚠️  This will take 2-4 hours for ~30,000 fixtures\n")
        
        for i, fixture in enumerate(all_fixtures, 1):
            fixture_id = fixture['fixture']['id']
            
            if i % 100 == 0:
                elapsed = (datetime.now() - start_time).total_seconds() / 60
                rate = i / elapsed if elapsed > 0 else 0
                remaining = (len(all_fixtures) - i) / rate if rate > 0 else 0
                logger.info(f"Progress: {i}/{len(all_fixtures)} ({i/len(all_fixtures)*100:.1f}%) - "
                          f"Elapsed: {elapsed:.1f}min - ETA: {remaining:.1f}min")
            
            stats = self.fetch_fixture_statistics(fixture_id)
            if stats:
                all_stats[str(fixture_id)] = stats
            
            # Save stats every 500 fixtures (checkpoint)
            if i % 500 == 0:
                with open(self.stats_file, 'w') as f:
                    json.dump(all_stats, f, indent=2)
                logger.info(f"💾 Checkpoint: Saved {len(all_stats)} stats")
        
        # Final save
        with open(self.stats_file, 'w') as f:
            json.dump(all_stats, f, indent=2)
        
        elapsed = (datetime.now() - start_time).total_seconds() / 60
        
        logger.info(f"\n{'='*60}")
        logger.info(f"✅ Download complete!")
        logger.info(f"{'='*60}")
        logger.info(f"Total fixtures: {len(all_fixtures)}")
        logger.info(f"Total stats: {len(all_stats)}")
        logger.info(f"Time elapsed: {elapsed:.1f} minutes")
        logger.info(f"Fixtures file: {self.fixtures_file}")
        logger.info(f"Stats file: {self.stats_file}")
        
        return {
            'year': self.year,
            'total_fixtures': len(all_fixtures),
            'total_stats': len(all_stats),
            'elapsed_minutes': elapsed,
            'fixtures_file': str(self.fixtures_file),
            'stats_file': str(self.stats_file)
        }


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Download Historical Data')
    parser.add_argument('--year', type=int, help='Year to download (default: from progress file)')
    parser.add_argument('--leagues', type=int, default=50, help='Number of leagues (default: 50)')
    
    args = parser.parse_args()
    
    # Determine year to download
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
    
    downloader = HistoricalDataDownloader(year, args.leagues)
    result = downloader.download_all_data()
    
    logger.info(f"\n✅ Download successful: {result}")


if __name__ == '__main__':
    main()
