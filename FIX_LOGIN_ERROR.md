# 🔧 Fix: "Failed to initiate login" Error on Vercel

## Problem
When clicking "Sign in with Google" on your Vercel-deployed frontend, you see:
```
Failed to initiate login. Please try again.
```

## Root Cause
The frontend cannot connect to your backend API. This happens because:

1. **`VITE_API_URL` environment variable is not set in Vercel** (or set incorrectly)
2. **Backend is not deployed yet** (or not accessible)
3. **CORS configuration** blocking requests

## Solution

### Step 1: Check if Backend is Deployed

Your backend needs to be deployed to Render or Railway first. If not deployed:
- See `DEPLOY_TO_VERCEL.md` for backend deployment instructions
- You need a backend URL like: `https://your-backend.onrender.com`

### Step 2: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com
   - Select your `prospect-pulse-frontend` project
   - Go to **Settings** → **Environment Variables**

2. **Add/Update these variables:**

   **Variable 1:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend.onrender.com/api` (replace with your actual backend URL)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `5614789434-msigvf64drqnjcf4475cv1agmm6trv3k.apps.googleusercontent.com`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development

3. **Important:** 
   - The `VITE_API_URL` should **NOT** include `/api` at the end if your backend serves API at `/api`
   - If your backend serves at root, use: `https://your-backend.onrender.com`
   - If your backend serves at `/api`, use: `https://your-backend.onrender.com/api`

### Step 3: Redeploy

After updating environment variables:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

Or push a new commit to trigger auto-deploy.

### Step 4: Verify Backend is Running

Test your backend directly:
```bash
curl https://your-backend.onrender.com/api/auth/url
```

Should return:
```json
{"url": "https://accounts.google.com/..."}
```

If you get an error, your backend is not running or not accessible.

---

## Quick Checklist

- [ ] Backend is deployed to Render/Railway
- [ ] Backend URL is accessible (test with curl)
- [ ] `VITE_API_URL` is set in Vercel (without `/api` if backend serves at root)
- [ ] `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- [ ] Environment variables are set for Production, Preview, and Development
- [ ] Frontend is redeployed after setting variables
- [ ] Backend CORS allows your Vercel domain

---

## Common Issues

### Issue 1: "Cannot connect to backend"
**Fix:** 
- Check backend is deployed and running
- Verify `VITE_API_URL` is correct (no trailing slash)
- Check backend logs for errors

### Issue 2: "CORS error" in browser console
**Fix:**
- Update backend CORS to allow your Vercel domain
- In `backend/src/server.ts`, add your Vercel URL to `allowedOrigins`

### Issue 3: "404 Not Found" when calling `/auth/url`
**Fix:**
- Check if backend route is `/api/auth/url` or `/auth/url`
- Update `VITE_API_URL` accordingly

---

## Testing

After fixing, test the login flow:
1. Visit your Vercel URL: `https://prospect-pulse-frontend.vercel.app/login`
2. Click "Sign in with Google"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to your app

---

**Once backend is deployed and environment variables are set, login should work!** 🎉

