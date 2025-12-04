# 🔧 Get Your Exact Supabase Database URL

## ⚠️ Important: You MUST get the exact URL from Supabase Dashboard

The connection string format varies by region and project setup. You need to copy it directly from Supabase.

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. **Sign in** with your account
3. **Click on your project** (the one you created)

### Step 2: Navigate to Database Settings
1. In the left sidebar, click **"Settings"** (⚙️ gear icon)
2. Click **"Database"** in the settings menu

### Step 3: Find Connection String Section
1. Scroll down to find **"Connection string"** section
2. You'll see several tabs:
   - **URI** (direct connection - don't use this)
   - **JDBC**
   - **Connection pooling** ← **USE THIS ONE**

### Step 4: Get Pooler Connection String
1. **Click the "Connection pooling" tab**
2. You'll see connection strings for:
   - **Session mode** (recommended) ← **USE THIS**
   - Transaction mode (alternative)

3. Under **"Session mode"**, you'll see a connection string that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 5: Copy and Customize
1. **Click the copy button** (📋) next to the Session mode connection string
2. **Paste it** into a text editor
3. **Find** `[YOUR-PASSWORD]` in the string
4. **Replace it** with: `SulfiProject`
5. **The final URL should look like:**
   ```
   postgresql://postgres.qonzohurhiasaudqubdn:SulfiProject@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   (Replace `[REGION]` with your actual region from the copied URL)

### Step 6: Update Your .env File

1. **Open:** `backend/.env`
2. **Find the line:** `DATABASE_URL=...`
3. **Replace the entire value** with your customized connection string
4. **Save the file**

### Step 7: Test the Connection

```bash
cd backend
node test-db-connection.js
```

Or restart your server:
```bash
npm run dev
```

You should see:
```
✅ Database connected
✅ Database connection test successful
```

## Visual Guide

```
Supabase Dashboard
│
├── Your Project (qonzohurhiasaudqubdn)
│   │
│   └── Settings (⚙️)
│       │
│       └── Database
│           │
│           └── Connection string
│               │
│               └── [Connection pooling] tab ← CLICK THIS
│                   │
│                   └── Session mode
│                       │
│                       └── [Copy button] 📋 ← COPY THIS
│                           │
│                           └── Replace [YOUR-PASSWORD] with: SulfiProject
│                               │
│                               └── Paste into backend/.env
```

## Common Issues

### Issue: "Tenant or user not found"
- **Cause:** Wrong connection string format
- **Solution:** Make sure you're using the **exact** URL from Supabase dashboard
- **Check:** Username should be `postgres.[PROJECT-REF]` not just `postgres`

### Issue: "Connection timeout"
- **Cause:** Wrong region or network issue
- **Solution:** Verify the region in the URL matches your Supabase project region

### Issue: "Password authentication failed"
- **Cause:** Wrong password
- **Solution:** Double-check your database password is `SulfiProject`

## Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Went to Settings > Database
- [ ] Clicked "Connection pooling" tab
- [ ] Copied "Session mode" connection string
- [ ] Replaced `[YOUR-PASSWORD]` with `SulfiProject`
- [ ] Updated `DATABASE_URL` in `backend/.env`
- [ ] Tested connection successfully

## Still Having Issues?

If you can't find the connection pooling tab:
1. Make sure you're in the correct project
2. Check that your Supabase project is active (not paused)
3. Try refreshing the page
4. Contact Supabase support if the tab is missing

**The key is to use the EXACT connection string from Supabase, not a guessed format!**

