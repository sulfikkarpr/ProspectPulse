# 🚀 Quick Guide: Connect ProspectPulse to Vercel

## Prerequisites
- ✅ Code pushed to GitHub
- ✅ GitHub account
- ✅ Vercel account (free)

---

## Step-by-Step: Deploy Frontend to Vercel

### Step 1: Push Code to GitHub (If Not Done)

```bash
cd /home/sulfikkar/Desktop/ProspectPulse
git push origin main
```

**Note:** If you get authentication errors, see the authentication section below.

---

### Step 2: Sign Up / Sign In to Vercel

1. Go to: **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

---

### Step 3: Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find **"ProspectPulse"** and click **"Import"**

---

### Step 4: Configure Project Settings

**IMPORTANT:** Set these exact values:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `frontend` ⚠️ **CRITICAL** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**How to set Root Directory:**
- Click **"Edit"** next to "Root Directory"
- Type: `frontend`
- Click **"Continue"**

---

### Step 5: Add Environment Variables

Before deploying, click **"Environment Variables"** and add:

#### Variable 1:
- **Name:** `VITE_API_URL`
- **Value:** `http://localhost:4000/api` (for now, update after backend deployment)
- **Environment:** Production, Preview, Development (select all)

#### Variable 2:
- **Name:** `VITE_GOOGLE_CLIENT_ID`
- **Value:** Your Google Client ID (from `frontend/.env`)
- **Example:** `123456789-abc.apps.googleusercontent.com`
- **Environment:** Production, Preview, Development (select all)

**To find your Google Client ID:**
```bash
cat frontend/.env | grep VITE_GOOGLE_CLIENT_ID
```

---

### Step 6: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes
3. ✅ **Your app is live!**

You'll get a URL like: `https://prospectpulse-xyz.vercel.app`

---

## Step 7: Update Environment Variables After Backend Deployment

Once you deploy your backend (to Render/Railway), update `VITE_API_URL`:

1. Go to Vercel dashboard
2. Your project → **Settings** → **Environment Variables**
3. Edit `VITE_API_URL`:
   - **New Value:** `https://your-backend.onrender.com/api`
4. Click **"Save"**
5. Go to **Deployments** tab
6. Click **"..."** on latest deployment → **"Redeploy"**

---

## Troubleshooting

### ❌ Build Fails: "Cannot find module"
**Fix:** Make sure **Root Directory** is set to `frontend`

### ❌ Build Fails: "Command not found"
**Fix:** Check **Build Command** is exactly: `npm run build`

### ❌ App loads but shows "Cannot connect to API"
**Fix:** 
1. Check `VITE_API_URL` is correct
2. Make sure backend is running
3. Update `VITE_API_URL` to your backend URL

### ❌ OAuth doesn't work
**Fix:**
1. Verify `VITE_GOOGLE_CLIENT_ID` is correct
2. Make sure Google OAuth redirect URI includes your Vercel URL

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root Directory set to `frontend`
- [ ] Environment variables added (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`)
- [ ] Deployed successfully
- [ ] Frontend URL works
- [ ] (Later) Updated `VITE_API_URL` to production backend URL

---

## Next Steps

After frontend is deployed:
1. Deploy backend to Render or Railway (see `DEPLOY_TO_VERCEL.md`)
2. Update `VITE_API_URL` in Vercel
3. Update Google OAuth redirect URIs
4. Test the full application

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html#vercel
- **Check deployment logs** in Vercel dashboard if something fails

---

**Your frontend will be live in minutes!** 🎉

