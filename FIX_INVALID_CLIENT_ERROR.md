# 🔧 Fix: OAuth Error - invalid_client

## Problem
```
Error: invalid_client
Error description: Unauthorized
```

## Root Cause
The `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` environment variables in Render are either:
- Missing
- Incorrect (typos, wrong values)
- From a different Google Cloud project
- Not properly set in Render

---

## Solution

### Step 1: Get Your Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com
   - Select your project (the one you're using for ProspectPulse)

2. **Navigate to Credentials:**
   - Click **"APIs & Services"** (left sidebar)
   - Click **"Credentials"** (left sidebar)
   - Find your **OAuth 2.0 Client ID**
   - Click on it to view details

3. **Copy Your Credentials:**
   - **Client ID**: Copy the full value (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret**: Click **"Show"** or **"Reveal"** to see it, then copy (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

### Step 2: Update Render Environment Variables

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Select your backend service

2. **Go to Environment Tab:**
   - Click **"Environment"** in the left sidebar

3. **Add/Update These Variables:**

   **Required Variables:**
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/callback
   ```

   **Important Notes:**
   - Replace `your-client-id-here` with your actual Client ID
   - Replace `your-client-secret-here` with your actual Client Secret
   - Replace `your-backend.onrender.com` with your actual Render backend URL
   - **No quotes** around the values
   - **No spaces** before or after the `=` sign

4. **Click "Save Changes"**
   - This will trigger a redeploy (takes 2-3 minutes)

---

### Step 3: Verify All Required Environment Variables

Make sure you have **ALL** of these set in Render:

#### Required for OAuth:
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_REDIRECT_URI`

#### Required for Database:
- ✅ `DATABASE_URL`

#### Required for JWT:
- ✅ `JWT_SECRET` (any random string, e.g., `your-super-secret-jwt-key-here`)

#### Required for Frontend:
- ✅ `FRONTEND_URL` (your Vercel frontend URL, e.g., `https://prospect-pulse-frontend.vercel.app`)

---

### Step 4: Common Mistakes to Avoid

#### ❌ Wrong: Missing Variable
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=  (empty or missing)
```

#### ❌ Wrong: Extra Quotes
```
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123"
```
**Should be:**
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123
```

#### ❌ Wrong: Extra Spaces
```
GOOGLE_CLIENT_ID = 123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-abc123
```
**Should be:**
```
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123
```

#### ❌ Wrong: Wrong Project
- Using Client ID from Project A
- Using Client Secret from Project B
- **They must be from the same OAuth Client!**

#### ❌ Wrong: Old/Revoked Secret
- If you regenerated the Client Secret in Google Cloud Console
- Old secret in Render won't work
- **Update Render with the new secret**

---

### Step 5: Verify in Render Logs

After redeploy, check Render logs:

1. **Render Dashboard** → Your service → **Logs** tab
2. Look for startup messages:
   ```
   ✅ Database connected
   ✅ Database connection test successful
   🚀 Server running on http://localhost:10000
   ```
3. If you see errors about missing environment variables, they're not set correctly

---

### Step 6: Test OAuth Flow

1. **Wait for Render redeploy** (2-3 minutes)
2. **Go to your Vercel frontend**
3. **Click "Sign in with Google"**
4. **Should redirect to Google OAuth** ✅

---

## Quick Checklist

- [ ] Got Client ID from Google Cloud Console
- [ ] Got Client Secret from Google Cloud Console (clicked "Show" to reveal)
- [ ] Verified Client ID and Secret are from the same OAuth Client
- [ ] Set `GOOGLE_CLIENT_ID` in Render (no quotes, no spaces)
- [ ] Set `GOOGLE_CLIENT_SECRET` in Render (no quotes, no spaces)
- [ ] Set `GOOGLE_REDIRECT_URI` in Render (matches Google Cloud Console)
- [ ] Set `DATABASE_URL` in Render
- [ ] Set `JWT_SECRET` in Render
- [ ] Set `FRONTEND_URL` in Render
- [ ] Saved all changes in Render
- [ ] Waited for redeploy to complete
- [ ] Checked Render logs for errors
- [ ] Tested login again

---

## Still Not Working?

### 1. Double-Check Client ID Format
- Should look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- Should end with `.apps.googleusercontent.com`
- No extra characters or spaces

### 2. Double-Check Client Secret Format
- Should look like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`
- Starts with `GOCSPX-`
- No extra characters or spaces

### 3. Verify OAuth Client is Enabled
- Google Cloud Console → Credentials
- Make sure your OAuth Client shows **"Enabled"** status
- If disabled, click to enable it

### 4. Check OAuth Consent Screen
- Google Cloud Console → OAuth consent screen
- Make sure it's configured (even if in "Testing" mode)
- Add your email as a test user if in testing mode

### 5. Regenerate Client Secret (Last Resort)
If nothing works:
1. Google Cloud Console → Credentials → Your OAuth Client
2. Click **"Reset Secret"** or **"Regenerate"**
3. Copy the new Client Secret
4. Update `GOOGLE_CLIENT_SECRET` in Render
5. Save and redeploy

---

## Example Configuration

**In Render Environment Variables:**

```
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
GOOGLE_REDIRECT_URI=https://prospectpulse-backend.onrender.com/api/auth/callback
DATABASE_URL=postgresql://user:pass@host:6543/dbname
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://prospect-pulse-frontend.vercel.app
```

**Important:** Replace all values with your actual credentials!

---

**Once all environment variables are correctly set, the `invalid_client` error should be resolved!** 🎉

