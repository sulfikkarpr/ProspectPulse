# 🔧 Switch to Connection Pooler (Fix IPv4 Issue)

## What I See in Your Screenshot

You're currently on **"Direct connection"** which shows:
- ❌ Warning: "Not IPv4 compatible"
- ❌ This is why you're getting connection errors!

## The Fix: Switch to Connection Pooler

### Step 1: Change the Method Dropdown

In your Supabase dashboard:

1. **Look at the "Method" dropdown** (third dropdown on the right)
2. **Click on it** - it currently says "Direct connection"
3. **Select "Connection pooling"** or **"Session pooler"** from the dropdown

### Step 2: Copy the Pooler Connection String

After switching to "Connection pooling":

1. You'll see a **new connection string** appear
2. It should look like:
   ```
   postgresql://postgres.qonzohurhiasaudqubdn:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
3. **Click the copy button** (📋) next to the connection string
4. **Note:** The port will be **6543** (not 5432)
5. **Note:** The host will be `aws-0-[REGION].pooler.supabase.com` (not `db.xxx.supabase.co`)

### Step 3: Update Your .env File

1. **Open:** `backend/.env`
2. **Find:** `DATABASE_URL=...`
3. **Replace** with the copied pooler connection string
4. **Replace** `[YOUR_PASSWORD]` with: `SulfiProject`
5. **Save** the file

### Step 4: Test Connection

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Database connection test successful
```

## Why This Works

- **Direct connection (port 5432):** ❌ Not IPv4 compatible, causes connection errors
- **Connection pooler (port 6543):** ✅ IPv4 compatible, works reliably

## Quick Visual Guide

```
Current (Wrong):
Method: [Direct connection ▼]  ← Change this!

After Change:
Method: [Connection pooling ▼]  ← Select this!

Then copy the new connection string that appears below.
```

## Important Notes

- The pooler connection string will have a **different format**
- Port will be **6543** (not 5432)
- Host will be `pooler.supabase.com` (not `supabase.co`)
- Username might include project reference: `postgres.qonzohurhiasaudqubdn`

Once you switch to "Connection pooling" and copy that connection string, your database connection will work!

