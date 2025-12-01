#!/bin/bash

# 🎯 Automated Fixtures Fix Script
# This script clears mock data and loads real fixtures from API-Football

set -e  # Exit on error

echo "🎯 Footy Oracle - Fixtures Fix Script"
echo "======================================"
echo ""

# Check if backend URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Backend URL required"
    echo ""
    echo "Usage: ./fix-fixtures.sh YOUR_BACKEND_URL"
    echo ""
    echo "Examples:"
    echo "  ./fix-fixtures.sh https://footy-oracle-backend.onrender.com"
    echo "  ./fix-fixtures.sh https://footy-oracle-backend.up.railway.app"
    echo ""
    echo "Find your backend URL in:"
    echo "  - Vercel dashboard (VITE_API_URL)"
    echo "  - Railway dashboard (Public URL)"
    echo "  - Render dashboard (Service URL)"
    exit 1
fi

BACKEND_URL="$1"

# Remove trailing slash if present
BACKEND_URL="${BACKEND_URL%/}"

echo "🔍 Backend URL: $BACKEND_URL"
echo ""

# Step 1: Health check
echo "📡 Step 1: Checking backend health..."
if curl -s -f "$BACKEND_URL/health" > /dev/null; then
    echo "✅ Backend is online"
else
    echo "❌ Backend health check failed"
    echo "   Make sure your backend is running and URL is correct"
    exit 1
fi
echo ""

# Step 2: Check current fixture count
echo "📊 Step 2: Checking current fixture count..."
CURRENT_COUNT=$(curl -s "$BACKEND_URL/api/admin/fixtures/count" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")
MOCK_COUNT=$(curl -s "$BACKEND_URL/api/admin/fixtures/count" | grep -o '"mockFixtures":[0-9]*' | grep -o '[0-9]*' || echo "0")
echo "   Total fixtures: $CURRENT_COUNT"
echo "   Mock fixtures: $MOCK_COUNT"
echo ""

# Step 3: Clear mock data and reload
echo "🗑️  Step 3: Clearing mock data and loading real fixtures..."
echo "   This will take 2-3 minutes..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/admin/fixtures/clear-mock")
echo "$RESPONSE" | grep -q '"ok":true' && echo "✅ Clear command sent successfully" || {
    echo "❌ Failed to clear mock data"
    echo "Response: $RESPONSE"
    exit 1
}
echo ""

# Step 4: Wait for fixtures to load
echo "⏳ Step 4: Waiting for fixtures to load (3 minutes)..."
for i in {1..36}; do
    echo -n "."
    sleep 5
done
echo ""
echo "✅ Wait complete"
echo ""

# Step 5: Verify fixtures loaded
echo "🔍 Step 5: Verifying fixtures loaded..."
NEW_COUNT=$(curl -s "$BACKEND_URL/api/admin/fixtures/count" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")
NEW_MOCK_COUNT=$(curl -s "$BACKEND_URL/api/admin/fixtures/count" | grep -o '"mockFixtures":[0-9]*' | grep -o '[0-9]*' || echo "0")
REAL_COUNT=$(curl -s "$BACKEND_URL/api/admin/fixtures/count" | grep -o '"realFixtures":[0-9]*' | grep -o '[0-9]*' || echo "0")

echo "   Total fixtures: $NEW_COUNT"
echo "   Mock fixtures: $NEW_MOCK_COUNT"
echo "   Real fixtures: $REAL_COUNT"
echo ""

# Step 6: Check if fix was successful
if [ "$NEW_MOCK_COUNT" -eq 0 ] && [ "$REAL_COUNT" -gt 100 ]; then
    echo "🎉 SUCCESS! Fixtures fixed!"
    echo ""
    echo "✅ Mock fixtures cleared: $NEW_MOCK_COUNT"
    echo "✅ Real fixtures loaded: $REAL_COUNT"
    echo ""
    echo "Next steps:"
    echo "  1. Refresh your frontend (Ctrl+Shift+R)"
    echo "  2. Navigate to fixtures page"
    echo "  3. You should see real team names now!"
    echo ""
    echo "Fixtures will auto-update every 2 hours via cron job."
else
    echo "⚠️  WARNING: Fix may not be complete"
    echo ""
    if [ "$NEW_MOCK_COUNT" -gt 0 ]; then
        echo "❌ Still have $NEW_MOCK_COUNT mock fixtures"
    fi
    if [ "$REAL_COUNT" -lt 100 ]; then
        echo "❌ Only $REAL_COUNT real fixtures loaded (expected 200+)"
    fi
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check backend logs for errors"
    echo "  2. Verify API_FOOTBALL_KEY is set"
    echo "  3. Verify MONGODB_URI is set"
    echo "  4. Try running again in 5 minutes"
    echo ""
    echo "For help, see: FIXTURES_FINAL_FIX.md"
fi

# Step 7: Show sample fixtures
echo ""
echo "📋 Sample fixtures:"
TODAY=$(date +%Y-%m-%d)
curl -s "$BACKEND_URL/api/fixtures?date=$TODAY" | head -n 20
echo ""

echo "======================================"
echo "Script complete!"
