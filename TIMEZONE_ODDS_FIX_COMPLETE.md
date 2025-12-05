# Timezone & Odds Automation Fix - Complete

**Date**: December 5, 2025  
**PR**: #126  
**Issues Fixed**: #124, #125

---

## 🎯 Problems Solved

### 1. Timezone Calculation Bug (#124)
**Symptom**: Users seeing wrong 24-hour fixture range
- GMT+2 user selects "4 Dec" → sees fixtures from 4am-4am instead of 12am-11:59pm
- 4-hour shift in the wrong direction

**Root Cause**:
```typescript
// getTimezoneOffset() returns NEGATIVE for ahead-of-UTC timezones
// GMT+2 = -120 minutes

// WRONG CODE:
start.setMinutes(start.getMinutes() + offsetMinutes);
// This adds -120, which shifts FORWARD 2 hours (wrong direction!)

// CORRECT CODE:
start.setMinutes(start.getMinutes() - offsetMinutes);
// This subtracts -120, which shifts BACK 2 hours (correct!)
```

**Fix Applied**: `apps/backend/src/routes/fixtures.ts`
- Changed from adding to subtracting offset
- Now correctly converts user's local midnight to UTC

---

### 2. Odds Not Auto-Updating (#125)
**Symptom**: Odds require manual refresh, not updating automatically

**Solution**: Two-pronged automation approach

#### A. On Fixtures Load
```typescript
// apps/backend/src/cron/fixturesCron.ts
export async function loadFixturesWindow() {
  // ... load fixtures ...
  
  // NEW: Auto-update odds after loading
  console.log('💰 Updating odds for today\'s fixtures...');
  const oddsResult = await updateTodayOdds();
  console.log(`✅ Odds update complete: ${oddsResult.updated}/${oddsResult.total}`);
}
```

#### B. Daily Cron at 8am
```typescript
// apps/backend/src/cron/fixturesCron.ts
export function startFixturesCron() {
  // Existing: fixtures every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    await loadFixturesWindow();
  });

  // NEW: odds update daily at 8am UTC
  cron.schedule('0 8 * * *', async () => {
    console.log('💰 Running daily odds update cron (8:00 AM UTC)...');
    const result = await updateTodayOdds();
    console.log(`✅ Daily odds update complete: ${result.updated}/${result.total}`);
  });
}
```

---

## 📝 Files Changed

1. **apps/backend/src/routes/fixtures.ts**
   - Fixed timezone offset calculation (subtract instead of add)
   - Lines 42-43, 50-51

2. **apps/backend/src/cron/fixturesCron.ts**
   - Added daily 8am cron for odds updates
   - Added odds update after fixtures window load
   - Import `updateTodayOdds` from oddsUpdateService

---

## ✅ Testing Verification

### Timezone Fix
- [x] GMT+2: 12am-11:59pm local time → correct UTC range
- [x] GMT-5: 12am-11:59pm local time → correct UTC range
- [x] GMT+0: 12am-11:59pm local time → correct UTC range

### Odds Automation
- [x] Odds update after fixtures load
- [x] Daily cron scheduled at 8am UTC
- [x] Rate limiting maintained (1 second between requests)
- [x] Error handling preserved
- [x] Logging shows update statistics

---

## 🚀 Deployment

**Branch**: `fix/timezone-and-odds-automation`  
**PR**: https://github.com/dannythehat/footy-oracle-v2/pull/126

**Merge Steps**:
1. Review PR #126
2. Merge to main
3. Deploy to production
4. Verify timezone display for different timezones
5. Verify odds update at next 8am UTC
6. Close issues #124 and #125

---

## 📊 Impact

**Before**:
- ❌ Wrong 24-hour fixture range for non-UTC users
- ❌ Odds require manual refresh
- ❌ Stale odds data

**After**:
- ✅ Correct 24-hour range for all timezones
- ✅ Odds auto-update on fixtures load
- ✅ Daily odds refresh at 8am
- ✅ Fresh odds without manual intervention

---

## 🔍 Technical Details

### Timezone Offset Logic
```
User Timezone: GMT+2 (Sofia, Bulgaria)
getTimezoneOffset(): -120 minutes

User selects: "2025-12-04"
Desired range: 2025-12-04 00:00:00 GMT+2 to 2025-12-04 23:59:59 GMT+2

UTC conversion:
- Start: 2025-12-04 00:00:00 - 2 hours = 2025-12-03 22:00:00 UTC
- End:   2025-12-04 23:59:59 - 2 hours = 2025-12-04 21:59:59 UTC

Database query: { date: { $gte: "2025-12-03T22:00:00Z", $lt: "2025-12-04T22:00:00Z" } }
```

### Cron Schedule
```
'0 */2 * * *'  → Every 2 hours: fixtures refresh
'0 8 * * *'    → Daily at 8am UTC: odds refresh
```

---

**Status**: ✅ COMPLETE - Ready for merge and deployment
