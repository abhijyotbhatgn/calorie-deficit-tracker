# Deployment Guide: Calorie Deficit Tracker

## Option 1: Deploy to Railway.app (Recommended for Free Tier)

Railway.app is the best free option for this app since it supports persistent storage for SQLite databases.

### Quick Start:

1. **Sign up at Railway.app**
   - Go to https://railway.app
   - Sign up with GitHub (recommended)

2. **Connect Your Repository**
   - Click "Create a New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account and select this repository
   - Railway will auto-detect it's a Next.js app

3. **Configure Environment**
   - Go to Project Settings
   - Add variables if needed (leave defaults for now)
   - Railway automatically sets `DATABASE_URL` for databases

4. **Deploy**
   - Railway will automatically build and deploy your app
   - Your app will be live at a Railway-generated URL

5. **Access on iPhone**
   - Open the deployed URL on your iPhone
   - Tap Share → Add to Home Screen
   - The app will install with the app icon (🍎)
   - Full screen, no browser UI!

### Database Persistence:
- SQLite database file is stored in Railway's persistent storage
- Data will be retained between deployments

---

## Option 2: Deploy to Vercel (If You Migrate to PostgreSQL)

If you want to use Vercel instead, you'll need to:
1. Create a PostgreSQL database (Neon, Supabase, or Railway's PostgreSQL)
2. Update the database connection in `lib/db.ts`
3. Deploy to Vercel

This is more complex, so Railway is recommended for simplicity.

---

## iPhone Web App Setup

Once deployed, on your iPhone:

1. **Add to Home Screen:**
   - Open Safari → navigate to your app URL
   - Tap Share button (bottom right)
   - Select "Add to Home Screen"
   - Name it and tap "Add"

2. **Access Like a Native App:**
   - Opens in full-screen mode
   - No browser address bar
   - Appears in your app library

3. **PWA Features:**
   - The app now has a custom icon (🍎)
   - Splash screen with your branding
   - Can be used offline (with service worker enhancement)

---

## Troubleshooting

**If database resets on deploy:**
- Ensure persistent volume is mounted in Railway
- Check railway.toml or Railway dashboard settings

**If app won't start:**
- Check Railway logs for errors
- Ensure build script runs: `npm run build`
- Verify start script is: `npm start`

**If icons don't appear on iPhone:**
- Clear iPhone Safari cache
- Re-add to home screen
- Check manifest.json is accessible at `/manifest.json`

---

## Files Added for Deployment:

- `public/manifest.json` - PWA manifest for iPhone home screen
- `Procfile` - Process configuration for Railway
- Updated `app/layout.tsx` - Added PWA meta tags

All existing functionality remains unchanged!
