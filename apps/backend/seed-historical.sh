#!/bin/bash

echo "🚀 Footy Oracle - Historical Predictions Seeding"
echo "================================================"
echo ""
echo "This will:"
echo "  ✅ Fetch actual fixtures from Nov 1-24, 2025"
echo "  ✅ Generate realistic predictions (70% accuracy)"
echo "  ✅ Ensure 2 days with all Golden Bets winning (ACCA)"
echo "  ✅ Calculate P&L and value bets"
echo "  ✅ Seed MongoDB with historical data"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install tsx --save-dev

echo ""
echo "🔧 Running seeding script..."
npx tsx src/scripts/seedHistoricalPredictions.ts

echo ""
echo "✅ Done!"
