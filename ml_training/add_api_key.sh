#!/bin/bash

# Quick script to add API_FOOTBALL_KEY to GitHub Secrets
# This uses GitHub CLI (gh) which must be installed and authenticated

echo "🔐 Adding API_FOOTBALL_KEY to GitHub Secrets..."
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install it:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "Then run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

# Prompt for API key
echo "Enter your API-Football key:"
read -s API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

# Add secret
echo ""
echo "Adding secret to repository..."
echo "$API_KEY" | gh secret set API_FOOTBALL_KEY --repo dannythehat/footy-oracle-v2

if [ $? -eq 0 ]; then
    echo "✅ API_FOOTBALL_KEY added successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://github.com/dannythehat/footy-oracle-v2/actions"
    echo "2. Click 'Historical Training Pipeline'"
    echo "3. Click 'Run workflow'"
    echo "4. Watch your LM babies train! 🚀"
else
    echo "❌ Failed to add secret"
    echo ""
    echo "Manual method:"
    echo "1. Go to: https://github.com/dannythehat/footy-oracle-v2/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Name: API_FOOTBALL_KEY"
    echo "4. Value: Your API key"
    echo "5. Click 'Add secret'"
fi
