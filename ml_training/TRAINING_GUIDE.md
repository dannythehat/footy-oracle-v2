# 🤖 LM Training & Analytics Hub

Complete training pipeline and intelligence dashboard for the Footy Oracle LM babies.

## 🎯 Quick Start

### 1. Upload Your 100k Dataset

```bash
# Clone the repo
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2

# Copy your CSV files to ml_training/data/raw/
cp /path/to/your/fixtures_*.csv ml_training/data/raw/

# Push to GitHub
git add ml_training/data/raw/*.csv
git commit -m "📊 Add 100k training fixtures"
git push
```

### 2. Train Locally (First Time)

```bash
cd ml_training

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your API_FOOTBALL_KEY

# Run the full pipeline
bash pipeline.sh
```

This will:
1. ✅ Process your 100k fixtures
2. ✅ Engineer advanced features
3. ✅ Train 4 LM babies (BTTS, Goals, Corners, Cards)
4. ✅ Evaluate performance
5. ✅ Deploy to production
6. ✅ Generate analytics data

### 3. View Analytics Hub

Open `analytics_hub/dashboard/index.html` in your browser to see:
- 📈 Real-time accuracy metrics
- 📊 30-day evolution charts
- 🎯 Model performance breakdown
- 🚀 Intelligence trends

## 🔄 Automated Daily Training

Once set up, GitHub Actions will automatically:
- **Every day at 2 AM UTC**:
  1. Fetch yesterday's fixtures from API-Football
  2. Process and merge with existing data
  3. Retrain all 4 models
  4. Evaluate performance
  5. Deploy if improved
  6. Update analytics hub

### Setup GitHub Secrets

Add your API key to GitHub:
1. Go to repo Settings → Secrets → Actions
2. Add secret: `API_FOOTBALL_KEY` = your API key

## 📊 Training Scripts

### `01_fetch_fixtures.py`
Fetches completed fixtures from API-Football for yesterday's date.

```bash
python ml_training/scripts/01_fetch_fixtures.py
```

### `02_process_data.py`
Cleans data, engineers features, creates train/val splits.

```bash
python ml_training/scripts/02_process_data.py
```

### `03_train_models.py`
Trains 4 XGBoost models with advanced hyperparameters.

```bash
python ml_training/scripts/03_train_models.py
```

### `04_evaluate.py`
Evaluates models, tracks performance, logs metrics.

```bash
python ml_training/scripts/04_evaluate.py
```

### `05_deploy.py`
Deploys trained models to `shared/ml_outputs/`.

```bash
python ml_training/scripts/05_deploy.py
```

## 📁 Directory Structure

```
ml_training/
├── data/
│   ├── raw/              # Your 100k CSV files
│   ├── processed/        # Cleaned & feature-engineered data
│   └── incremental/      # Daily new fixtures
├── models/               # Trained .pkl files
├── logs/                 # Performance history
├── scripts/              # Training pipeline scripts
└── config/               # Configuration files

analytics_hub/
├── dashboard/
│   └── index.html        # Stunning analytics dashboard
└── metrics/
    ├── daily_performance.json      # Daily snapshots
    └── historical_trends.json      # Long-term trends
```

## 🎯 Model Performance Tracking

The system tracks:
- **Accuracy**: Correct predictions / Total predictions
- **AUC-ROC**: Area under ROC curve
- **Log Loss**: Probabilistic accuracy
- **F1 Score**: Balance of precision & recall
- **7-day trends**: Recent performance
- **30-day trends**: Monthly evolution
- **Best ever**: Peak performance achieved

## 🚀 Analytics Hub Features

### Summary Cards
- Current accuracy for each model
- 7-day improvement trends
- Visual progress bars

### Evolution Chart
- 30-day accuracy timeline
- All 4 models on one chart
- Smooth trend lines

### Model Performance Grid
- Detailed metrics per model
- Current vs historical comparison
- Best ever achievements

### Accuracy Comparison
- Bar chart comparing current vs best
- Easy visual comparison
- Color-coded performance

## 💡 Tips for Success

### Data Quality
- Ensure your CSV has these columns:
  - `fixture_id`, `date`, `league`, `home_team`, `away_team`
  - `home_goals`, `away_goals`, `total_goals`
  - `home_corners`, `away_corners`, `total_corners`
  - `home_yellow_cards`, `away_yellow_cards`, etc.

### Training Frequency
- Daily training keeps models fresh
- More data = better predictions
- Track trends to see improvement

### Feature Engineering
- The pipeline calculates 50+ features automatically
- Rolling averages (last 5 matches)
- League-based statistics
- Team form indicators

## 🔧 Troubleshooting

### "No data found"
- Check that CSV files are in `ml_training/data/raw/`
- Verify CSV format matches expected columns

### "Model training failed"
- Check for missing target columns (btts, over_2_5_goals, etc.)
- Ensure sufficient data (minimum 1000 fixtures recommended)

### "Analytics hub shows no data"
- Run training pipeline first to generate metrics
- Check that `analytics_hub/metrics/` has JSON files

## 📈 Business Use Cases

### Investor Pitch
Show the analytics hub to demonstrate:
- Continuous improvement over time
- Measurable intelligence growth
- Data-driven decision making

### Feature Expansion
Track performance when adding:
- Bet builders (combo bets)
- Referee analysis
- Weather impact
- New markets

### Quality Assurance
Monitor for:
- Model degradation
- Data quality issues
- Performance anomalies

## 🎨 Customization

### Change Training Schedule
Edit `.github/workflows/daily-lm-training.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Change time here
```

### Adjust Model Parameters
Edit `ml_training/scripts/03_train_models.py`:
```python
self.model_params = {
    'n_estimators': 300,  # Increase for better accuracy
    'max_depth': 7,       # Adjust complexity
    'learning_rate': 0.05 # Fine-tune learning
}
```

### Add New Metrics
Edit `ml_training/scripts/04_evaluate.py` to track additional metrics.

## 🌟 Next Steps

1. **Upload your 100k data** to `ml_training/data/raw/`
2. **Run initial training** with `bash pipeline.sh`
3. **View analytics hub** to see baseline performance
4. **Set up GitHub secret** for automated daily training
5. **Monitor progress** as models improve daily

## 📞 Support

For issues or questions:
- Check existing documentation in `ml_training/`
- Review training logs in `ml_training/logs/`
- Examine model metadata in `ml_training/models/metadata.json`

---

**Built with ❤️ for Footy Oracle**
