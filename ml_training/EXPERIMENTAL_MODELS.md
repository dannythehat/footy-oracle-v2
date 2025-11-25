# Experimental Learning Machines 🧪

This document describes the **experimental learning machines** that are being trained separately from the main 4 production models.

## Status: TRAINING ONLY (Not in Production)

These models are being trained to get smart for future deployment. They do **NOT** interfere with the main 4 production models.

---

## Experimental Models

### 1. 🔴 Red Card in Game
**Target**: `has_red_card`

Predicts whether any red card will be shown in the match.

**Features Used**:
- Team discipline history (yellow/red card averages)
- Referee strictness patterns
- Derby/rivalry matches
- Recent card trends
- League-specific card rates

**Expected Accuracy**: 65-75%

**Data Required**:
- `home_red_cards`
- `away_red_cards`

---

### 2. 📒 Player Booking in Game
**Targets**: 
- `any_player_booked` - Any yellow card shown
- `over_3_5_bookings` - More than 3.5 total bookings

Predicts booking activity in the match (team-level, not individual players).

**Features Used**:
- Team booking history
- Referee card tendencies
- Match importance/intensity
- Historical H2H booking rates
- League booking averages

**Expected Accuracy**: 70-80%

**Data Required**:
- `home_yellow_cards`
- `away_yellow_cards`

**Note**: Individual player bookings require player-level data which may not be available. This uses team-level aggregates.

---

### 3. ⚽ Win by +2 Goals
**Targets**:
- `home_win_by_2_plus` - Home team wins by 2+ goals
- `away_win_by_2_plus` - Away team wins by 2+ goals  
- `any_team_win_by_2_plus` - Either team wins by 2+ goals

Predicts dominant victories with 2+ goal margins.

**Features Used**:
- Team attacking/defensive strength
- Recent form and momentum
- Home/away performance splits
- H2H goal differences
- League goal-scoring patterns
- Odds/market expectations (if available)

**Expected Accuracy**: 70-75%

**Data Required**:
- `home_goals`
- `away_goals`

**Price Bias Mitigation**:
- Include underdog upset patterns
- Weight recent form heavily
- Use H2H historical margins
- Consider motivation factors (league position, relegation battles)

---

### 4. 🕐 Halftime/Fulltime (HT/FT)
**Targets** (9 possible outcomes):
- `ht_ft_home_home` (HH) - Home leading at HT, wins at FT
- `ht_ft_draw_draw` (DD) - Draw at HT, draw at FT
- `ht_ft_away_away` (AA) - Away leading at HT, wins at FT
- `ht_ft_draw_home` (DH) - Draw at HT, home wins at FT
- `ht_ft_draw_away` (DA) - Draw at HT, away wins at FT
- `ht_ft_home_draw` (HD) - Home leading at HT, draw at FT
- `ht_ft_away_draw` (AD) - Away leading at HT, draw at FT
- `ht_ft_home_away` (HA) - Home leading at HT, away wins at FT
- `ht_ft_away_home` (AH) - Away leading at HT, home wins at FT

Predicts the combined halftime and fulltime result.

**Features Used**:
- First-half specific stats (shots, possession, xG in first 45)
- Team fast-start vs slow-start patterns
- Second-half comeback history
- Fitness/stamina indicators
- Tactical approach (defensive vs attacking)
- Odds as features (to account for market bias)

**Expected Accuracy**: 40-50% (multi-class problem is inherently harder)

**Data Required**:
- `ht_home_goals` - Halftime home goals
- `ht_away_goals` - Halftime away goals
- `home_goals` - Fulltime home goals
- `away_goals` - Fulltime away goals

**Price Bias Challenge**:
- ⚠️ **Significant bias toward favorites**
- HH (favorite leading at HT and winning) is most common
- Mitigation: Use odds as features, train on upset patterns, weight underdog scenarios

**Training Approach**:
- Train 9 separate binary classifiers (one per outcome)
- Focus on most common patterns first (HH, DD, AA, DH, DA)
- May need ensemble approach for rare outcomes (HA, AH)

---

## Training Pipeline

### Run Experimental Training
```bash
cd ml_training
python scripts/03b_train_experimental_models.py
```

### Output Location
Models saved to: `ml_training/models/experimental/`

### Metadata
Training metadata saved to: `ml_training/models/experimental/experimental_metadata.json`

---

## Data Requirements Checklist

Before running experimental training, ensure your data includes:

### Required for All Models:
- ✅ `home_goals`
- ✅ `away_goals`

### Red Card Model:
- ⚠️ `home_red_cards`
- ⚠️ `away_red_cards`

### Booking Model:
- ⚠️ `home_yellow_cards`
- ⚠️ `away_yellow_cards`

### HT/FT Model:
- ⚠️ `ht_home_goals` (halftime home goals)
- ⚠️ `ht_away_goals` (halftime away goals)

**Note**: Script will automatically skip models if required data columns are missing.

---

## Integration with Main Pipeline

### Current Setup:
- **Main Models**: `03_train_models.py` → `models/` directory
- **Experimental Models**: `03b_train_experimental_models.py` → `models/experimental/` directory

### Separation:
- ✅ Completely separate training scripts
- ✅ Separate model storage directories
- ✅ Separate metadata files
- ✅ No interference with production models
- ✅ Can run independently or in parallel

### Future Deployment:
When ready to deploy experimental models to production:
1. Review performance metrics in `experimental_metadata.json`
2. Move models from `models/experimental/` to `models/`
3. Update `05_deploy.py` to include new models
4. Update frontend to display new predictions
5. Update API endpoints to serve new predictions

---

## Performance Monitoring

### Metrics Tracked:
- **Accuracy**: Overall prediction correctness
- **AUC-ROC**: Model's ability to distinguish classes
- **Log Loss**: Confidence calibration
- **Confusion Matrix**: True/false positives/negatives

### Success Criteria:
- Red Card: >65% accuracy
- Bookings: >70% accuracy
- Win by 2+: >70% accuracy
- HT/FT: >40% accuracy (multi-class)

---

## Next Steps

1. ✅ **Created**: Experimental training script
2. ⏳ **Pending**: Verify data columns exist
3. ⏳ **Pending**: Run initial training
4. ⏳ **Pending**: Evaluate performance
5. ⏳ **Pending**: Tune hyperparameters if needed
6. ⏳ **Future**: Deploy to production when ready

---

## Notes

- These models train on the same feature set as main models
- They use the same XGBoost architecture
- Hyperparameters may need tuning per model
- Some models (HT/FT) may benefit from different algorithms
- Consider ensemble approaches for complex outcomes
- Monitor for overfitting on rare events (red cards)

---

**Last Updated**: 2025-11-25
**Status**: Experimental - Training Only
**Production Ready**: No
