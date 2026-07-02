# 🚀 Deploy to Railway in 5 Minutes

## Step-by-Step Instructions

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment to Railway"
git push origin main
```

### 2. Go to Railway.app
- Visit https://railway.app
- Click "Start a New Project"
- Select "Deploy from GitHub repo"

### 3. Connect GitHub
- Click "Authorize Railway"
- Select your repository "Calorie deficit"
- Click "Deploy Now"

### 4. Wait for Deployment
- Railway will automatically:
  - Build your Next.js app
  - Start the server
  - Give you a live URL
  - Create persistent storage for your database

### 5. Get Your Live URL
- Once deployed, Railway shows your URL (looks like: `https://yourapp-production.up.railway.app`)
- Copy this URL

### 6. Add to iPhone Home Screen
1. Open Safari on iPhone
2. Paste your Railway URL in address bar
3. Tap Share (bottom center icon)
4. Select "Add to Home Screen"
5. Name it "Calorie Tracker"
6. Tap "Add"

Done! 🎉

---

## What Just Happened?

✅ Your app is now live on the internet
✅ Accessible from any device with the URL
✅ iPhone home screen icon with 🍎 emoji
✅ Data persists in Railway's storage
✅ Free tier (up to 5GB/month)

---

## Access Anytime

- **iPhone:** Open Calorie Tracker app icon
- **Computer:** Visit the Railway URL
- **Anywhere:** Just open the URL in any browser

---

## Still in Development?

If you want to keep making changes:
```bash
npm run dev  # Local development continues
git push    # Push changes to GitHub
# Railway auto-redeploys on each push!
```

---

## Questions?

Check Railway's docs: https://docs.railway.app/
Or see DEPLOYMENT.md for more details
