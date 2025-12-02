# 🚀 Deployment Checklist

## Quick Start

### 1. Test Database Connection
```bash
cd apps/backend
npm run test:db
```

### 2. Seed Database
```bash
npm run seed:fixtures
```

### 3. Test API
```bash
curl https://your-backend-url.com/api/fixtures?date=2025-12-02
```

### 4. Verify Frontend
- Visit your Vercel URL
- Check fixtures load
- Check browser console for errors

## Common Issues

### No Fixtures
- Run `npm run seed:fixtures`
- Check MONGODB_URI is correct

### CORS Errors
- Update backend CORS origins
- Add your Vercel URL

### Scores Not Showing
- Check fixture has score data
- Verify homeScore/awayScore fields exist

## Environment Variables

**Backend:**
- MONGODB_URI
- API_FOOTBALL_KEY
- PORT

**Frontend:**
- VITE_API_URL
