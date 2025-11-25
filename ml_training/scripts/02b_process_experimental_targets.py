"""
Experimental Target Processing
Adds experimental target columns to existing processed data

This script enhances your processed data with new target columns
for experimental learning machines without reprocessing everything.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime


def add_experimental_targets(df):
    """Add experimental target columns to dataframe"""
    print("\n🎯 Adding experimental target columns...")
    
    targets_added = []
    
    # 1. RED CARD IN GAME
    if 'home_red_cards' in df.columns and 'away_red_cards' in df.columns:
        df['has_red_card'] = ((df['home_red_cards'] > 0) | (df['away_red_cards'] > 0)).astype(int)
        targets_added.append('has_red_card')
        print(f"   ✅ has_red_card: {df['has_red_card'].mean():.1%} positive rate")
    else:
        print(f"   ⚠️  Skipping has_red_card - missing columns")
    
    # 2. PLAYER BOOKING
    if 'home_yellow_cards' in df.columns and 'away_yellow_cards' in df.columns:
        df['any_player_booked'] = ((df['home_yellow_cards'] > 0) | (df['away_yellow_cards'] > 0)).astype(int)
        targets_added.append('any_player_booked')
        print(f"   ✅ any_player_booked: {df['any_player_booked'].mean():.1%} positive rate")
        
        df['over_3_5_bookings'] = ((df['home_yellow_cards'] + df['away_yellow_cards']) > 3.5).astype(int)
        targets_added.append('over_3_5_bookings')
        print(f"   ✅ over_3_5_bookings: {df['over_3_5_bookings'].mean():.1%} positive rate")
    else:
        print(f"   ⚠️  Skipping booking targets - missing columns")
    
    # 3. WIN BY +2 GOALS
    if 'home_goals' in df.columns and 'away_goals' in df.columns:
        if 'goal_difference' not in df.columns:
            df['goal_difference'] = df['home_goals'] - df['away_goals']
        
        df['home_win_by_2_plus'] = (df['goal_difference'] >= 2).astype(int)
        targets_added.append('home_win_by_2_plus')
        print(f"   ✅ home_win_by_2_plus: {df['home_win_by_2_plus'].mean():.1%} positive rate")
        
        df['away_win_by_2_plus'] = (df['goal_difference'] <= -2).astype(int)
        targets_added.append('away_win_by_2_plus')
        print(f"   ✅ away_win_by_2_plus: {df['away_win_by_2_plus'].mean():.1%} positive rate")
        
        df['any_team_win_by_2_plus'] = ((df['goal_difference'] >= 2) | (df['goal_difference'] <= -2)).astype(int)
        targets_added.append('any_team_win_by_2_plus')
        print(f"   ✅ any_team_win_by_2_plus: {df['any_team_win_by_2_plus'].mean():.1%} positive rate")
    else:
        print(f"   ⚠️  Skipping win by 2+ targets - missing columns")
    
    # 4. HALFTIME/FULLTIME
    if 'ht_home_goals' in df.columns and 'ht_away_goals' in df.columns:
        # Determine HT result
        df['ht_result'] = 'D'
        df.loc[df['ht_home_goals'] > df['ht_away_goals'], 'ht_result'] = 'H'
        df.loc[df['ht_home_goals'] < df['ht_away_goals'], 'ht_result'] = 'A'
        
        # Determine FT result
        df['ft_result'] = 'D'
        df.loc[df['home_goals'] > df['away_goals'], 'ft_result'] = 'H'
        df.loc[df['home_goals'] < df['away_goals'], 'ft_result'] = 'A'
        
        # Create HT/FT combined outcome
        df['ht_ft_outcome'] = df['ht_result'] + df['ft_result']
        
        # Create binary targets for each outcome
        ht_ft_outcomes = ['HH', 'DD', 'AA', 'DH', 'DA', 'HD', 'AD', 'HA', 'AH']
        
        print(f"   ✅ HT/FT outcomes:")
        for outcome in ht_ft_outcomes:
            col_name = f'ht_ft_{outcome[0].lower()}{outcome[1].lower()}'
            if outcome[0] == 'H':
                col_name = f'ht_ft_home_{outcome[1].lower()}'
                if outcome[1] == 'H':
                    col_name = 'ht_ft_home_home'
                elif outcome[1] == 'D':
                    col_name = 'ht_ft_home_draw'
                else:
                    col_name = 'ht_ft_home_away'
            elif outcome[0] == 'D':
                col_name = f'ht_ft_draw_{outcome[1].lower()}'
                if outcome[1] == 'H':
                    col_name = 'ht_ft_draw_home'
                elif outcome[1] == 'D':
                    col_name = 'ht_ft_draw_draw'
                else:
                    col_name = 'ht_ft_draw_away'
            else:  # A
                col_name = f'ht_ft_away_{outcome[1].lower()}'
                if outcome[1] == 'H':
                    col_name = 'ht_ft_away_home'
                elif outcome[1] == 'D':
                    col_name = 'ht_ft_away_draw'
                else:
                    col_name = 'ht_ft_away_away'
            
            df[col_name] = (df['ht_ft_outcome'] == outcome).astype(int)
            targets_added.append(col_name)
            print(f"      - {col_name}: {df[col_name].mean():.1%}")
    else:
        print(f"   ⚠️  Skipping HT/FT targets - missing halftime score columns")
        print(f"      Required: ht_home_goals, ht_away_goals")
    
    print(f"\n✅ Added {len(targets_added)} experimental target columns")
    
    return df, targets_added


def process_all_splits():
    """Process all data splits"""
    print("🔄 Processing experimental targets for all data splits...\n")
    
    processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
    
    if not processed_dir.exists():
        print("❌ No processed data directory found!")
        print("   Run 02_process_data.py first")
        return
    
    # Files to process
    files_to_process = [
        'training_data.csv',
        'train_split.csv',
        'val_split.csv'
    ]
    
    processed_count = 0
    
    for filename in files_to_process:
        filepath = processed_dir / filename
        
        if not filepath.exists():
            print(f"⚠️  Skipping {filename} - file not found")
            continue
        
        print(f"\n{'='*60}")
        print(f"Processing: {filename}")
        print(f"{'='*60}")
        
        # Load data
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df):,} fixtures")
        
        # Add experimental targets
        df, targets_added = add_experimental_targets(df)
        
        if targets_added:
            # Save updated data
            df.to_csv(filepath, index=False)
            print(f"\n💾 Saved updated data: {filepath}")
            processed_count += 1
        else:
            print(f"\n⚠️  No targets added - data may be missing required columns")
    
    print(f"\n{'='*60}")
    print(f"✅ Processed {processed_count} files")
    print(f"{'='*60}")
    
    if processed_count > 0:
        print("\n💡 Next Steps:")
        print("   1. Run: python scripts/03b_train_experimental_models.py")
        print("   2. Review model performance")
        print("   3. Models will be saved to models/experimental/")


def check_data_availability():
    """Check what data columns are available"""
    print("\n🔍 Checking data availability...\n")
    
    processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
    training_file = processed_dir / 'training_data.csv'
    
    if not training_file.exists():
        print("❌ No training data found!")
        return
    
    df = pd.read_csv(training_file, nrows=5)
    
    print("📊 Available columns:")
    print(f"   Total columns: {len(df.columns)}")
    
    # Check for required columns
    required_checks = {
        'Red Card Model': ['home_red_cards', 'away_red_cards'],
        'Booking Model': ['home_yellow_cards', 'away_yellow_cards'],
        'Win by 2+ Model': ['home_goals', 'away_goals'],
        'HT/FT Model': ['ht_home_goals', 'ht_away_goals', 'home_goals', 'away_goals']
    }
    
    print("\n✅ Model Data Availability:")
    for model_name, required_cols in required_checks.items():
        available = all(col in df.columns for col in required_cols)
        status = "✅ Available" if available else "❌ Missing"
        print(f"   {model_name}: {status}")
        
        if not available:
            missing = [col for col in required_cols if col not in df.columns]
            print(f"      Missing columns: {', '.join(missing)}")


def main():
    """Main execution"""
    print("🧪 Experimental Target Processing\n")
    
    # Check data availability first
    check_data_availability()
    
    # Process all splits
    process_all_splits()


if __name__ == '__main__':
    main()
