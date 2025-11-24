"""
Deployment Script
Deploys trained models to production (shared/ml_outputs)
"""

import os
import sys
import json
import pickle
import shutil
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


def deploy_models():
    """Deploy trained models to shared directory"""
    print("🚀 Starting Model Deployment...\n")
    
    models_dir = Path(__file__).parent.parent / 'models'
    shared_dir = Path(__file__).parent.parent.parent / 'shared' / 'ml_outputs'
    shared_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy model files
    models = ['btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards']
    
    deployed_count = 0
    for model_name in models:
        model_file = models_dir / f'{model_name}_model.pkl'
        
        if model_file.exists():
            dest_file = shared_dir / f'{model_name}_model.pkl'
            shutil.copy2(model_file, dest_file)
            print(f"✅ Deployed: {model_name}_model.pkl")
            deployed_count += 1
        else:
            print(f"⚠️  Skipped: {model_name}_model.pkl (not found)")
    
    # Copy metadata
    metadata_file = models_dir / 'metadata.json'
    if metadata_file.exists():
        dest_metadata = shared_dir / 'metadata.json'
        shutil.copy2(metadata_file, dest_metadata)
        print(f"✅ Deployed: metadata.json")
    
    print(f"\n✅ Deployment complete! {deployed_count} models deployed")
    print(f"📁 Location: {shared_dir}")


def generate_deployment_report():
    """Generate deployment report"""
    models_dir = Path(__file__).parent.parent / 'models'
    metadata_file = models_dir / 'metadata.json'
    
    if not metadata_file.exists():
        print("⚠️  No metadata found")
        return
    
    with open(metadata_file, 'r') as f:
        metadata = json.load(f)
    
    print(f"\n{'='*60}")
    print("📊 Deployment Report")
    print(f"{'='*60}")
    print(f"Deployed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total models: {metadata['total_models']}")
    print(f"\nModel Performance:")
    
    for model_name, metrics in metadata['models'].items():
        display_name = model_name.replace('_', ' ').title()
        print(f"  {display_name}:")
        print(f"    Accuracy: {metrics['val_accuracy']:.4f}")
        print(f"    AUC-ROC:  {metrics['val_auc_roc']:.4f}")
    
    print(f"{'='*60}\n")


def main():
    """Main execution"""
    deploy_models()
    generate_deployment_report()


if __name__ == '__main__':
    main()
