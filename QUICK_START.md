# ⚡ Quick Start Checklist

## Windows (Right Now)
- [ ] Install Git: https://git-scm.com/download/win
- [ ] Restart PowerShell
- [ ] Create GitHub repo: https://github.com/new
- [ ] Copy GitHub URL
- [ ] Run these commands in PowerShell:
```powershell
cd "C:\Users\abhijyotbhat\OneDrive - Microsoft\Desktop\Prsnl\Calorie deficit"
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git init
git add .
git commit -m "Initial commit"
git remote add origin PASTE_YOUR_GITHUB_URL_HERE
git branch -M main
git push -u origin main
```
- [ ] Verify code is on GitHub

---

## Mac (Next)
- [ ] Download project from GitHub
```bash
git clone PASTE_YOUR_GITHUB_URL_HERE
cd calorie-deficit-tracker
npm install
npm run dev
```
- [ ] Test app at http://localhost:3000
- [ ] Make your changes
- [ ] Push changes:
```bash
git add .
git commit -m "Your change"
git push origin main
```

---

## Deploy to Railway (Hosting)
- [ ] Sign up: https://railway.app (use GitHub login)
- [ ] New Project → Deploy from GitHub
- [ ] Select your repo
- [ ] Wait for deployment (2-3 mins)
- [ ] Copy your live URL from Railway dashboard

---

## iPhone Home Screen
- [ ] Open Safari on iPhone
- [ ] Go to your Railway URL
- [ ] Share → Add to Home Screen
- [ ] Done! 🎉

---

## Files Created for Deployment
- ✅ `public/manifest.json` - PWA configuration
- ✅ `Procfile` - Railway configuration
- ✅ Updated `app/layout.tsx` - iPhone meta tags
- ✅ `COMPLETE_DEPLOYMENT_GUIDE.md` - Full details
- ✅ `DEPLOY_STEPS.md` - Deployment steps
- ✅ `DEPLOYMENT.md` - Hosting options

---

## Next Steps
1. Follow the checklist above
2. Reference `COMPLETE_DEPLOYMENT_GUIDE.md` for detailed explanations
3. You're done! App will be accessible from anywhere on any device
