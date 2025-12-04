# 🔧 Set Vercel Environment Variables

## Problem
Your frontend is trying to connect to `http://localhost:4000/api` which doesn't work in production.

## Solution: Set Environment Variables in Vercel

### Step 1: Get Your Backend URL

First, make sure your backend is deployed on Render:
- Go to Render Dashboard
- Your service → You'll see a URL like: `https://prospectpulse-backend.onrender.com`
- Copy this URL

**If backend is not deployed yet:**
- Deploy it first (see `FREE_BACKEND_DEPLOYMENT.md`)
- Then come back here

---

### Step 2: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com
   - Sign in
   - Click on your `prospect-pulse-frontend` project

2. **Navigate to Environment Variables:**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add/Update Variables:**

   **Variable 1: VITE_API_URL**
   - Click **"Add New"** (or edit existing)
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend.onrender.com`
     - Replace `your-backend.onrender.com` with your actual Render backend URL
     - **Important:** Do NOT include `/api` - the code adds it automatically
   - **Environments:** ✅ Select all three:
     - Production
     - Preview  
     - Development
   - Click **"Save"**

   **Variable 2: VITE_GOOGLE_CLIENT_ID**
   - Click **"Add New"** (or edit existing)
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `5614789434-msigvf64drqnjcf4475cv1agmm6trv3k.apps.googleusercontent.com`
   - **Environments:** ✅ Select all three:
     - Production
     - Preview
     - Development
   - Click **"Save"**

---

### Step 3: Redeploy Frontend

After setting environment variables, you need to redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots) → **"Redeploy"**
4. Confirm redeploy
5. Wait 2-3 minutes

**OR** push a new commit to trigger auto-redeploy:
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

### Step 4: Verify

1. Visit your Vercel URL: `https://prospect-pulse-frontend.vercel.app/login`
2. Open browser console (F12)
3. Click "Sign in with Google"
4. Check the error message - it should now show your Render backend URL instead of localhost
5. If it still shows localhost, the environment variable wasn't set correctly

---

## Example Values

**If your Render backend URL is:** `https://prospectpulse-backend.onrender.com`

**Then set:**
- `VITE_API_URL` = `https://prospectpulse-backend.onrender.com` (no `/api`)
- `VITE_GOOGLE_CLIENT_ID` = `5614789434-msigvf64drqnjcf4475cv1agmm6trv3k.apps.googleusercontent.com`

**Note:** The code automatically adds `/api` to the base URL, so don't include it in `VITE_API_URL`.

---

## Troubleshooting

### Still shows localhost?
- ✅ Make sure you selected **all three environments** (Production, Preview, Development)
- ✅ Redeploy after setting variables
- ✅ Check the variable name is exactly `VITE_API_URL` (case-sensitive)
- ✅ Check the value doesn't have trailing spaces

### Can't find Environment Variables?
- Go to: Your Project → Settings → Environment Variables
- It's in the left sidebar under Settings

### Backend not deployed yet?
- Deploy backend first (see `FREE_BACKEND_DEPLOYMENT.md`)
- Get the backend URL
- Then set `VITE_API_URL` in Vercel

---

## Quick Checklist

- [ ] Backend is deployed on Render
- [ ] Have backend URL (e.g., `https://xxx.onrender.com`)
- [ ] Set `VITE_API_URL` in Vercel to `https://xxx.onrender.com` (without `/api`)
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Vercel
- [ ] Selected all three environments (Production, Preview, Development)
- [ ] Redeployed frontend
- [ ] Tested login - should connect to backend

---

**Once environment variables are set and frontend is redeployed, login should work!** 🎉

