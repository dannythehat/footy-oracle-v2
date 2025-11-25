"""
Experimental Model Training Script
Trains additional LM babies for future deployment (NOT in production yet)

New Learning Machines:
1. Red Card in Game
2. Player Booking in Game  
3. Win by +2 Goals (Home/Away/Either)
4. Halftime/Fulltime Outcomes

These models train independently and don't affect the main 4 production models.
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


class ExperimentalLMTrainer:
    """Trains experimental LM babies for future deployment"""
    
    def __init__(self):
        # Save to separate experimental directory
        self.models_dir = Path(__file__).parent.parent / 'models' / 'experimental'
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        self.models = {}
        self.metrics = {}
        
        # XGBoost hyperparameters (tuned for experimental models)
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
    
    def create_target_columns(self, df):
        """Create target columns for experimental models"""
        print("\n🎯 Creating experimental target columns...")
        
        targets_created = []
        
        # 1. RED CARD IN GAME
        if 'home_red_cards' in df.columns and 'away_red_cards' in df.columns:
            df['has_red_card'] = ((df['home_red_cards'] > 0) | (df['away_red_cards'] > 0)).astype(int)
            targets_created.append('has_red_card')
            print(f"   ✅ has_red_card: {df['has_red_card'].mean():.1%} positive rate")
        
        # 2. PLAYER BOOKING (team-level: any yellow card)
        if 'home_yellow_cards' in df.columns and 'away_yellow_cards' in df.columns:
            df['any_player_booked'] = ((df['home_yellow_cards'] > 0) | (df['away_yellow_cards'] > 0)).astype(int)
            targets_created.append('any_player_booked')
            print(f"   ✅ any_player_booked: {df['any_player_booked'].mean():.1%} positive rate")
            
            # Bonus: Over 3.5 total bookings
            df['over_3_5_bookings'] = ((df['home_yellow_cards'] + df['away_yellow_cards']) > 3.5).astype(int)
            targets_created.append('over_3_5_bookings')
            print(f"   ✅ over_3_5_bookings: {df['over_3_5_bookings'].mean():.1%} positive rate")
        
        # 3. WIN BY +2 GOALS
        if 'home_goals' in df.columns and 'away_goals' in df.columns:
            df['goal_difference'] = df['home_goals'] - df['away_goals']
            
            # Home wins by 2+
            df['home_win_by_2_plus'] = (df['goal_difference'] >= 2).astype(int)
            targets_created.append('home_win_by_2_plus')
            print(f"   ✅ home_win_by_2_plus: {df['home_win_by_2_plus'].mean():.1%} positive rate")
            
            # Away wins by 2+
            df['away_win_by_2_plus'] = (df['goal_difference'] <= -2).astype(int)
            targets_created.append('away_win_by_2_plus')
            print(f"   ✅ away_win_by_2_plus: {df['away_win_by_2_plus'].mean():.1%} positive rate")
            
            # Either team wins by 2+
            df['any_team_win_by_2_plus'] = ((df['goal_difference'] >= 2) | (df['goal_difference'] <= -2)).astype(int)
            targets_created.append('any_team_win_by_2_plus')
            print(f"   ✅ any_team_win_by_2_plus: {df['any_team_win_by_2_plus'].mean():.1%} positive rate")
        
        # 4. HALFTIME/FULLTIME (requires halftime scores)
        if 'ht_home_goals' in df.columns and 'ht_away_goals' in df.columns:
            # Determine HT result
            df['ht_result'] = 'D'  # Draw
            df.loc[df['ht_home_goals'] > df['ht_away_goals'], 'ht_result'] = 'H'  # Home
            df.loc[df['ht_home_goals'] < df['ht_away_goals'], 'ht_result'] = 'A'  # Away
            
            # Determine FT result
            df['ft_result'] = 'D'  # Draw
            df.loc[df['home_goals'] > df['away_goals'], 'ft_result'] = 'H'  # Home
            df.loc[df['home_goals'] < df['away_goals'], 'ft_result'] = 'A'  # Away
            
            # Create HT/FT combined outcome
            df['ht_ft_outcome'] = df['ht_result'] + df['ft_result']
            
            # Most common patterns (train separate binary classifiers)
            df['ht_ft_home_home'] = (df['ht_ft_outcome'] == 'HH').astype(int)
            df['ht_ft_draw_draw'] = (df['ht_ft_outcome'] == 'DD').astype(int)
            df['ht_ft_away_away'] = (df['ht_ft_outcome'] == 'AA').astype(int)
            df['ht_ft_draw_home'] = (df['ht_ft_outcome'] == 'DH').astype(int)
            df['ht_ft_draw_away'] = (df['ht_ft_outcome'] == 'DA').astype(int)
            df['ht_ft_home_draw'] = (df['ht_ft_outcome'] == 'HD').astype(int)
            df['ht_ft_away_draw'] = (df['ht_ft_outcome'] == 'AD').astype(int)
            df['ht_ft_home_away'] = (df['ht_ft_outcome'] == 'HA').astype(int)
            df['ht_ft_away_home'] = (df['ht_ft_outcome'] == 'AH').astype(int)
            
            ht_ft_targets = [
                'ht_ft_home_home', 'ht_ft_draw_draw', 'ht_ft_away_away',
                'ht_ft_draw_home', 'ht_ft_draw_away', 'ht_ft_home_draw',
                'ht_ft_away_draw', 'ht_ft_home_away', 'ht_ft_away_home'
            ]
            targets_created.extend(ht_ft_targets)
            
            print(f"   ✅ HT/FT outcomes created:")
            for target in ht_ft_targets:
                print(f"      - {target}: {df[target].mean():.1%} positive rate")
        else:
            print("   ⚠️  HT/FT targets skipped (halftime score data not available)")
        
        print(f"\n✅ Created {len(targets_created)} experimental target columns")
        
        return df, targets_created
    
    def prepare_features(self, df, target_col):
        """Prepare features for training"""
        # Exclude non-feature columns
        exclude_cols = [
            'fixture_id', 'date', 'league', 'league_id', 'season',
            'home_team', 'home_team_id', 'away_team', 'away_team_id',
            # Main production targets
            'btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards',
            # Experimental targets
            'has_red_card', 'any_player_booked', 'over_3_5_bookings',
            'home_win_by_2_plus', 'away_win_by_2_plus', 'any_team_win_by_2_plus',
            'goal_difference', 'ht_result', 'ft_result', 'ht_ft_outcome',
            'ht_ft_home_home', 'ht_ft_draw_draw', 'ht_ft_away_away',
            'ht_ft_draw_home', 'ht_ft_draw_away', 'ht_ft_home_draw',
            'ht_ft_away_draw', 'ht_ft_home_away', 'ht_ft_away_home'
        ]
        
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        X = df[feature_cols].fillna(0)
        y = df[target_col].fillna(0).astype(int)
        
        return X, y, feature_cols
    
    def train_model(self, X_train, y_train, X_val, y_val, model_name):
        """Train a single model"""
        print(f"\n🔄 Training {model_name} model...")
        
        # Check class balance
        positive_rate = y_train.mean()
        if positive_rate < 0.05 or positive_rate > 0.95:
            print(f"   ⚠️  Warning: Highly imbalanced classes ({positive_rate:.1%} positive)")
        
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
            'model_params': self.model_params,
            'status': 'experimental',  # Mark as experimental
            'production_ready': False
        }
        
        with open(model_file, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"💾 Saved experimental model: {model_file}")
    
    def train_all_experimental_models(self):
        """Train all experimental LM babies"""
        print("🧪 Starting Experimental LM Babies Training Pipeline...\n")
        print("=" * 70)
        print("NOTE: These models are for TRAINING ONLY - not deployed to production")
        print("=" * 70)
        
        # Load data
        train_df, val_df = self.load_data()
        
        # Create experimental target columns
        train_df, targets_created = self.create_target_columns(train_df)
        val_df, _ = self.create_target_columns(val_df)
        
        if not targets_created:
            print("\n❌ No experimental targets could be created!")
            print("   Check if required columns exist in your data")
            return
        
        # Train each experimental model
        for target_col in targets_created:
            if target_col not in train_df.columns:
                print(f"⚠️  Skipping {target_col} - column not found")
                continue
            
            print(f"\n{'='*70}")
            print(f"Training: {target_col.replace('_', ' ').title()}")
            print(f"{'='*70}")
            
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
        
        print(f"\n{'='*70}")
        print("✅ All Experimental LM Babies Trained Successfully!")
        print(f"{'='*70}\n")
        
        self.print_summary()
    
    def save_metadata(self):
        """Save training metadata"""
        metadata = {
            'trained_at': datetime.now().isoformat(),
            'total_models': len(self.models),
            'status': 'experimental',
            'production_ready': False,
            'models': {}
        }
        
        for model_name, metrics in self.metrics.items():
            metadata['models'][model_name] = {
                'val_accuracy': metrics['val']['accuracy'],
                'val_auc_roc': metrics['val']['auc_roc'],
                'val_log_loss': metrics['val']['log_loss']
            }
        
        metadata_file = self.models_dir / 'experimental_metadata.json'
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Saved experimental metadata: {metadata_file}")
    
    def print_summary(self):
        """Print training summary"""
        print("📊 Experimental Models Training Summary:")
        print(f"{'Model':<30} {'Val Accuracy':<15} {'AUC-ROC':<10} {'Log Loss':<10}")
        print("-" * 70)
        
        for model_name, metrics in self.metrics.items():
            display_name = model_name.replace('_', ' ').title()
            accuracy = metrics['val']['accuracy']
            auc = metrics['val']['auc_roc']
            loss = metrics['val']['log_loss']
            
            print(f"{display_name:<30} {accuracy:<15.4f} {auc:<10.4f} {loss:<10.4f}")
        
        # Calculate average
        avg_accuracy = np.mean([m['val']['accuracy'] for m in self.metrics.values()])
        avg_auc = np.mean([m['val']['auc_roc'] for m in self.metrics.values()])
        
        print("-" * 70)
        print(f"{'Average':<30} {avg_accuracy:<15.4f} {avg_auc:<10.4f}")
        
        print(f"\n💡 Next Steps:")
        print(f"   1. Review model performance above")
        print(f"   2. Models saved to: {self.models_dir}")
        print(f"   3. When ready for production, integrate with deployment pipeline")
        print(f"   4. These models are SEPARATE from your main 4 production models")


def main():
    """Main execution"""
    trainer = ExperimentalLMTrainer()
    trainer.train_all_experimental_models()


if __name__ == '__main__':
    main()
