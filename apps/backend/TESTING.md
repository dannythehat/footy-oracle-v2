# 🧪 Testing Guide - Fixtures API Endpoints

This guide explains how to test all the fixtures API endpoints to ensure they're working correctly.

## Prerequisites

1. **Server Running**: Make sure the backend server is running
   ```bash
   cd apps/backend
   npm run dev
   ```

2. **Database**: MongoDB should be running with fixture data
   ```bash
   # Check if MongoDB is running
   mongosh
   ```

3. **Environment Variables**: Ensure `.env` file is configured
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Running the Tests

### Run All Endpoint Tests

```bash
cd apps/backend
npx tsx test-fixtures-endpoints.ts
```

### What Gets Tested

The test suite validates **16 different endpoints**:

#### GET Endpoints (9)
1. ✅ `GET /fixtures` - List all fixtures
2. ✅ `GET /fixtures?date=YYYY-MM-DD` - Filter by date
3. ✅ `GET /fixtures/meta/leagues` - Get distinct leagues
4. ✅ `GET /fixtures/:id` - Get fixture by ID
5. ✅ `GET /fixtures/:id/odds` - **NEW** Get fixture odds
6. ✅ `GET /fixtures/:id/h2h` - Head to head data
7. ✅ `GET /fixtures/:id/stats` - Fixture statistics
8. ✅ `GET /fixtures/team/:teamId/stats` - Team statistics
9. ✅ `GET /fixtures/team/:teamId/last` - Team last fixtures

#### POST Endpoints (5)
10. ✅ `POST /fixtures/refresh-scores` - Refresh live scores
11. ✅ `POST /fixtures/analyze` - Analyze single fixture (AI)
12. ✅ `POST /fixtures/analyze-bulk` - Analyze multiple fixtures (AI)
13. ✅ `POST /fixtures/golden-bets` - Find golden bets
14. ✅ `POST /fixtures/value-bets` - Find value bets

#### Error Handling (2)
15. ✅ Invalid fixture ID (404)
16. ✅ Missing parameters (400)

## Expected Output

```
============================================================
📌 FIXTURES API ENDPOINT TESTS
============================================================

🔗 Testing API at: http://localhost:3001/api
📅 Test Date: 2025-12-02T06:30:00.000Z

✅ Server is running

============================================================
📌 GET ENDPOINTS
============================================================
✅ GET /fixtures (245ms)
ℹ️  Found 150 fixtures
✅ GET /fixtures?date=YYYY-MM-DD (189ms)
ℹ️  Found 12 fixtures for 2025-12-02
✅ GET /fixtures/meta/leagues (156ms)
ℹ️  Found 8 leagues
✅ GET /fixtures/:id (178ms)
ℹ️  Fixture: Manchester City vs Arsenal
✅ GET /fixtures/:id/odds (NEW) (145ms)
ℹ️  Odds available for fixture 1234567
...

============================================================
📌 TEST SUMMARY
============================================================

📊 Results: 16/16 tests passed (100.0%)

============================================================
✅ ALL TESTS PASSED! 🎉
```

## Test Details

### 1. GET /fixtures
Tests the main fixtures list endpoint with pagination and filtering.

**Validates:**
- Response status 200
- Success flag is true
- Data is an array
- Count field exists

### 2. GET /fixtures/:id/odds (NEW ENDPOINT)
Tests the newly added odds endpoint that was missing.

**Validates:**
- Response status 200
- Success flag is true
- Returns fixtureId
- Returns odds object (or null if no odds)

**This endpoint fixes the frontend error:**
```
useFixtureOdds hook was calling /fixtures/:id/odds
but the endpoint didn't exist (404 error)
```

### 3. POST /fixtures/analyze
Tests AI-powered fixture analysis using OpenAI.

**Requires:**
- Valid OPENAI_API_KEY in .env
- Fixture data with homeTeam, awayTeam, league, date

**Note:** This test may take longer (5-10 seconds) due to AI processing.

## Troubleshooting

### Server Not Running
```
❌ Server is not running! Please start the server first.
```
**Solution:** Start the backend server
```bash
cd apps/backend
npm run dev
```

### No Fixtures Available
```
❌ No fixtures available to test
```
**Solution:** Seed the database with fixtures
```bash
cd apps/backend
npm run seed
```

### OpenAI API Tests Failing
```
❌ POST /fixtures/analyze - OpenAI API error
```
**Solution:** Check your OPENAI_API_KEY in .env
```bash
# .env
OPENAI_API_KEY=sk-...your-key-here
```

### API-Football Tests Failing
```
❌ GET /fixtures/:id/h2h - API-Football error
```
**Solution:** Check your API_FOOTBALL_KEY in .env
```bash
# .env
API_FOOTBALL_KEY=your-key-here
```

### Database Connection Error
```
❌ MongoServerError: connect ECONNREFUSED
```
**Solution:** Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

## Manual Testing with cURL

You can also test endpoints manually:

### Test GET /fixtures
```bash
curl http://localhost:3001/api/fixtures
```

### Test GET /fixtures/:id/odds (NEW)
```bash
curl http://localhost:3001/api/fixtures/1234567/odds
```

### Test POST /fixtures/refresh-scores
```bash
curl -X POST http://localhost:3001/api/fixtures/refresh-scores \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-12-02"}'
```

### Test POST /fixtures/analyze
```bash
curl -X POST http://localhost:3001/api/fixtures/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "homeTeam": "Manchester City",
    "awayTeam": "Arsenal",
    "league": "Premier League",
    "date": "2025-12-02T15:00:00Z"
  }'
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run API Tests
  run: |
    cd apps/backend
    npm install
    npm run dev &
    sleep 5
    npx tsx test-fixtures-endpoints.ts
```

## Performance Benchmarks

Expected response times:
- Simple GET requests: < 200ms
- Database queries: < 500ms
- AI analysis: 5-10 seconds
- Bulk operations: 10-30 seconds

## Next Steps

After all tests pass:
1. ✅ Deploy to production
2. ✅ Update frontend to use new `/fixtures/:id/odds` endpoint
3. ✅ Monitor API performance
4. ✅ Set up automated testing in CI/CD

## Support

If tests continue to fail:
1. Check server logs: `npm run dev`
2. Check database: `mongosh footy-oracle`
3. Verify environment variables: `cat .env`
4. Review API documentation: `API_REFERENCE.md`
