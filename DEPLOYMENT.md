# Deployment Guide: Calorie Deficit Tracker

This project is now configured for:
- Vercel (primary)
- Render (secondary/fallback)

## Important Data Note

The app currently stores data in `data/calorie_tracker.json`.

On free cloud hosting, local file writes are usually not durable across restarts/redeploys.
If you need persistent production data, migrate to a managed database (recommended: Supabase Postgres).

## Option 1: Vercel (Recommended)

1. Push latest code to GitHub.
2. Go to https://vercel.com/new.
3. Import this repository.
4. Framework preset should auto-detect as Next.js.
5. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional, if AI food search is enabled)
6. Click Deploy.
7. After deployment, open the generated Vercel URL.

## Option 2: Render (Backup)

This repo includes `render.yaml`, so Render can auto-configure service settings.

1. Push latest code to GitHub.
2. Go to https://dashboard.render.com/new/blueprint.
3. Connect repository and create the Blueprint.
4. Confirm env vars:
   - `NODE_VERSION=20`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional, if AI search is used)
5. Deploy and wait for build to finish.

## iPhone Home Screen Setup (PWA)

1. Open Safari on iPhone and visit your deployed URL.
2. Tap Share.
3. Tap Add to Home Screen.
4. Confirm app name and tap Add.

The app opens in standalone mode using the existing manifest and iOS web app metadata.

## Troubleshooting

If deployment fails:
- Run `npm run build` locally and fix any TypeScript or ESLint errors.
- Confirm Node.js version is 18+ (20 recommended).

If app data resets:
- Expected with file-based storage on ephemeral environments.
- Migrate from JSON file storage to hosted Postgres.

If icon/install option is missing on iPhone:
- Use Safari (not Chrome).
- Verify `/manifest.json` loads.
- Re-open page and retry Add to Home Screen.
