# 🔍 Debug: Stuck on "Loading..." Screen

## The Problem

After successful OAuth login, the app gets stuck on "Loading..." screen.

## Possible Causes

1. **API call to `/auth/me` is failing**
2. **CORS issue**
3. **Token not being set correctly**
4. **Backend not responding**

## Quick Fix Steps

### Step 1: Check Browser Console

1. **Open browser Developer Tools** (F12 or Right-click > Inspect)
2. **Go to "Console" tab**
3. **Look for errors** - you should see error messages if API calls are failing

### Step 2: Check Network Tab

1. **Go to "Network" tab** in Developer Tools
2. **Try logging in again**
3. **Look for the `/auth/me` request**
4. **Check if it:**
   - Shows status 200 (success) or error code
   - Has response data
   - Is blocked by CORS

### Step 3: Check Backend Logs

Look at your backend terminal - you should see:
- `Step 1: Exchanging code for tokens...`
- `Step 2: Getting user info from Google...`
- `Step 3: Checking database for existing user...`
- etc.

If you see errors there, that's the issue.

### Step 4: Test API Directly

Open a new browser tab and go to:
```
http://localhost:4000/api/auth/me
```

You should see an error (since you're not authenticated), but it confirms the backend is running.

Or test with your token:
```bash
# Get token from localStorage in browser console:
# localStorage.getItem('token')

# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/auth/me
```

## Common Issues & Solutions

### Issue 1: CORS Error

**Error in console:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix:** Check `backend/src/server.ts` - make sure `FRONTEND_URL` is set to `http://localhost:5173`

### Issue 2: 401 Unauthorized

**Error:** `401 Unauthorized` when calling `/auth/me`

**Fix:** 
- Token might not be set correctly
- Check browser console: `localStorage.getItem('token')` should return a token
- Token might be expired or invalid

### Issue 3: Network Error

**Error:** `Network Error` or request hangs

**Fix:**
- Check backend is running on port 4000
- Check `VITE_API_URL` in `frontend/.env` is `http://localhost:4000`
- Check firewall/antivirus isn't blocking

### Issue 4: Database Error

**Backend shows:** Database connection errors

**Fix:** We already fixed the database connection, but verify it's still working:
```bash
cd backend
node debug-connection.js
```

## Quick Test

1. **Open browser console** (F12)
2. **Run this:**
   ```javascript
   // Check if token exists
   console.log('Token:', localStorage.getItem('token'));
   
   // Try to fetch user
   fetch('http://localhost:4000/api/auth/me', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   })
   .then(r => r.json())
   .then(data => console.log('User data:', data))
   .catch(err => console.error('Error:', err));
   ```

This will show you exactly what's failing.

## What to Share

If it's still not working, share:
1. **Browser console errors** (screenshot or copy-paste)
2. **Network tab** - the `/auth/me` request details
3. **Backend terminal output** - any errors there

This will help identify the exact issue!

