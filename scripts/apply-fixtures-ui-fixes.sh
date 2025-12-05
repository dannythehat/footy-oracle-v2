#!/bin/bash

# Script to apply fixtures UI improvements
# Fixes issues #100, #101, #102, #103

echo "🔧 Applying Fixtures UI Improvements..."

FILE="apps/frontend/src/components/FixturesView.tsx"

# Backup original file
cp "$FILE" "$FILE.backup"

# Fix 1: Update formatTime to use user's locale (line ~258)
echo "📝 Fix 1: Updating formatTime function..."
sed -i "s/toLocaleTimeString('en-GB',/toLocaleTimeString(undefined,/" "$FILE"
sed -i "/minute: '2-digit'/a\      hour12: false // 24-hour format" "$FILE"

# Fix 2: Add timezone indicator to header (after line ~400)
echo "📝 Fix 2: Adding timezone indicator..."
sed -i 's/<h1 className="text-xl font-bold text-white">FIXTURES<\/h1>/<div>\n            <h1 className="text-xl font-bold text-white">FIXTURES<\/h1>\n            <p className="text-xs text-gray-600 mt-0.5">\n              Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(\/_\/g, " ")}\n            <\/p>\n          <\/div>/' "$FILE"

# Fix 3: Always show Live Now section (line ~520)
echo "📝 Fix 3: Updating Live Now section..."
sed -i 's/{!loading && !error && liveFixtures.length > 0 &&/{!loading \&\& !error \&\& fixtures.length > 0 \&\&/' "$FILE"

# Fix 4: Add conditional styling and placeholder
echo "📝 Fix 4: Adding conditional styling and placeholder..."
# This is complex, so we'll note it needs manual intervention

echo "✅ Basic fixes applied!"
echo "⚠️  Manual fix needed for Live Now section conditional rendering"
echo "📄 Backup saved to: $FILE.backup"
echo ""
echo "Please manually update the Live Now section (around line 520-540) to:"
echo "  - Add conditional className based on liveFixtures.length"
echo "  - Add placeholder div when liveFixtures.length === 0"
echo ""
echo "See patches/fixtures-ui-improvements.patch for full details"
