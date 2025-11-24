"""
Data Processing & Feature Engineering
Cleans new data, calculates features, and merges with training set
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


def load_incremental_data():
    """Load all incremental CSV files"""
    incremental_dir = Path(__file__).parent.parent / 'data' / 'incremental'
    
    if not incremental_dir.exists():
        print("⚠️  No incremental data directory found")
        return pd.DataFrame()
    
    csv_files = list(incremental_dir.glob('*.csv'))
    
    if not csv_files:
        print("⚠️  No incremental CSV files found")
        return pd.DataFrame()
    
    print(f"📂 Found {len(csv_files)} incremental files")
    
    dfs = []
    for csv_file in csv_files:
        df = pd.read_csv(csv_file)
        dfs.append(df)
        print(f"   ✅ Loaded {csv_file.name}: {len(df)} fixtures")
    
    combined = pd.concat(dfs, ignore_index=True)
    print(f"\n✅ Total incremental fixtures: {len(combined)}")
    
    return combined


def load_raw_data():
    """Load all raw CSV files (your 100k dataset)"""
    raw_dir = Path(__file__).parent.parent / 'data' / 'raw'
    
    if not raw_dir.exists():
        print("⚠️  No raw data directory found")
        return pd.DataFrame()
    
    csv_files = list(raw_dir.glob('*.csv'))
    
    if not csv_files:
        print("⚠️  No raw CSV files found")
        return pd.DataFrame()
    
    print(f"📂 Found {len(csv_files)} raw files")
    
    dfs = []
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            dfs.append(df)
            print(f"   ✅ Loaded {csv_file.name}: {len(df)} fixtures")
        except Exception as e:
            print(f"   ❌ Error loading {csv_file.name}: {e}")
    
    if not dfs:
        return pd.DataFrame()
    
    combined = pd.concat(dfs, ignore_index=True)
    print(f"\n✅ Total raw fixtures: {len(combined)}")
    
    return combined


def clean_data(df):
    """Clean and validate data"""
    print("\n🧹 Cleaning data...")
    
    initial_count = len(df)
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['fixture_id'], keep='last')
    print(f"   Removed {initial_count - len(df)} duplicates")
    
    # Remove rows with missing critical data
    critical_cols = ['home_goals', 'away_goals', 'total_goals']
    df = df.dropna(subset=critical_cols)
    print(f"   Removed {initial_count - len(df)} rows with missing critical data")
    
    # Ensure target columns exist
    if 'btts' not in df.columns:
        df['btts'] = ((df['home_goals'] > 0) & (df['away_goals'] > 0)).astype(int)
    
    if 'over_2_5_goals' not in df.columns:
        df['over_2_5_goals'] = (df['total_goals'] > 2.5).astype(int)
    
    if 'over_9_5_corners' not in df.columns and 'total_corners' in df.columns:
        df['over_9_5_corners'] = (df['total_corners'] > 9.5).astype(int)
    
    if 'over_3_5_cards' not in df.columns and 'total_cards' in df.columns:
        df['over_3_5_cards'] = (df['total_cards'] > 3.5).astype(int)
    
    # Fill missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0)
    
    print(f"✅ Cleaned data: {len(df)} fixtures remaining")
    
    return df


def engineer_features(df):
    """Calculate advanced features"""
    print("\n🔧 Engineering features...")
    
    # Sort by date
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
    
    # Team-based rolling averages (last 5 matches)
    for team_type in ['home', 'away']:
        team_col = f'{team_type}_team_id'
        
        if team_col in df.columns:
            # Goals scored
            df[f'{team_type}_goals_l5'] = df.groupby(team_col)[f'{team_type}_goals'].transform(
                lambda x: x.rolling(5, min_periods=1).mean()
            )
            
            # Goals conceded
            opponent_goals = 'away_goals' if team_type == 'home' else 'home_goals'
            df[f'{team_type}_conceded_l5'] = df.groupby(team_col)[opponent_goals].transform(
                lambda x: x.rolling(5, min_periods=1).mean()
            )
            
            # Corners
            if f'{team_type}_corners' in df.columns:
                df[f'{team_type}_corners_l5'] = df.groupby(team_col)[f'{team_type}_corners'].transform(
                    lambda x: x.rolling(5, min_periods=1).mean()
                )
            
            # Cards
            if f'{team_type}_yellow_cards' in df.columns:
                df[f'{team_type}_cards_l5'] = df.groupby(team_col)[f'{team_type}_yellow_cards'].transform(
                    lambda x: x.rolling(5, min_periods=1).mean()
                )
    
    # Match-level features
    df['goal_difference'] = df['home_goals'] - df['away_goals']
    df['total_shots'] = df.get('home_shots', 0) + df.get('away_shots', 0)
    df['shots_on_target_ratio'] = (
        (df.get('home_shots_on_target', 0) + df.get('away_shots_on_target', 0)) / 
        (df['total_shots'] + 1)  # +1 to avoid division by zero
    )
    
    # League-based features
    if 'league_id' in df.columns:
        df['league_avg_goals'] = df.groupby('league_id')['total_goals'].transform('mean')
        df['league_avg_corners'] = df.groupby('league_id')['total_corners'].transform('mean')
        df['league_avg_cards'] = df.groupby('league_id')['total_cards'].transform('mean')
    
    print(f"✅ Feature engineering complete")
    
    return df


def save_processed_data(df):
    """Save processed data"""
    processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Save full training dataset
    training_file = processed_dir / 'training_data.csv'
    df.to_csv(training_file, index=False)
    print(f"\n✅ Saved training data: {training_file}")
    print(f"   Total fixtures: {len(df):,}")
    
    # Create validation split (last 20% by date)
    if 'date' in df.columns:
        df = df.sort_values('date')
        split_idx = int(len(df) * 0.8)
        
        train_df = df.iloc[:split_idx]
        val_df = df.iloc[split_idx:]
        
        train_file = processed_dir / 'train_split.csv'
        val_file = processed_dir / 'val_split.csv'
        
        train_df.to_csv(train_file, index=False)
        val_df.to_csv(val_file, index=False)
        
        print(f"   Training split: {len(train_df):,} fixtures")
        print(f"   Validation split: {len(val_df):,} fixtures")


def main():
    """Main execution"""
    print("🔄 Starting data processing pipeline...\n")
    
    # Load raw data (your 100k dataset)
    raw_df = load_raw_data()
    
    # Load incremental data (daily updates)
    incremental_df = load_incremental_data()
    
    # Combine datasets
    if not raw_df.empty and not incremental_df.empty:
        df = pd.concat([raw_df, incremental_df], ignore_index=True)
        print(f"\n✅ Combined datasets: {len(df):,} total fixtures")
    elif not raw_df.empty:
        df = raw_df
        print(f"\n✅ Using raw data only: {len(df):,} fixtures")
    elif not incremental_df.empty:
        df = incremental_df
        print(f"\n✅ Using incremental data only: {len(df):,} fixtures")
    else:
        print("❌ No data found!")
        return
    
    # Clean data
    df = clean_data(df)
    
    # Engineer features
    df = engineer_features(df)
    
    # Save processed data
    save_processed_data(df)
    
    # Print summary statistics
    print("\n📊 Dataset Summary:")
    print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"   Leagues: {df['league'].nunique()}")
    print(f"   Teams: {df['home_team'].nunique() + df['away_team'].nunique()}")
    print(f"\n   Target Distribution:")
    print(f"   BTTS: {df['btts'].mean():.1%}")
    print(f"   Over 2.5 Goals: {df['over_2_5_goals'].mean():.1%}")
    if 'over_9_5_corners' in df.columns:
        print(f"   Over 9.5 Corners: {df['over_9_5_corners'].mean():.1%}")
    if 'over_3_5_cards' in df.columns:
        print(f"   Over 3.5 Cards: {df['over_3_5_cards'].mean():.1%}")
    
    print("\n✅ Data processing complete!")


if __name__ == '__main__':
    main()
