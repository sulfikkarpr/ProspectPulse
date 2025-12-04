# 🚨 Get Your Database Connection String NOW

## ⚡ Quick Steps (2 minutes)

Since you're in India/Kerala, your Supabase project could be in any region. We need the **exact** connection string.

### Step 1: Open Supabase
1. Go to: **https://supabase.com/dashboard**
2. **Sign in**
3. **Click on your project**

### Step 2: Get Connection String
1. Click **"Settings"** (⚙️) in left sidebar
2. Click **"Database"**
3. Scroll down to **"Connection string"**
4. Click **"Connection pooling"** tab
5. Under **"Session mode"**, you'll see a URL like:
   ```
   postgresql://postgres.qonzohurhiasaudqubdn:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
6. **Click the copy button** (📋) to copy it

### Step 3: Update Your .env
1. **Open:** `backend/.env` in a text editor
2. **Find:** `DATABASE_URL=...`
3. **Replace the entire value** with the copied URL
4. **Find** `[YOUR-PASSWORD]` in the URL
5. **Replace it** with: `SulfiProject`
6. **Save the file**

### Step 4: Test
```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Database connection test successful
```

## Why This Is Necessary

We tried:
- ❌ `us-east-1` (US East)
- ❌ `ap-southeast-1` (Singapore)
- ❌ `ap-south-1` (Mumbai)

**None worked** because Supabase projects can be in various regions, and we can't guess which one yours is in.

**The only way to know:** Get it from your Supabase Dashboard!

## Visual Guide

```
Supabase Dashboard
│
└── Your Project
    │
    └── Settings ⚙️
        │
        └── Database
            │
            └── Connection string
                │
                └── [Connection pooling] ← CLICK THIS TAB
                    │
                    └── Session mode
                        │
                        └── [Copy button] 📋 ← COPY THIS
                            │
                            └── Paste into backend/.env
                                │
                                └── Replace [YOUR-PASSWORD] with: SulfiProject
```

## That's It!

Once you copy the exact URL from Supabase and update your `.env` file, it will work immediately.

**Time needed:** 2 minutes
**Difficulty:** Easy (just copy-paste)

