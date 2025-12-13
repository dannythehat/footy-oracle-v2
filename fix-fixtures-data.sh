#!/bin/bash
# Fix FixturesView.tsx data loading issue

FILE="apps/frontend/src/components/FixturesView.tsx"

# Replace "response.data" with "response" in the fetchFixtures function
sed -i 's/if (response && response\.data)/if (response \&\& Array.isArray(response))/g' "$FILE"
sed -i 's/setFixtures(response\.data)/setFixtures(response)/g' "$FILE"
sed -i 's/response\.data$/response/g' "$FILE"

echo "✅ Fixed fixtures data loading in $FILE"
