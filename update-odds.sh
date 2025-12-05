#!/bin/bash

# Odds Update Script
# Run this to manually update odds for today's fixtures

echo "🎯 Footy Oracle - Odds Update Script"
echo "===================================="
echo ""

# Check if API is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Error: API server is not running on port 5000"
    echo "Please start the backend server first:"
    echo "  cd apps/backend && npm run dev"
    exit 1
fi

echo "✅ API server is running"
echo ""

# Update odds for today's fixtures
echo "💰 Updating odds for today's fixtures..."
response=$(curl -s -X POST http://localhost:5000/api/fixtures/update-odds)

# Parse response
updated=$(echo $response | grep -o '"updated":[0-9]*' | grep -o '[0-9]*')
total=$(echo $response | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
errors=$(echo $response | grep -o '"errors":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "📊 Results:"
echo "  ✅ Updated: $updated fixtures"
echo "  📋 Total: $total fixtures"
echo "  ❌ Errors: $errors"
echo ""

if [ "$errors" -gt 0 ]; then
    echo "⚠️  Some fixtures failed to update. Check logs for details."
else
    echo "🎉 All fixtures updated successfully!"
fi

echo ""
echo "Done! Odds are now available in the UI."
