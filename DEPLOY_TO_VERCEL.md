# 🚀 Deploy ProspectPulse to Vercel (Frontend) + Render/Railway (Backend)

## Overview

- **Frontend:** Deploy to Vercel (free, easy, automatic)
- **Backend:** Deploy to Render or Railway (free tier available)
- **Database:** Already on Supabase (no change needed)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Push Code to GitHub (If Not Done)

Make sure your code is pushed to GitHub:
```bash
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. **Click:** "Add New..." → "Project"
4. **Import** your `ProspectPulse` repository
5. **Select** the repository

### Step 3: Configure Vercel Project

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend` (IMPORTANT!)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Environment Variables:**
Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Important:** Replace `your-backend-url.onrender.com` with your actual backend URL (you'll get this after deploying backend).

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Your frontend is live!

**You'll get a URL like:** `https://prospectpulse.vercel.app`

---

## Part 2: Deploy Backend to Render

### Step 1: Create Render Account

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Verify** your email

### Step 2: Create Web Service

1. **Click:** "New +" → "Web Service"
2. **Connect** your GitHub repository
3. **Select** `ProspectPulse` repository

### Step 3: Configure Backend Service

**Basic Settings:**
- **Name:** `prospectpulse-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Environment Variables:**
Click "Environment" and add ALL these:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-supabase-connection-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback
GOOGLE_SHEETS_ID=your-google-sheets-id
```

**Important:** 
- Replace `your-frontend.vercel.app` with your actual Vercel URL
- Replace `your-backend.onrender.com` with the Render URL you'll get
- Use your production Supabase connection string

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. ✅ Your backend is live!

**You'll get a URL like:** `https://prospectpulse-backend.onrender.com`

---

## Part 3: Update OAuth Redirect URI

### Step 1: Update Google Cloud Console

1. **Go to:** https://console.cloud.google.com
2. **Select** your project
3. **APIs & Services** → **Credentials**
4. **Click** your OAuth 2.0 Client ID
5. **Add** to "Authorized redirect URIs":
   - `https://your-backend.onrender.com/api/auth/callback`
6. **Click "Save"**

### Step 2: Update Backend Environment Variable

1. **Go to Render dashboard**
2. **Your service** → **Environment**
3. **Update** `GOOGLE_REDIRECT_URI` to:
   ```
   https://your-backend.onrender.com/api/auth/callback
   ```
4. **Save** (this will trigger a redeploy)

### Step 3: Update Frontend Environment Variable

1. **Go to Vercel dashboard**
2. **Your project** → **Settings** → **Environment Variables**
3. **Update** `VITE_API_URL` to:
   ```
   https://your-backend.onrender.com/api
   ```
4. **Redeploy** (Settings → Deployments → Redeploy)

---

## Part 4: Test Your Deployment

### Step 1: Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Should see the login page ✅

### Step 2: Test Backend
1. Visit: `https://your-backend.onrender.com/health`
2. Should see: `{"status":"ok",...}` ✅

### Step 3: Test Login
1. Click "Sign in with Google"
2. Complete OAuth flow
3. Should redirect back and log you in ✅

---

## Part 5: Alternative - Deploy Backend to Railway

If you prefer Railway over Render:

### Step 1: Create Railway Account
1. **Go to:** https://railway.app
2. **Sign up** with GitHub

### Step 2: Create New Project
1. **Click:** "New Project"
2. **Select:** "Deploy from GitHub repo"
3. **Choose:** `ProspectPulse` repository

### Step 3: Add Service
1. **Click:** "+ New" → "GitHub Repo"
2. **Select:** `ProspectPulse`
3. **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### Step 4: Add Environment Variables
Click "Variables" and add all the same variables as Render (see Part 2, Step 3)

### Step 5: Deploy
Railway will auto-deploy. You'll get a URL like: `https://your-app.up.railway.app`

---

## Quick Checklist

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory set to `frontend`
- [ ] Environment variables added (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`)
- [ ] Deployed successfully

### Backend (Render/Railway)
- [ ] Service created
- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] `GOOGLE_REDIRECT_URI` updated to production URL
- [ ] Deployed successfully

### Google OAuth
- [ ] Redirect URI added in Google Cloud Console
- [ ] Matches backend URL exactly

### Testing
- [ ] Frontend loads
- [ ] Backend health check works
- [ ] OAuth login works
- [ ] Can create prospects
- [ ] Can sync to Google Sheets

---

## Environment Variables Reference

### Frontend (.env in Vercel)
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-client-id
```

### Backend (.env in Render/Railway)
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://... (Supabase pooler URL)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback
GOOGLE_SHEETS_ID=your-sheets-id
```

---

## Troubleshooting

### Frontend shows "Cannot connect to API"
- Check `VITE_API_URL` is correct
- Make sure backend is running
- Check CORS settings in backend

### OAuth redirect fails
- Verify `GOOGLE_REDIRECT_URI` matches exactly
- Check Google Cloud Console has the redirect URI
- Make sure no trailing slashes

### Backend deployment fails
- Check build logs in Render/Railway
- Verify all environment variables are set
- Check database connection string is correct

### Database connection errors
- Use Supabase connection pooler URL (port 6543)
- Verify database is accessible
- Check Supabase project is active

---

## Cost Estimate

- **Vercel:** Free (hobby plan)
- **Render:** Free tier (spins down after inactivity, but free)
- **Railway:** $5/month (or free trial)
- **Supabase:** Free tier (generous limits)

**Total:** $0-5/month depending on usage

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Share with your team
3. ✅ Set up custom domain (optional)
4. ✅ Monitor usage and errors
5. ✅ Set up backups (Supabase has automatic backups)

---

**Your ProspectPulse app will be live and accessible from anywhere!** 🎉

