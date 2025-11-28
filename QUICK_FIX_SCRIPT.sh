#!/bin/bash

# Quick Fix Script for FixturesModal API Integration
# Run this from the repository root

echo "🔧 Restoring FixturesModal.tsx from git history..."

# Restore the file from before deletion
git checkout 92a781804f8ca78e73be53e6fc8e82ccb1864834 -- apps/frontend/src/components/FixturesModal.tsx

echo "✅ File restored"

echo "📝 Now you need to manually apply these changes:"
echo ""
echo "1. Add to imports (line 2):"
echo "   import { fixturesApi } from '../services/api';"
echo "   import { AlertCircle } from 'lucide-react';"
echo ""
echo "2. Add error state (around line 79):"
echo "   const [error, setError] = useState<string | null>(null);"
echo ""
echo "3. Replace useEffect (lines 82-283) with:"
echo "   useEffect(() => {"
echo "     fetchFixtures();"
echo "   }, []);"
echo ""
echo "   const fetchFixtures = async () => {"
echo "     try {"
echo "       setLoading(true);"
echo "       setError(null);"
echo "       const today = new Date().toISOString().split('T')[0];"
echo "       const response = await fixturesApi.getByDate(today);"
echo "       if (response && response.data) {"
echo "         setFixtures(response.data);"
echo "       } else {"
echo "         setFixtures([]);"
echo "       }"
echo "     } catch (err: any) {"
echo "       console.error('Error fetching fixtures:', err);"
echo "       setError(err.message || 'Failed to load fixtures');"
echo "       setFixtures([]);"
echo "     } finally {"
echo "       setLoading(false);"
echo "     }"
echo "   };"
echo ""
echo "4. Update loading UI (around line 520) to add error handling"
echo ""
echo "📖 See FIXTURES_MODAL_FIX.md for complete details"
echo ""
echo "After making changes:"
echo "  git add apps/frontend/src/components/FixturesModal.tsx"
echo "  git commit -m 'Integrate FixturesModal with backend API'"
echo "  git push origin main"
