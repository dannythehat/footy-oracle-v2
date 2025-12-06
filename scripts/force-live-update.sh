#!/bin/bash

# Emergency script to force live score updates
# Use this when games are stuck in 'live' status

echo "🚨 EMERGENCY: Forcing live score update..."
echo ""

# Replace with your actual backend URL
BACKEND_URL="https://footy-oracle-backend.up.railway.app"

# Try common Railway URLs if the above doesn't work
POSSIBLE_URLS=(
  "https://footy-oracle-backend.up.railway.app"
  "https://footy-oracle-v2-production.up.railway.app"
  "https://footy-oracle-backend-production.up.railway.app"
)

echo "Attempting to trigger live score update..."
echo ""

for URL in "${POSSIBLE_URLS[@]}"; do
  echo "Trying: $URL/api/admin/update-live-scores"
  
  RESPONSE=$(curl -s -X POST "$URL/api/admin/update-live-scores" -w "\nHTTP_CODE:%{http_code}")
  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS!"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "Live scores have been updated!"
    exit 0
  else
    echo "❌ Failed (HTTP $HTTP_CODE)"
    echo ""
  fi
done

echo "⚠️  Could not connect to backend."
echo "Please check your backend URL and try manually:"
echo ""
echo "curl -X POST https://YOUR-BACKEND-URL/api/admin/update-live-scores"
echo ""
