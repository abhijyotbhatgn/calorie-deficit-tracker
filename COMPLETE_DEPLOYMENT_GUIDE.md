# Complete Deployment Guide: GitHub -> Vercel + Render -> iPhone

## Goal

Deploy this Next.js app to:
- Vercel as primary production
- Render as backup

Then install it on iPhone home screen as a PWA.

## Phase 1: Prepare and Push

Run locally:

```bash
npm install
npm run build
```

If successful, push:

```bash
git add .
git commit -m "Prepare deployment for Vercel and Render"
git push origin main
```

## Phase 2: Deploy to Vercel (Primary)

1. Open https://vercel.com/new.
2. Import this GitHub repository.
3. Confirm settings:
  - Framework: Next.js
  - Build Command: `npm run build`
  - Output: Next.js default
4. Add environment variables as needed:
  - `OPENAI_API_KEY`
5. Deploy.
6. Save the production URL.

## Phase 3: Deploy to Render (Backup)

This repository includes `render.yaml` for Render Blueprint deploy.

1. Open https://dashboard.render.com/new/blueprint.
2. Select this repository.
3. Create services from blueprint.
4. Confirm environment variable values.
5. Deploy and save URL.

## Phase 4: Add to iPhone Home Screen

1. Open Safari on iPhone.
2. Go to your Vercel URL.
3. Tap Share.
4. Tap Add to Home Screen.
5. Confirm app name and add.

## Data Persistence Warning

Current storage uses `data/calorie_tracker.json`.

On free cloud platforms, local file writes may be ephemeral.
For persistent production data, migrate to managed Postgres (recommended: Supabase).

## Update Workflow

For each new release:

```bash
git add .
git commit -m "Your update"
git push origin main
```

Vercel and Render will auto-deploy from GitHub.

## Troubleshooting

Build errors:
- Run `npm run build` locally first.
- Fix TypeScript and ESLint issues before pushing.

iPhone install issues:
- Use Safari.
- Check `/manifest.json` is reachable.
- Retry Add to Home Screen.
