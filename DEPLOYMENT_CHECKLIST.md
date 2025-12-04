# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables documented
- [ ] Database migrations are run
- [ ] Google OAuth is configured
- [ ] Google Sheets is set up and shared

## Frontend (Vercel)

- [ ] Vercel account created (GitHub login)
- [ ] Repository imported to Vercel
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable: `VITE_API_URL` (will update after backend deploy)
- [ ] Environment variable: `VITE_GOOGLE_CLIENT_ID`
- [ ] First deployment successful
- [ ] Frontend URL noted: `https://________.vercel.app`

## Backend (Render or Railway)

- [ ] Render/Railway account created
- [ ] Web service created
- [ ] Repository connected
- [ ] Root directory: `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (or auto-assigned)
  - [ ] `FRONTEND_URL` (from Vercel)
  - [ ] `JWT_SECRET`
  - [ ] `DATABASE_URL` (Supabase pooler)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REDIRECT_URI` (backend URL)
  - [ ] `GOOGLE_SHEETS_ID`
- [ ] First deployment successful
- [ ] Backend URL noted: `https://________.onrender.com`

## Google OAuth Configuration

- [ ] Google Cloud Console opened
- [ ] OAuth credentials found
- [ ] Authorized redirect URI added:
  - [ ] `https://your-backend.onrender.com/api/auth/callback`
- [ ] Redirect URI saved
- [ ] Calendar API enabled
- [ ] Sheets API enabled

## Post-Deployment Updates

- [ ] Backend `GOOGLE_REDIRECT_URI` updated to production URL
- [ ] Frontend `VITE_API_URL` updated to backend URL
- [ ] Both services redeployed after env var updates

## Testing

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check works: `/health`
- [ ] OAuth login works
- [ ] Can create prospects
- [ ] Can schedule pre-talks
- [ ] Google Sheets sync works
- [ ] Dashboard displays data

## Final Verification

- [ ] All features working in production
- [ ] No console errors
- [ ] No backend errors in logs
- [ ] Database connections stable
- [ ] Google integrations working

---

## Quick Reference URLs

**Frontend:** https://________.vercel.app
**Backend:** https://________.onrender.com
**Health Check:** https://________.onrender.com/health

**Google Cloud Console:** https://console.cloud.google.com
**Supabase Dashboard:** https://supabase.com/dashboard
**Vercel Dashboard:** https://vercel.com/dashboard
**Render Dashboard:** https://dashboard.render.com

---

**Once all items are checked, your app is fully deployed!** 🎉

