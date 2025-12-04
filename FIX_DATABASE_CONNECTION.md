# 🔧 Fix: Database Connection Error (ENETUNREACH)

## Problem
The error `connect ENETUNREACH 2406:da18:243:740e:f825:a482:2793:afff:5432` means the app can't connect to your database. This is often an IPv6 connectivity issue with Supabase.

## Solution: Use Supabase Connection Pooler

### Step 1: Get the Correct Connection String

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Go to Settings > Database**

3. **Find "Connection string" section**

4. **Select "Connection pooling" tab** (not "Direct connection")

5. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   
   **Note:** Port should be **6543** (pooler), not 5432 (direct)

### Step 2: Update Your .env File

1. **Open:** `backend/.env`

2. **Replace** `DATABASE_URL` with the pooler connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

3. **Make sure:**
   - Port is **6543** (pooler)
   - Not **5432** (direct connection)
   - URL contains `pooler.supabase.com`

### Step 3: Restart Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Database connection test successful
```

## Alternative: If Pooler Doesn't Work

### Option A: Use Transaction Mode Pooler

In Supabase, there are two pooler modes:
- **Session mode** (port 6543) - Recommended
- **Transaction mode** (port 6543) - Alternative

Try the transaction mode connection string if session mode doesn't work.

### Option B: Check Network/Firewall

1. **Verify** your internet connection
2. **Check** if you're behind a firewall blocking database connections
3. **Try** from a different network

### Option C: Use Direct Connection (Less Recommended)

If pooler doesn't work, you can try the direct connection:
```
postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

But this may have IPv6 issues. The pooler is preferred.

## Verify Connection

After updating, test the connection:

```bash
cd backend
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()').then(r => { console.log('✅ Connected!', r.rows[0]); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

## Quick Checklist

- [ ] Using Supabase connection pooler URL (port 6543)
- [ ] Connection string contains `pooler.supabase.com`
- [ ] Updated `DATABASE_URL` in `backend/.env`
- [ ] Restarted backend server
- [ ] See "✅ Database connected" message

## Still Having Issues?

1. **Double-check** the connection string from Supabase dashboard
2. **Verify** your Supabase project is active (not paused)
3. **Check** your database password is correct
4. **Try** the connection test command above

The code has been updated to automatically handle pooler URLs, but you still need to use the correct connection string from Supabase!

