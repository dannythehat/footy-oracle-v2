# 🔍 Fixtures Page Issues - Analysis & Solutions

**Date:** December 13, 2025  
**Analyzed by:** AI Assistant  
**Status:** Issues Identified, Solutions Proposed

---

## 🎯 Issues Identified

### 1. ⏰ **TBD Times on Fixtures**

**Problem:**
- Fixtures showing "TBD" instead of actual kickoff times
- Affects user experience - users can't see when matches start

**Root Cause:**
- The `date` field in MongoDB is storing dates without proper time information
- Backend correctly formats time using `formatTime(new Date(f.date))` in `apps/backend/src/routes/fixtures.ts` (line 79)
- Frontend correctly displays time using `formatTime(fixture)` in `apps/frontend/src/components/FixturesView.tsx` (line 318)
- The issue is in the **data seeding/fetching** - times aren't being stored in the database

**Location:**
- Backend: `apps/backend/src/routes/fixtures.ts` (lines 79-80)
- Frontend: `apps/frontend/src/components/FixturesView.tsx` (lines 318-343)
- Model: `apps/backend/src/models/Fixture.ts` (line 7 - date field)

**Code Flow:**
```typescript
// Backend formats time from date field
time: formatTime(new Date(f.date))  // Line 79

// Frontend displays time
const formatTime = (fixture: Fixture): string => {
  const timeStr = fixture.time || fixture.kickoff;
  if (!timeStr) return 'TBD';  // Returns TBD when no time data
  // ... formatting logic
}
```

**Solution Required:**
1. Check the data seeding scripts to ensure times are included when fetching from API-Football
2. Verify the API-Football response includes time data
3. Update the seeding logic to properly parse and store datetime with timezone
4. Consider storing both date and time separately for better querying

---

### 2. 📊 **Only 2 Odds Showing Instead of 4**

**Problem:**
- MatchOdds component should show 4 markets: BTTS, Over 2.5 Goals, Over 3.5 Cards, Over 9.5 Corners
- Only 2 odds are displaying

**Root Cause:**
- The `getBookmakerOdds` function in MatchOdds.tsx is trying to match odds from the API response
- The odds data structure from API-Football might not match the expected format
- The matching logic (lines 93-117) searches for odds by name/label but may not find all markets

**Location:**
- Component: `apps/frontend/src/components/fixtures/tabs/MatchOdds.tsx`
- Function: `getBookmakerOdds` (lines 93-117)
- Markets defined: Lines 28-60

**Code Analysis:**
```typescript
const markets: Market[] = [
  { id: 'btts', label: 'Both Teams to Score', oddsKey: 'btts', aiKey: 'bts' },
  { id: 'over25', label: 'Over 2.5 Goals', oddsKey: 'over25', aiKey: 'over25' },
  { id: 'over35cards', label: 'Over 3.5 Cards', oddsKey: 'over35cards', aiKey: 'over35cards' },
  { id: 'over95corners', label: 'Over 9.5 Corners', oddsKey: 'over95corners', aiKey: 'over95corners' }
];

// Matching logic tries to find odds by name
const getBookmakerOdds = (market: Market) => {
  // Searches through bookmaker.bets array
  // Matches by name/label/oddsKey
  // May not find all markets if API structure differs
}
```

**Possible Issues:**
1. API-Football odds structure doesn't include all 4 markets
2. The matching logic doesn't correctly identify the markets
3. The odds data isn't being fetched/stored properly
4. The `oddsKey` values don't match the API response structure

**Solution Required:**
1. Log the actual odds data structure from API-Football
2. Update the matching logic to handle different API response formats
3. Add fallback logic for missing markets
4. Consider storing odds in a normalized format in the database

---

### 3. ⚪ **White Background Issue**

**Status:** ✅ **ALREADY FIXED**

**Previous Problem:**
- White background was showing on odds page, hurting eyes in dark mode

**Fix Applied:**
- Commit: `34b6fd3b080459c8534e45bcfbe66ba16b6f5299`
- Date: December 13, 2025, 01:58:14
- Changes:
  - `bg-white` → `bg-[#0f0f0f]` (dark cards)
  - `bg-gray-50` → `bg-gray-900/50` (dark backgrounds)
  - `text-gray-900` → `text-white` (readable text)
  - All borders and gradients adjusted for dark theme

**Current State:**
- MatchOdds component has `bg-black` wrapper (line 189)
- MatchDetailDrawer has `bg-black` (line 54)
- All cards use dark theme colors
- Consistent with rest of app design

---

## 🛠️ Recommended Actions

### Priority 1: Fix TBD Times
1. **Investigate data seeding:**
   - Check `apps/backend/scripts/` for seeding scripts
   - Verify API-Football response includes time data
   - Ensure timezone handling is correct

2. **Update Fixture model if needed:**
   - Consider adding separate `time` field
   - Add `timezone` field for proper conversion
   - Update indexes for efficient querying

3. **Test with sample data:**
   - Manually insert a fixture with proper datetime
   - Verify it displays correctly in frontend
   - Confirm timezone conversion works

### Priority 2: Fix Odds Display
1. **Debug odds data structure:**
   - Add console.log in `getBookmakerOdds` function
   - Log the actual `oddsData` structure
   - Identify which markets are missing

2. **Update matching logic:**
   - Make the matching more flexible
   - Add support for different API response formats
   - Add fallback for missing markets

3. **Improve error handling:**
   - Show which markets are unavailable
   - Display partial odds if some markets are missing
   - Add better user feedback

### Priority 3: Monitoring
1. **Add logging:**
   - Log when odds are fetched
   - Log when times are missing
   - Track data quality metrics

2. **Add admin tools:**
   - Create endpoint to check data quality
   - Add dashboard for monitoring fixtures
   - Alert when data is incomplete

---

## 📁 Files to Review

### Backend
- `apps/backend/src/models/Fixture.ts` - Fixture schema
- `apps/backend/src/routes/fixtures.ts` - Fixtures API endpoints
- `apps/backend/src/routes/fixtureDetails.ts` - Complete fixture data
- `apps/backend/scripts/` - Data seeding scripts

### Frontend
- `apps/frontend/src/components/FixturesView.tsx` - Main fixtures display
- `apps/frontend/src/components/fixtures/tabs/MatchOdds.tsx` - Odds display
- `apps/frontend/src/components/fixtures/MatchDetailDrawer.tsx` - Match details modal
- `apps/frontend/src/services/api.ts` - API service layer

---

## 🔗 Related Issues

- Issue #157: Fixtures data loading (FIXED)
- Issue #109: Odds fetching and display (PARTIALLY FIXED)
- Issue #136: League borders in LIVE section (FIXED)

---

## 📝 Notes

- The codebase is well-structured with clear separation of concerns
- Recent fixes show good progress on UI/UX improvements
- Data quality issues are the main remaining challenge
- Consider adding data validation at the API layer
- May need to review API-Football integration for completeness

---

**Next Steps:**
1. Review data seeding scripts
2. Test with live API-Football data
3. Add comprehensive logging
4. Create data quality monitoring dashboard
