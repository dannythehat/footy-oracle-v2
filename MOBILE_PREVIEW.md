# 📱 Quick Mobile Preview Guide

## Get Your Footy Oracle on Your Phone in 5 Minutes!

---

## Option 1: Vercel Deployment (Recommended - 5 min)

### Step 1: Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `dannythehat/footy-oracle-v2`

### Step 2: Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset:** Vite
- **Root Directory:** `apps/frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`

### Step 3: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Get your preview URL: `https://footy-oracle-v2.vercel.app`

### Step 4: Open on Phone
1. Open the URL on your phone
2. Add to home screen for app-like experience
3. Enjoy! 🎉

---

## Option 2: Local Development with Ngrok (10 min)

### Step 1: Clone and Install
```bash
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2/apps/frontend
npm install
```

### Step 2: Start Dev Server
```bash
npm run dev
```
Server runs on `http://localhost:5173`

### Step 3: Expose with Ngrok
```bash
# Install ngrok if you don't have it
npm install -g ngrok

# Expose local server
ngrok http 5173
```

### Step 4: Open on Phone
1. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Open on your phone
3. Test the app!

---

## Option 3: GitHub Pages (Static Only - 15 min)

### Step 1: Update vite.config.ts
```typescript
export default defineConfig({
  base: '/footy-oracle-v2/',
  // ... rest of config
})
```

### Step 2: Build and Deploy
```bash
cd apps/frontend
npm run build
npm run deploy # if you have gh-pages package
```

### Step 3: Enable GitHub Pages
1. Go to repo Settings → Pages
2. Source: `gh-pages` branch
3. Get URL: `https://dannythehat.github.io/footy-oracle-v2`

---

## 🎯 Recommended: Option 1 (Vercel)

**Why Vercel?**
- ✅ Fastest deployment (2-3 minutes)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Perfect for React/Vite
- ✅ Free tier is generous
- ✅ Auto-deploys on git push

---

## 📱 Mobile Testing Checklist

Once deployed, test these on your phone:

### Homepage
- [ ] Hero section displays correctly
- [ ] Feature cards are readable
- [ ] "Browse All Fixtures" button works
- [ ] Golden Bets cards display properly
- [ ] P&L stats are formatted correctly

### Fixtures Modal
- [ ] Modal opens smoothly
- [ ] Search bar works
- [ ] League filter works
- [ ] Fixture rows expand/collapse
- [ ] All markets display correctly
- [ ] Golden Bet highlighting visible
- [ ] Close button works

### Responsive Design
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] No horizontal scrolling
- [ ] Modal fits screen properly
- [ ] Smooth scrolling

---

## 🐛 Troubleshooting

### Build Fails on Vercel
**Issue:** Build command not found  
**Fix:** Ensure Root Directory is set to `apps/frontend`

### Blank Page After Deploy
**Issue:** Routing not configured  
**Fix:** Check `vercel.json` has rewrites for SPA

### API Calls Fail
**Issue:** CORS or missing backend  
**Fix:** Backend not deployed yet (expected with mock data)

### Modal Not Opening
**Issue:** JavaScript error  
**Fix:** Check browser console for errors

---

## 🎨 Customization Tips

### Change Theme Colors
Edit `apps/frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      purple: { /* your colors */ }
    }
  }
}
```

### Update Mock Data
Edit `apps/frontend/src/pages/HomePage.tsx` and `FixturesModal.tsx`:
- Change team names
- Update odds
- Modify AI explanations

### Add Your Logo
1. Add logo to `apps/frontend/public/`
2. Update `index.html` favicon
3. Add to hero section in HomePage

---

## 🚀 Next Steps After Preview

1. **Deploy Backend**
   - Set up Railway account
   - Deploy backend API
   - Connect to MongoDB

2. **Connect Real Data**
   - Get API-Football key
   - Get OpenAI API key
   - Update frontend to use real API

3. **Custom Domain**
   - Buy domain (e.g., footyoracle.com)
   - Add to Vercel project
   - Configure DNS

4. **Analytics**
   - Add Google Analytics
   - Track user behavior
   - Optimize based on data

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **GitHub Issues:** Create issue in repo
- **Email:** allandanny429@gmail.com

---

## 🎉 You're Almost There!

Your Footy Oracle is ready to preview. Just deploy to Vercel and open on your phone. The hard work is done - now enjoy seeing your creation come to life! 🚀

**Estimated Time:** 5 minutes  
**Difficulty:** Easy  
**Result:** Live app on your phone! 📱

---

**Built with ❤️ by Danny Allan**  
**Date:** November 24, 2025