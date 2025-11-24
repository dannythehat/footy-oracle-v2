"""
Data Upload Helper
Helps you prepare and upload your 100k fixtures to GitHub
"""

import os
import sys
import pandas as pd
from pathlib import Path


def check_csv_format(csv_path):
    """Check if CSV has required columns"""
    required_cols = [
        'fixture_id', 'date', 'home_team', 'away_team',
        'home_goals', 'away_goals', 'total_goals'
    ]
    
    recommended_cols = [
        'league', 'home_corners', 'away_corners', 'total_corners',
        'home_yellow_cards', 'away_yellow_cards', 'total_cards'
    ]
    
    try:
        df = pd.read_csv(csv_path, nrows=5)
        
        print(f"\n📊 Checking {Path(csv_path).name}...")
        print(f"   Rows: {len(pd.read_csv(csv_path)):,}")
        print(f"   Columns: {len(df.columns)}")
        
        # Check required columns
        missing_required = [col for col in required_cols if col not in df.columns]
        if missing_required:
            print(f"   ❌ Missing required columns: {', '.join(missing_required)}")
            return False
        else:
            print(f"   ✅ All required columns present")
        
        # Check recommended columns
        missing_recommended = [col for col in recommended_cols if col not in df.columns]
        if missing_recommended:
            print(f"   ⚠️  Missing recommended columns: {', '.join(missing_recommended)}")
        else:
            print(f"   ✅ All recommended columns present")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error reading CSV: {e}")
        return False


def get_file_size_mb(file_path):
    """Get file size in MB"""
    size_bytes = os.path.getsize(file_path)
    size_mb = size_bytes / (1024 * 1024)
    return size_mb


def main():
    """Main execution"""
    print("🚀 Footy Oracle - Data Upload Helper\n")
    print("This script helps you prepare your 100k fixtures for upload.\n")
    
    # Get data directory
    data_dir = input("📁 Enter path to your CSV files (or press Enter for current directory): ").strip()
    if not data_dir:
        data_dir = "."
    
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"❌ Directory not found: {data_dir}")
        return
    
    # Find CSV files
    csv_files = list(data_path.glob("*.csv"))
    
    if not csv_files:
        print(f"❌ No CSV files found in {data_dir}")
        return
    
    print(f"\n✅ Found {len(csv_files)} CSV files:\n")
    
    total_size = 0
    valid_files = []
    
    for csv_file in csv_files:
        size_mb = get_file_size_mb(csv_file)
        total_size += size_mb
        
        print(f"📄 {csv_file.name}")
        print(f"   Size: {size_mb:.2f} MB")
        
        if size_mb > 100:
            print(f"   ⚠️  WARNING: File exceeds GitHub's 100MB limit!")
            print(f"   Consider splitting this file by year or league")
        
        if check_csv_format(csv_file):
            valid_files.append(csv_file)
        
        print()
    
    print(f"{'='*60}")
    print(f"📊 Summary:")
    print(f"   Total files: {len(csv_files)}")
    print(f"   Valid files: {len(valid_files)}")
    print(f"   Total size: {total_size:.2f} MB")
    
    if total_size > 1000:
        print(f"   ⚠️  WARNING: Total size exceeds 1GB (GitHub recommendation)")
    
    print(f"{'='*60}\n")
    
    if valid_files:
        print("✅ Your data is ready for upload!\n")
        print("Next steps:")
        print("1. Copy these files to ml_training/data/raw/")
        print("2. Run: git add ml_training/data/raw/*.csv")
        print("3. Run: git commit -m '📊 Add training fixtures'")
        print("4. Run: git push")
        print("\nOr use the automated script:")
        print("   bash ml_training/pipeline.sh")
    else:
        print("❌ No valid CSV files found. Please check your data format.")
    
    # Offer to copy files
    if valid_files:
        copy = input("\n📋 Copy files to ml_training/data/raw/ now? (y/n): ").strip().lower()
        
        if copy == 'y':
            raw_dir = Path(__file__).parent / 'data' / 'raw'
            raw_dir.mkdir(parents=True, exist_ok=True)
            
            for csv_file in valid_files:
                dest = raw_dir / csv_file.name
                
                # Copy file
                import shutil
                shutil.copy2(csv_file, dest)
                print(f"✅ Copied: {csv_file.name}")
            
            print(f"\n✅ All files copied to {raw_dir}")
            print("\nYou can now run:")
            print("   cd ml_training")
            print("   bash pipeline.sh")


if __name__ == '__main__':
    main()
