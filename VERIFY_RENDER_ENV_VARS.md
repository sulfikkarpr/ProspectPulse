# ✅ Verify Render Environment Variables

## Quick Checklist

Use this checklist to verify all environment variables are correctly set in Render:

---

## Step 1: Access Render Environment Variables

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **backend service**
3. Click **"Environment"** tab (left sidebar)

---

## Step 2: Verify Each Variable

### ✅ GOOGLE_CLIENT_ID

**Should look like:**
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] Starts with numbers
- [ ] Contains `-` (hyphen)
- [ ] Ends with `.apps.googleusercontent.com`
- [ ] No quotes around the value
- [ ] No spaces before or after `=`

**How to get it:**
1. Google Cloud Console → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Copy the "Client ID" value

---

### ✅ GOOGLE_CLIENT_SECRET

**Should look like:**
```
GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] Starts with `GOCSPX-`
- [ ] No quotes around the value
- [ ] No spaces before or after `=`
- [ ] Matches the secret in Google Cloud Console

**How to get it:**
1. Google Cloud Console → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Click **"Show"** or **"Reveal"** next to Client Secret
4. Copy the secret value

**⚠️ Important:** If you regenerated the secret in Google Cloud Console, you MUST update it in Render!

---

### ✅ GOOGLE_REDIRECT_URI

**Should look like:**
```
https://your-backend.onrender.com/api/auth/callback
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] Starts with `https://` (not `http://`)
- [ ] Matches your Render backend URL exactly
- [ ] Ends with `/api/auth/callback` (not `/api/auth/callback/`)
- [ ] No quotes around the value
- [ ] No spaces before or after `=`
- [ ] Matches what's in Google Cloud Console "Authorized redirect URIs"

**How to get it:**
1. Render Dashboard → Your backend service
2. Copy the service URL (e.g., `https://prospectpulse-backend.onrender.com`)
3. Add `/api/auth/callback` to the end

**Example:**
- Render URL: `https://prospectpulse-backend.onrender.com`
- Redirect URI: `https://prospectpulse-backend.onrender.com/api/auth/callback`

---

### ✅ DATABASE_URL

**Should look like:**
```
postgresql://user:password@host:6543/dbname
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] Starts with `postgresql://`
- [ ] For Supabase: Uses port `6543` (pooler) or `5432` (direct)
- [ ] Contains valid credentials

---

### ✅ JWT_SECRET

**Should look like:**
```
any-random-string-at-least-32-characters-long
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] At least 32 characters long (recommended)
- [ ] Random/secure value (not "password" or "secret")

**Example:**
```
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-12345
```

---

### ✅ FRONTEND_URL

**Should look like:**
```
https://your-frontend.vercel.app
```

**Check:**
- [ ] Variable exists (not empty)
- [ ] Starts with `https://` (for production)
- [ ] Matches your Vercel frontend URL exactly
- [ ] No trailing slash

**Example:**
```
FRONTEND_URL=https://prospect-pulse-frontend.vercel.app
```

---

### ✅ GOOGLE_SHEETS_ID (Optional but recommended)

**Should look like:**
```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Check:**
- [ ] Variable exists (if using Google Sheets sync)
- [ ] Extracted from Google Sheets URL
- [ ] No quotes around the value

**How to get it:**
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the `{SHEET_ID}` part

---

## Step 3: Common Format Issues

### ❌ Wrong Format Examples:

```env
# WRONG: Quotes
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"

# WRONG: Spaces around =
GOOGLE_CLIENT_ID = 123456789-abc.apps.googleusercontent.com

# WRONG: Trailing slash
GOOGLE_REDIRECT_URI=https://backend.onrender.com/api/auth/callback/

# WRONG: HTTP instead of HTTPS
GOOGLE_REDIRECT_URI=http://backend.onrender.com/api/auth/callback

# WRONG: Missing /api
GOOGLE_REDIRECT_URI=https://backend.onrender.com/auth/callback
```

### ✅ Correct Format:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=https://backend.onrender.com/api/auth/callback
DATABASE_URL=postgresql://user:pass@host:6543/dbname
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://frontend.vercel.app
GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

---

## Step 4: Verify in Google Cloud Console

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com
   - Select your project

2. **Check OAuth Client:**
   - APIs & Services → Credentials
   - Click your OAuth 2.0 Client ID
   - Verify:
     - [ ] Client ID matches `GOOGLE_CLIENT_ID` in Render
     - [ ] Client Secret matches `GOOGLE_CLIENT_SECRET` in Render
     - [ ] "Authorized redirect URIs" includes your Render redirect URI

3. **Check OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - Verify:
     - [ ] App is configured (even if in "Testing" mode)
     - [ ] Your email is added as a test user (if in testing mode)

---

## Step 5: Test After Updates

1. **Save all changes in Render**
2. **Wait for redeploy** (2-3 minutes)
3. **Check Render logs:**
   - Render Dashboard → Your service → **Logs** tab
   - Look for: `✅ Google OAuth Configuration:`
   - Should show Client ID and Redirect URI (masked)
4. **Test login:**
   - Go to your Vercel frontend
   - Click "Sign in with Google"
   - Should redirect to Google OAuth

---

## Still Getting `invalid_client` Error?

### 1. Double-Check Client Secret
- Go to Google Cloud Console
- Click your OAuth Client
- Click **"Reset Secret"** or **"Regenerate"**
- Copy the NEW secret
- Update `GOOGLE_CLIENT_SECRET` in Render
- Save and redeploy

### 2. Verify They're From Same Client
- Client ID and Secret must be from the **same** OAuth Client
- Don't mix credentials from different projects/clients

### 3. Check Render Logs
- Render Dashboard → Your service → **Logs**
- Look for startup messages
- Should see: `✅ Google OAuth Configuration:`
- If you see `MISSING`, the variable isn't set correctly

### 4. Try Regenerating Both
- Google Cloud Console → Credentials
- Delete old OAuth Client (or create new one)
- Create new OAuth Client
- Copy new Client ID and Secret
- Update both in Render
- Save and redeploy

---

## Quick Test

After updating variables, check Render logs for:

```
✅ Google OAuth Configuration:
   Client ID: 123456789-abc...
   Client Secret: GOCSPX-abc...
   Redirect URI: https://backend.onrender.com/api/auth/callback
```

If you see `MISSING` for any of these, that variable isn't set correctly!

---

**Once all variables are correctly set and match Google Cloud Console, the `invalid_client` error should be resolved!** 🎉

