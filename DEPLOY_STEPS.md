# Deploy in 5 Minutes (Vercel + Render)

## 1. Push Latest Code

```bash
git add .
git commit -m "Prepare deployment for Vercel and Render"
git push origin main
```

## 2. Deploy to Vercel (Primary)

1. Visit https://vercel.com/new.
2. Import your GitHub repository.
3. Confirm framework is Next.js.
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)
5. Click Deploy.
6. Copy the Vercel URL.

## 3. Deploy to Render (Backup)

1. Visit https://dashboard.render.com/new/blueprint.
2. Select the same GitHub repository.
3. Render detects `render.yaml` and creates the web service.
4. Add env vars (same as Vercel):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)
5. Deploy and copy the Render URL.

## 4. Add to iPhone Home Screen

1. Open Safari on iPhone.
2. Open your Vercel (or Render) URL.
3. Tap Share.
4. Tap Add to Home Screen.
5. Confirm and tap Add.

Done.

## Notes

- Vercel is the preferred primary platform for Next.js.
- Render is a good fallback.
- Current file-based data storage may reset on free cloud infrastructure; use hosted Postgres for persistent production data.
