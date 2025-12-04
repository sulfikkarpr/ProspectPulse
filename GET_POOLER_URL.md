# 🔧 How to Get the Correct Supabase Pooler URL

## Step-by-Step Instructions

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. **Sign in** with your account
3. **Select your project** (the one with database `qonzohurhiasaudqubdn`)

### Step 2: Navigate to Database Settings
1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"** in the settings menu

### Step 3: Get Connection Pooler URL
1. Scroll down to **"Connection string"** section
2. You'll see tabs: **"URI"**, **"JDBC"**, **"Connection pooling"**
3. **Click the "Connection pooling" tab**
4. You'll see connection strings for different modes:
   - **Session mode** (recommended)
   - **Transaction mode** (alternative)

### Step 4: Copy the Session Mode URL
1. Under **"Session mode"**, you'll see a connection string like:
   ```
   postgresql://postgres.qonzohurhiasaudqubdn:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
2. **Copy this entire string**
3. **Replace `[YOUR-PASSWORD]`** with your actual database password: `SulfiProject`

### Step 5: Update Your .env File

Open `backend/.env` and replace the `DATABASE_URL` line with the copied URL:

```env
DATABASE_URL=postgresql://postgres.qonzohurhiasaudqubdn:SulfiProject@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** 
- Make sure the port is **6543** (pooler)
- Make sure it contains `pooler.supabase.com`
- Replace `[REGION]` with your actual region (e.g., `us-east-1`, `ap-southeast-1`, etc.)

### Step 6: Test the Connection

After updating, test it:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Database connection test successful
🚀 Server running on http://localhost:4000
```

## Quick Reference

Your current project reference: `qonzohurhiasaudqubdn`
Your password: `SulfiProject`

The pooler URL format should be:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Still Having Issues?

If the pooler URL doesn't work:
1. Try **Transaction mode** instead of Session mode
2. Verify your database password is correct
3. Check that your Supabase project is active (not paused)
4. Make sure you're using the correct region

