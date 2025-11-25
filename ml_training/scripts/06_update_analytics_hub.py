"""
Analytics Hub Updater
Updates the analytics hub dashboard with latest training metrics
Runs after every training session to keep dashboard current

Usage:
    python 06_update_analytics_hub.py
"""

import json
import os
from pathlib import Path
from datetime import datetime
import pandas as pd

class AnalyticsHubUpdater:
    """Updates analytics hub with training metrics"""
    
    def __init__(self):
        self.ml_dir = Path(__file__).parent.parent
        self.models_dir = self.ml_dir / 'models'
        self.data_dir = self.ml_dir / 'data'
        self.hub_dir = Path(__file__).parent.parent.parent / 'analytics_hub'
        self.metrics_dir = self.hub_dir / 'metrics'
        
        # Create metrics directory
        self.metrics_dir.mkdir(parents=True, exist_ok=True)
        
        self.daily_file = self.metrics_dir / 'daily_performance.json'
        self.trends_file = self.metrics_dir / 'historical_trends.json'
        
        print(f"📊 Analytics Hub Updater initialized")
        print(f"   Models: {self.models_dir}")
        print(f"   Metrics: {self.metrics_dir}")
    
    def load_model_metadata(self):
        """Load current model performance"""
        metadata_file = self.models_dir / 'metadata.json'
        
        if not metadata_file.exists():
            print("⚠️  No model metadata found")
            return None
        
        with open(metadata_file, 'r') as f:
            return json.load(f)
    
    def load_training_data(self):
        """Load training data to get fixture count"""
        training_file = self.data_dir / 'processed' / 'training_data.csv'
        
        if not training_file.exists():
            return 0
        
        df = pd.read_csv(training_file)
        return len(df)
    
    def load_daily_performance(self):
        """Load existing daily performance data"""
        if not self.daily_file.exists():
            return []
        
        with open(self.daily_file, 'r') as f:
            return json.load(f)
    
    def load_historical_trends(self):
        """Load existing historical trends"""
        if not self.trends_file.exists():
            return {}
        
        with open(self.trends_file, 'r') as f:
            return json.load(f)
    
    def calculate_trends(self, daily_data):
        """Calculate trends from daily data"""
        if not daily_data:
            return {}
        
        trends = {}
        models = ['btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards']
        
        for model in models:
            # Get accuracy values
            accuracies = []
            for day in daily_data:
                if 'models' in day and model in day['models']:
                    acc = day['models'][model].get('accuracy', 0)
                    if acc > 0:
                        accuracies.append(acc)
            
            if not accuracies:
                continue
            
            current = accuracies[-1] if accuracies else 0
            avg_7 = sum(accuracies[-7:]) / len(accuracies[-7:]) if len(accuracies) >= 7 else current
            avg_30 = sum(accuracies[-30:]) / len(accuracies[-30:]) if len(accuracies) >= 30 else current
            best = max(accuracies) if accuracies else 0
            
            # Calculate improvements
            improvement_7d = current - accuracies[-7] if len(accuracies) >= 7 else 0
            improvement_30d = current - accuracies[-30] if len(accuracies) >= 30 else 0
            
            trends[model] = {
                'current': current,
                'avg_7_days': avg_7,
                'avg_30_days': avg_30,
                'best_ever': best,
                'improvement_7_days': improvement_7d,
                'improvement_30_days': improvement_30d
            }
        
        return trends
    
    def update_metrics(self):
        """Update all metrics files"""
        print("\n📊 Updating analytics hub metrics...")
        
        # Load current model performance
        metadata = self.load_model_metadata()
        if not metadata:
            print("❌ No model metadata available")
            return False
        
        # Load training data count
        total_fixtures = self.load_training_data()
        
        # Create today's entry
        today_entry = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timestamp': datetime.now().isoformat(),
            'total_fixtures': total_fixtures,
            'models': {
                'btts': {
                    'accuracy': metadata.get('btts_accuracy', 0) / 100,
                    'precision': metadata.get('btts_precision', 0) / 100,
                    'recall': metadata.get('btts_recall', 0) / 100
                },
                'over_2_5_goals': {
                    'accuracy': metadata.get('goals_accuracy', 0) / 100,
                    'precision': metadata.get('goals_precision', 0) / 100,
                    'recall': metadata.get('goals_recall', 0) / 100
                },
                'over_9_5_corners': {
                    'accuracy': metadata.get('corners_accuracy', 0) / 100,
                    'precision': metadata.get('corners_precision', 0) / 100,
                    'recall': metadata.get('corners_recall', 0) / 100
                },
                'over_3_5_cards': {
                    'accuracy': metadata.get('cards_accuracy', 0) / 100,
                    'precision': metadata.get('cards_precision', 0) / 100,
                    'recall': metadata.get('cards_recall', 0) / 100
                }
            }
        }
        
        # Load existing daily data
        daily_data = self.load_daily_performance()
        
        # Check if today already exists
        today_date = today_entry['date']
        existing_index = None
        for i, entry in enumerate(daily_data):
            if entry['date'] == today_date:
                existing_index = i
                break
        
        if existing_index is not None:
            # Update existing entry
            daily_data[existing_index] = today_entry
            print(f"✅ Updated existing entry for {today_date}")
        else:
            # Add new entry
            daily_data.append(today_entry)
            print(f"✅ Added new entry for {today_date}")
        
        # Keep only last 90 days
        if len(daily_data) > 90:
            daily_data = daily_data[-90:]
        
        # Save daily performance
        with open(self.daily_file, 'w') as f:
            json.dump(daily_data, f, indent=2)
        print(f"💾 Saved daily performance: {self.daily_file}")
        
        # Calculate and save trends
        trends = self.calculate_trends(daily_data)
        with open(self.trends_file, 'w') as f:
            json.dump(trends, f, indent=2)
        print(f"💾 Saved historical trends: {self.trends_file}")
        
        # Print summary
        print(f"\n📈 Analytics Hub Updated:")
        print(f"   Total fixtures: {total_fixtures:,}")
        print(f"   Days tracked: {len(daily_data)}")
        print(f"\n   Current Accuracy:")
        for model, data in trends.items():
            print(f"   - {model}: {data['current']*100:.2f}%")
        
        return True


def main():
    """Main entry point"""
    updater = AnalyticsHubUpdater()
    success = updater.update_metrics()
    
    if success:
        print("\n✅ Analytics hub updated successfully!")
        print(f"\n🌐 View dashboard at:")
        print(f"   file://{updater.hub_dir}/dashboard/index.html")
        print(f"   Or deploy to GitHub Pages for live access")
    else:
        print("\n❌ Failed to update analytics hub")
        return 1
    
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
