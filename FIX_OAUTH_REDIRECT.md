# 🔧 Fix: OAuth Error 400 - redirect_uri_mismatch

## Problem
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

## Root Cause
The redirect URI in your backend's `GOOGLE_REDIRECT_URI` environment variable doesn't match what's configured in Google Cloud Console.

## Solution

### Step 1: Get Your Backend URL

1. Go to **Render Dashboard**
2. Your backend service → You'll see a URL like:
   - `https://prospectpulse-backend.onrender.com`
3. **Copy this URL**

---

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com
   - Select your project (the one with your OAuth credentials)

2. **Navigate to OAuth Settings:**
   - Click **"APIs & Services"** (left sidebar)
   - Click **"Credentials"** (left sidebar)
   - Find your **OAuth 2.0 Client ID**
   - Click on it to edit

3. **Add Authorized Redirect URI:**
   - Scroll down to **"Authorized redirect URIs"**
   - Click **"+ ADD URI"**
   - Add: `https://your-backend.onrender.com/api/auth/callback`
     - Replace `your-backend.onrender.com` with your actual Render backend URL
     - **Important:** Must match exactly (including `/api/auth/callback`)
   - Click **"SAVE"**

---

### Step 3: Update Backend Environment Variable

1. **Go to Render Dashboard:**
   - Your backend service → **Environment** tab

2. **Update `GOOGLE_REDIRECT_URI`:**
   - Find `GOOGLE_REDIRECT_URI` variable
   - Update value to: `https://your-backend.onrender.com/api/auth/callback`
     - Replace with your actual Render backend URL
   - Click **"Save Changes"**
   - This will trigger a redeploy

---

### Step 4: Verify Both Match Exactly

**In Google Cloud Console:**
- Redirect URI: `https://prospectpulse-backend.onrender.com/api/auth/callback`

**In Render Environment Variables:**
- `GOOGLE_REDIRECT_URI`: `https://prospectpulse-backend.onrender.com/api/auth/callback`

**They must match EXACTLY:**
- ✅ Same protocol (`https://`)
- ✅ Same domain
- ✅ Same path (`/api/auth/callback`)
- ✅ No trailing slashes
- ✅ No extra spaces

---

### Step 5: Test Again

1. Wait for Render to redeploy (2-3 minutes)
2. Go to your Vercel frontend: `https://prospect-pulse-frontend.vercel.app/login`
3. Click "Sign in with Google"
4. Should now redirect to Google OAuth successfully ✅

---

## Common Mistakes

### ❌ Wrong: Missing `/api`
```
https://backend.onrender.com/auth/callback
```
**Should be:**
```
https://backend.onrender.com/api/auth/callback
```

### ❌ Wrong: Trailing slash
```
https://backend.onrender.com/api/auth/callback/
```
**Should be:**
```
https://backend.onrender.com/api/auth/callback
```

### ❌ Wrong: HTTP instead of HTTPS
```
http://backend.onrender.com/api/auth/callback
```
**Should be:**
```
https://backend.onrender.com/api/auth/callback
```

### ❌ Wrong: Different domains
- Google Console: `https://backend-123.onrender.com/api/auth/callback`
- Render Env: `https://backend-456.onrender.com/api/auth/callback`
- **They must be the same!**

---

## Quick Checklist

- [ ] Got backend URL from Render (e.g., `https://xxx.onrender.com`)
- [ ] Added redirect URI to Google Cloud Console: `https://xxx.onrender.com/api/auth/callback`
- [ ] Updated `GOOGLE_REDIRECT_URI` in Render to: `https://xxx.onrender.com/api/auth/callback`
- [ ] Both URIs match exactly (no trailing slashes, same domain)
- [ ] Saved changes in Google Cloud Console
- [ ] Saved changes in Render (triggered redeploy)
- [ ] Waited for Render redeploy to complete
- [ ] Tested login again

---

## Example

**If your Render backend URL is:** `https://prospectpulse-backend.onrender.com`

**Then:**

1. **Google Cloud Console:**
   - Add: `https://prospectpulse-backend.onrender.com/api/auth/callback`

2. **Render Environment Variable:**
   - `GOOGLE_REDIRECT_URI` = `https://prospectpulse-backend.onrender.com/api/auth/callback`

---

## Still Not Working?

1. **Check Render logs:**
   - Render Dashboard → Your service → **Logs** tab
   - Look for OAuth-related errors

2. **Verify in Google Cloud Console:**
   - Make sure the redirect URI is saved (refresh the page)
   - Check for typos

3. **Clear browser cache:**
   - Sometimes OAuth errors are cached
   - Try incognito/private window

4. **Check backend is running:**
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok",...}`

---

**Once both URIs match exactly, OAuth should work!** 🎉

