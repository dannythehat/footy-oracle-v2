"""
Model Evaluation Script
Evaluates trained models and tracks performance over time
"""

import os
import sys
import json
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, log_loss

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class ModelEvaluator:
    """Evaluates LM babies and tracks progress"""
    
    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / 'models'
        self.logs_dir = Path(__file__).parent.parent / 'logs'
        self.logs_dir.mkdir(exist_ok=True)
        
        self.analytics_dir = Path(__file__).parent.parent.parent / 'analytics_hub' / 'metrics'
        self.analytics_dir.mkdir(parents=True, exist_ok=True)
    
    def load_model(self, model_name):
        """Load a trained model"""
        model_file = self.models_dir / f'{model_name}_model.pkl'
        
        if not model_file.exists():
            raise FileNotFoundError(f"Model not found: {model_file}")
        
        with open(model_file, 'rb') as f:
            model_data = pickle.load(f)
        
        return model_data
    
    def load_validation_data(self):
        """Load validation data"""
        processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
        val_file = processed_dir / 'val_split.csv'
        
        if not val_file.exists():
            raise FileNotFoundError("Validation data not found!")
        
        return pd.read_csv(val_file)
    
    def evaluate_model(self, model_data, val_df, target_col):
        """Evaluate a single model"""
        model = model_data['model']
        feature_cols = model_data['feature_cols']
        
        # Prepare features
        X_val = val_df[feature_cols].fillna(0)
        y_val = val_df[target_col].fillna(0).astype(int)
        
        # Predictions
        y_pred = model.predict(X_val)
        y_proba = model.predict_proba(X_val)[:, 1]
        
        # Calculate comprehensive metrics
        metrics = {
            'accuracy': accuracy_score(y_val, y_pred),
            'precision': precision_score(y_val, y_pred, zero_division=0),
            'recall': recall_score(y_val, y_pred, zero_division=0),
            'f1_score': f1_score(y_val, y_pred, zero_division=0),
            'auc_roc': roc_auc_score(y_val, y_proba),
            'log_loss': log_loss(y_val, y_proba),
            'confidence_avg': y_proba.mean(),
            'positive_rate': y_pred.mean(),
            'actual_positive_rate': y_val.mean()
        }
        
        return metrics
    
    def compare_with_previous(self, model_name, current_metrics):
        """Compare current performance with previous version"""
        history_file = self.logs_dir / f'{model_name}_history.json'
        
        if not history_file.exists():
            return None
        
        with open(history_file, 'r') as f:
            history = json.load(f)
        
        if not history:
            return None
        
        # Get last entry
        last_entry = history[-1]
        last_accuracy = last_entry['metrics']['accuracy']
        current_accuracy = current_metrics['accuracy']
        
        improvement = current_accuracy - last_accuracy
        
        return {
            'previous_accuracy': last_accuracy,
            'current_accuracy': current_accuracy,
            'improvement': improvement,
            'improved': improvement > 0
        }
    
    def log_performance(self, model_name, metrics, comparison):
        """Log performance to history"""
        history_file = self.logs_dir / f'{model_name}_history.json'
        
        # Load existing history
        if history_file.exists():
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = []
        
        # Add new entry
        entry = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'comparison': comparison
        }
        
        history.append(entry)
        
        # Save updated history
        with open(history_file, 'w') as f:
            json.dump(history, f, indent=2)
    
    def save_analytics_data(self, all_metrics):
        """Save data for analytics hub"""
        # Daily performance snapshot
        daily_file = self.analytics_dir / 'daily_performance.json'
        
        if daily_file.exists():
            with open(daily_file, 'r') as f:
                daily_data = json.load(f)
        else:
            daily_data = []
        
        daily_entry = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timestamp': datetime.now().isoformat(),
            'models': all_metrics
        }
        
        daily_data.append(daily_entry)
        
        # Keep last 365 days
        daily_data = daily_data[-365:]
        
        with open(daily_file, 'w') as f:
            json.dump(daily_data, f, indent=2)
        
        # Calculate trends
        self.calculate_trends(daily_data)
    
    def calculate_trends(self, daily_data):
        """Calculate performance trends"""
        if len(daily_data) < 2:
            return
        
        trends = {}
        
        for model_name in ['btts', 'over_2_5_goals', 'over_9_5_corners', 'over_3_5_cards']:
            accuracies = []
            dates = []
            
            for entry in daily_data:
                if model_name in entry['models']:
                    accuracies.append(entry['models'][model_name]['accuracy'])
                    dates.append(entry['date'])
            
            if len(accuracies) >= 2:
                # Calculate trends
                recent_7 = accuracies[-7:] if len(accuracies) >= 7 else accuracies
                recent_30 = accuracies[-30:] if len(accuracies) >= 30 else accuracies
                
                trends[model_name] = {
                    'current': accuracies[-1],
                    'avg_7_days': np.mean(recent_7),
                    'avg_30_days': np.mean(recent_30),
                    'improvement_7_days': accuracies[-1] - np.mean(recent_7[:-1]) if len(recent_7) > 1 else 0,
                    'improvement_30_days': accuracies[-1] - np.mean(recent_30[:-1]) if len(recent_30) > 1 else 0,
                    'best_ever': max(accuracies),
                    'worst_ever': min(accuracies)
                }
        
        # Save trends
        trends_file = self.analytics_dir / 'historical_trends.json'
        with open(trends_file, 'w') as f:
            json.dump(trends, f, indent=2)
    
    def evaluate_all_models(self):
        """Evaluate all trained models"""
        print("📊 Starting Model Evaluation...\n")
        
        # Load validation data
        val_df = self.load_validation_data()
        print(f"✅ Loaded validation data: {len(val_df):,} fixtures\n")
        
        # Define models
        models = {
            'btts': 'BTTS',
            'over_2_5_goals': 'Over 2.5 Goals',
            'over_9_5_corners': 'Over 9.5 Corners',
            'over_3_5_cards': 'Over 3.5 Cards'
        }
        
        all_metrics = {}
        all_improved = True
        
        # Evaluate each model
        for model_name, display_name in models.items():
            model_file = self.models_dir / f'{model_name}_model.pkl'
            
            if not model_file.exists():
                print(f"⚠️  Skipping {display_name} - model not found")
                continue
            
            print(f"{'='*60}")
            print(f"Evaluating: {display_name}")
            print(f"{'='*60}")
            
            # Load model
            model_data = self.load_model(model_name)
            
            # Evaluate
            metrics = self.evaluate_model(model_data, val_df, model_name)
            
            # Compare with previous
            comparison = self.compare_with_previous(model_name, metrics)
            
            # Print results
            print(f"\n📈 Performance Metrics:")
            print(f"   Accuracy:    {metrics['accuracy']:.4f}")
            print(f"   Precision:   {metrics['precision']:.4f}")
            print(f"   Recall:      {metrics['recall']:.4f}")
            print(f"   F1 Score:    {metrics['f1_score']:.4f}")
            print(f"   AUC-ROC:     {metrics['auc_roc']:.4f}")
            print(f"   Log Loss:    {metrics['log_loss']:.4f}")
            
            if comparison:
                print(f"\n📊 Comparison with Previous:")
                print(f"   Previous:    {comparison['previous_accuracy']:.4f}")
                print(f"   Current:     {comparison['current_accuracy']:.4f}")
                print(f"   Change:      {comparison['improvement']:+.4f}")
                
                if comparison['improved']:
                    print(f"   Status:      ✅ IMPROVED")
                else:
                    print(f"   Status:      ⚠️  DECLINED")
                    all_improved = False
            else:
                print(f"\n   Status:      🆕 FIRST TRAINING")
            
            # Log performance
            self.log_performance(model_name, metrics, comparison)
            
            # Store for analytics
            all_metrics[model_name] = metrics
            
            print()
        
        # Save analytics data
        self.save_analytics_data(all_metrics)
        
        print(f"{'='*60}")
        print("✅ Evaluation Complete!")
        print(f"{'='*60}\n")
        
        # Print summary
        self.print_summary(all_metrics)
        
        return all_improved
    
    def print_summary(self, all_metrics):
        """Print evaluation summary"""
        print("📊 Evaluation Summary:")
        print(f"{'Model':<20} {'Accuracy':<12} {'AUC-ROC':<12} {'F1 Score':<12}")
        print("-" * 60)
        
        for model_name, metrics in all_metrics.items():
            display_name = model_name.replace('_', ' ').title()
            print(f"{display_name:<20} {metrics['accuracy']:<12.4f} {metrics['auc_roc']:<12.4f} {metrics['f1_score']:<12.4f}")
        
        # Calculate average
        avg_accuracy = np.mean([m['accuracy'] for m in all_metrics.values()])
        avg_auc = np.mean([m['auc_roc'] for m in all_metrics.values()])
        avg_f1 = np.mean([m['f1_score'] for m in all_metrics.values()])
        
        print("-" * 60)
        print(f"{'Average':<20} {avg_accuracy:<12.4f} {avg_auc:<12.4f} {avg_f1:<12.4f}")
        print()


def main():
    """Main execution"""
    evaluator = ModelEvaluator()
    all_improved = evaluator.evaluate_all_models()
    
    # Return exit code (0 if all improved, 1 if any declined)
    sys.exit(0 if all_improved else 1)


if __name__ == '__main__':
    main()
