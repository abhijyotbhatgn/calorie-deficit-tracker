# 🚀 Complete Deployment Guide: Windows → GitHub → Mac → iPhone

## Phase 1: Windows - Get Code to GitHub

### Step 1: Install Git on Windows
1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Click through (defaults are fine)
4. **Restart PowerShell completely** (close and reopen)
5. Verify: Open PowerShell and run `git --version`

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `calorie-deficit-tracker`
   - **Description:** `Track daily calorie deficit with Apple Health integration`
   - **Public** (so it's easier to access)
   - Do NOT initialize with README (we have one)
3. Click **"Create repository"**
4. **Copy the HTTPS URL** (looks like `https://github.com/YOUR-USERNAME/calorie-deficit-tracker.git`)
   - Save it somewhere - you'll need it

### Step 3: Push Code to GitHub from Windows
Open PowerShell and run these commands:

```powershell
# Navigate to your project
cd "C:\Users\abhijyotbhat\OneDrive - Microsoft\Desktop\Prsnl\Calorie deficit"

# Configure Git (one-time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Calorie Deficit Tracker with PWA support"

# Add GitHub remote (REPLACE the URL with your repo URL from Step 2)
git remote add origin https://github.com/YOUR-USERNAME/calorie-deficit-tracker.git

# Set main branch and push
git branch -M main
git push -u origin main
```

**✅ Your code is now on GitHub!**

---

## Phase 2: Mac - Clone and Continue Development

### Step 1: Install Node.js on Mac (if not already installed)
```bash
# Check if Node is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use Homebrew:
brew install node
```

### Step 2: Clone Repository on Mac
```bash
# Navigate to where you want the project
cd ~/Documents

# Clone your repo (replace URL with your GitHub URL)
git clone https://github.com/YOUR-USERNAME/calorie-deficit-tracker.git

# Enter the project folder
cd calorie-deficit-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

**✅ Your app is now running on Mac at `http://localhost:3000`**

### Step 3: Continue Development on Mac
Make changes as usual:
```bash
# Check what changed
git status

# Add changes
git add .

# Commit
git commit -m "Your change description"

# Push to GitHub
git push origin main
```

**Railway will auto-redeploy after each push!**

---

## Phase 3: Deploy to Railway.app (Free Hosting)

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (click "Sign in with GitHub")
4. Authorize Railway to access your GitHub account

### Step 2: Create Railway Project
1. After signing in, click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `calorie-deficit-tracker` repository
4. Click "Deploy"
5. **Wait 2-3 minutes** for Railway to build and deploy

### Step 3: Get Your Live URL
1. Go to the Railway project dashboard
2. Click on your deployment
3. Copy the **URL** (looks like `https://calorie-deficit-tracker-production.up.railway.app`)
4. **Test it** - open URL in browser to make sure it works

**✅ Your app is now LIVE on the internet!**

---

## Phase 4: Add to iPhone Home Screen

### On Your iPhone:

1. **Open Safari**
2. **Paste the Railway URL** in the address bar
3. **Wait for it to load** (should show 🍎 icon and "Calorie Tracker" title)
4. **Tap the Share button** (bottom-center icon - looks like a box with arrow)
5. **Select "Add to Home Screen"**
6. **Confirm** the app name and icon
7. **Tap "Add"**

**✅ Done! The app is now on your iPhone home screen!**

---

## How It All Works Now

```
Your Mac
  ↓
  ├─ `npm run dev` (for local testing)
  └─ `git push origin main` (updates GitHub)
        ↓
      GitHub
        ↓
      Railway (auto-deploys)
        ↓
    Live URL
        ↓
    iPhone Home Screen Icon
```

### Every time you push to GitHub:
- Railway automatically rebuilds and deploys
- Your iPhone app updates automatically
- No manual deployment needed!

---

## Quick Reference Commands

### On Mac (Development):
```bash
# Start development
npm run dev

# Make changes, then push
git add .
git commit -m "Your message"
git push origin main
```

### Check Rails Deployment Status:
- Visit https://railway.app
- Click your project
- See deployment logs in real-time

### Get Your Live URL:
- Visit https://railway.app
- Click your project
- Copy URL from "Deployments" tab

---

## Troubleshooting

**"git not found" on Windows:**
- Restart PowerShell completely after Git installation

**"npm not found" on Mac:**
- Install Node.js from https://nodejs.org/

**iPhone app doesn't update:**
- Close the app completely
- Pull down on the home screen to refresh
- Re-add to home screen if needed

**Railway deployment failing:**
- Check logs in Railway dashboard
- Make sure `npm run build` works locally first
- Check that `npm start` command works

**Can't access app from iPhone:**
- Make sure you're on same WiFi as Mac for testing
- Or use the Railway URL (works anywhere with internet)

---

## Summary

Once you follow all steps, you'll have:

✅ Code stored on GitHub (backup + version control)
✅ App deployed on Railway (live on internet)
✅ App icon on iPhone home screen (like a native app)
✅ Easy Mac development (npm run dev)
✅ Automatic updates (git push → Railway redeploys)
✅ Free forever (Railway free tier)

**Total time: ~20 minutes**

Good luck! 🎉
