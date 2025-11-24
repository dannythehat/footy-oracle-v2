"""
Model Training Script
Trains 4 LM babies (BTTS, Goals, Corners, Cards) with XGBoost
"""

import os
import sys
import json
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class LMTrainer:
    """Trains the 4 LM babies"""
    
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / 'models'
        self.models_dir.mkdir(exist_ok=True)
        
        self.models = {}
        self.metrics = {}
        
        # XGBoost hyperparameters
        self.model_params = {
            'n_estimators': 300,
            'max_depth': 7,
            'learning_rate': 0.05,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 3,
            'gamma': 0.1,
            'random_state': 42,
            'eval_metric': 'logloss',
            'early_stopping_rounds': 20
        }
    
    def load_data(self):
        """Load processed training data"""
        processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
        
        train_file = processed_dir / 'train_split.csv'
        val_file = processed_dir / 'val_split.csv'
        
        if not train_file.exists() or not val_file.exists():
            # Fallback to full training data
            full_file = processed_dir / 'training_data.csv'
            if not full_file.exists():
                raise FileNotFoundError("No processed data found! Run 02_process_data.py first")
            
            print("⚠️  Using full dataset (no train/val split found)")
            df = pd.read_csv(full_file)
            
            # Create 80/20 split
            split_idx = int(len(df) * 0.8)
            train_df = df.iloc[:split_idx]
            val_df = df.iloc[split_idx:]
        else:
            train_df = pd.read_csv(train_file)
            val_df = pd.read_csv(val_file)
        
        print(f"✅ Loaded data:")
        print(f"   Training: {len(train_df):,} fixtures")
        print(f"   Validation: {len(val_df):,} fixtures")
        
        return train_df, val_df
    
    def prepare_features(self, df, target_col):
        """Prepare features for training"""
        # Exclude non-feature columns
        exclude_cols = [
            'fixture_id', 'date', 'league', 'league_id', 'season',
            'home_team', 'home_team_id', 'away_team', 'away_team_id',
            'btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards'
        ]
        
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        X = df[feature_cols].fillna(0)
        y = df[target_col].fillna(0).astype(int)
        
        return X, y, feature_cols
    
    def train_model(self, X_train, y_train, X_val, y_val, model_name):
        """Train a single model"""
        print(f"\n🔄 Training {model_name} model...")
        
        # Initialize model
        model = XGBClassifier(**self.model_params)
        
        # Train with early stopping
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        # Predictions
        train_pred = model.predict(X_train)
        train_proba = model.predict_proba(X_train)[:, 1]
        
        val_pred = model.predict(X_val)
        val_proba = model.predict_proba(X_val)[:, 1]
        
        # Calculate metrics
        metrics = {
            'train': {
                'accuracy': accuracy_score(y_train, train_pred),
                'log_loss': log_loss(y_train, train_proba),
                'auc_roc': roc_auc_score(y_train, train_proba)
            },
            'val': {
                'accuracy': accuracy_score(y_val, val_pred),
                'log_loss': log_loss(y_val, val_proba),
                'auc_roc': roc_auc_score(y_val, val_proba)
            }
        }
        
        # Print results
        print(f"✅ {model_name} trained:")
        print(f"   Training Accuracy:   {metrics['train']['accuracy']:.4f}")
        print(f"   Validation Accuracy: {metrics['val']['accuracy']:.4f}")
        print(f"   Validation AUC-ROC:  {metrics['val']['auc_roc']:.4f}")
        print(f"   Validation Log Loss: {metrics['val']['log_loss']:.4f}")
        
        # Confusion matrix
        cm = confusion_matrix(y_val, val_pred)
        print(f"\n   Confusion Matrix:")
        print(f"   TN: {cm[0,0]:,}  FP: {cm[0,1]:,}")
        print(f"   FN: {cm[1,0]:,}  TP: {cm[1,1]:,}")
        
        return model, metrics
    
    def save_model(self, model, model_name, feature_cols, metrics):
        """Save trained model"""
        model_file = self.models_dir / f'{model_name}_model.pkl'
        
        model_data = {
            'model': model,
            'feature_cols': feature_cols,
            'metrics': metrics,
            'trained_at': datetime.now().isoformat(),
            'model_params': self.model_params
        }
        
        with open(model_file, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"💾 Saved model: {model_file}")
    
    def train_all_models(self):
        """Train all 4 LM babies"""
        print("🤖 Starting LM Babies Training Pipeline...\n")
        
        # Load data
        train_df, val_df = self.load_data()
        
        # Define targets
        targets = {
            'btts': 'BTTS (Both Teams To Score)',
            'over_2_5_goals': 'Over 2.5 Goals',
            'over_9_5_corners': 'Over 9.5 Corners',
            'over_3_5_cards': 'Over 3.5 Cards'
        }
        
        # Train each model
        for target_col, display_name in targets.items():
            if target_col not in train_df.columns:
                print(f"⚠️  Skipping {display_name} - column not found")
                continue
            
            print(f"\n{'='*60}")
            print(f"Training: {display_name}")
            print(f"{'='*60}")
            
            # Prepare features
            X_train, y_train, feature_cols = self.prepare_features(train_df, target_col)
            X_val, y_val, _ = self.prepare_features(val_df, target_col)
            
            print(f"Features: {len(feature_cols)}")
            print(f"Class distribution (train): {y_train.mean():.1%} positive")
            
            # Train model
            model, metrics = self.train_model(X_train, y_train, X_val, y_val, target_col)
            
            # Save model
            self.save_model(model, target_col, feature_cols, metrics)
            
            # Store for summary
            self.models[target_col] = model
            self.metrics[target_col] = metrics
        
        # Save metadata
        self.save_metadata()
        
        print(f"\n{'='*60}")
        print("✅ All LM Babies Trained Successfully!")
        print(f"{'='*60}\n")
        
        self.print_summary()
    
    def save_metadata(self):
        """Save training metadata"""
        metadata = {
            'trained_at': datetime.now().isoformat(),
            'total_models': len(self.models),
            'models': {}
        }
        
        for model_name, metrics in self.metrics.items():
            metadata['models'][model_name] = {
                'val_accuracy': metrics['val']['accuracy'],
                'val_auc_roc': metrics['val']['auc_roc'],
                'val_log_loss': metrics['val']['log_loss']
            }
        
        metadata_file = self.models_dir / 'metadata.json'
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Saved metadata: {metadata_file}")
    
    def print_summary(self):
        """Print training summary"""
        print("📊 Training Summary:")
        print(f"{'Model':<20} {'Val Accuracy':<15} {'AUC-ROC':<10} {'Log Loss':<10}")
        print("-" * 60)
        
        for model_name, metrics in self.metrics.items():
            display_name = model_name.replace('_', ' ').title()
            accuracy = metrics['val']['accuracy']
            auc = metrics['val']['auc_roc']
            loss = metrics['val']['log_loss']
            
            print(f"{display_name:<20} {accuracy:<15.4f} {auc:<10.4f} {loss:<10.4f}")
        
        # Calculate average
        avg_accuracy = np.mean([m['val']['accuracy'] for m in self.metrics.values()])
        avg_auc = np.mean([m['val']['auc_roc'] for m in self.metrics.values()])
        
        print("-" * 60)
        print(f"{'Average':<20} {avg_accuracy:<15.4f} {avg_auc:<10.4f}")
        print()


def main():
    """Main execution"""
    trainer = LMTrainer()
    trainer.train_all_models()


if __name__ == '__main__':
    main()
