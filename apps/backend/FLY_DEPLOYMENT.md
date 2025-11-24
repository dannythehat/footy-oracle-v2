# 🚀 Fly.io Deployment Guide

## Prerequisites
- Fly.io account (sign up at https://fly.io)
- Fly CLI installed

## Install Fly CLI

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows (PowerShell)
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

## Deploy Backend to Fly.io

### 1. Login to Fly.io
```bash
fly auth login
```

### 2. Navigate to backend directory
```bash
cd apps/backend
```

### 3. Launch the app (first time only)
```bash
fly launch --no-deploy
```

When prompted:
- **App name**: `footy-oracle-backend` (or your preferred name)
- **Region**: Choose closest to you (e.g., `lhr` for London)
- **PostgreSQL**: No
- **Redis**: No

### 4. Set environment variables
```bash
# Required variables
fly secrets set API_FOOTBALL_KEY="your_api_football_key"
fly secrets set OPENAI_API_KEY="your_openai_key"
fly secrets set MONGODB_URI="your_mongodb_atlas_uri"

# Optional - CORS origin (update after frontend deployment)
fly secrets set CORS_ORIGIN="https://your-frontend.vercel.app"

# Cron schedule
fly secrets set PREDICTION_CRON_SCHEDULE="0 6 * * *"
```

### 5. Deploy
```bash
fly deploy
```

### 6. Get your backend URL
After deployment, your backend will be available at:
```
https://footy-oracle-backend.fly.dev
```

Check it's working:
```bash
curl https://footy-oracle-backend.fly.dev/health
```

### 7. View logs
```bash
fly logs
```

### 8. Scale (if needed)
```bash
# Check current scale
fly scale show

# Scale up if needed
fly scale vm shared-cpu-1x --memory 512
```

## Update Frontend

After backend is deployed, update the frontend environment variable:

1. Go to your Vercel project settings
2. Add environment variable:
   ```
   VITE_API_URL=https://footy-oracle-backend.fly.dev
   ```
3. Redeploy frontend

## Useful Commands

```bash
# Check app status
fly status

# Open app in browser
fly open

# SSH into the app
fly ssh console

# View metrics
fly dashboard

# Restart app
fly apps restart footy-oracle-backend
```

## Troubleshooting

### Build fails
- Check Dockerfile is correct
- Ensure all dependencies in package.json
- Check Node version compatibility

### App crashes
```bash
fly logs
```
Look for error messages

### Database connection issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Ensure database user has correct permissions

### CORS errors
- Update CORS_ORIGIN secret with your Vercel URL
- Redeploy: `fly deploy`

## Cost
Fly.io free tier includes:
- 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer
- Perfect for this project!

## Next Steps
1. Deploy backend to Fly.io
2. Get the backend URL (https://your-app.fly.dev)
3. Update frontend VITE_API_URL
4. Deploy frontend to Vercel
