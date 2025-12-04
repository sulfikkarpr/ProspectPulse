# 🔍 Root Cause Analysis: Why Database Connection Fails

## The Problem

**Error:** `Tenant or user not found`

This error means: **The database server cannot find your user/tenant in the connection string format you're using.**

## Why It's Happening

### Issue #1: Wrong Connection String Format

Your current connection string is:
```
postgresql://postgres:SulfiProject@db.qonzohurhiasaudqubdn.supabase.co:5432/postgres
```

**Problems with this format:**
1. **Port 5432** = Direct connection (has IPv6 connectivity issues)
2. **Username is just `postgres`** = Wrong for Supabase pooler
3. **Host is `db.xxx.supabase.co`** = Direct connection endpoint

### Issue #2: Supabase Uses Different Formats

Supabase has **TWO types of connections:**

#### Type A: Direct Connection (Port 5432)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
- ❌ **Problem:** Uses IPv6 addresses that your network can't reach
- ❌ **Error:** `connect ENETUNREACH` (network unreachable)

#### Type B: Connection Pooler (Port 6543) - **YOU NEED THIS**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
- ✅ **Solution:** Uses IPv4, works reliably
- ✅ **Format:** Username includes project reference: `postgres.[PROJECT-REF]`
- ✅ **Host:** Different format: `aws-0-[REGION].pooler.supabase.com`

### Issue #3: Missing Project Reference in Username

**Wrong:**
```
postgresql://postgres:password@...  ← Username is just "postgres"
```

**Correct (for pooler):**
```
postgresql://postgres.qonzohurhiasaudqubdn:password@...  ← Username includes project ref
```

The pooler requires the project reference (`qonzohurhiasaudqubdn`) to be part of the username!

### Issue #4: Unknown Region

The pooler URL format requires your **exact region**:
- `aws-0-us-east-1.pooler.supabase.com` (US East)
- `aws-0-ap-southeast-1.pooler.supabase.com` (Asia Pacific)
- `aws-0-eu-west-1.pooler.supabase.com` (Europe)
- etc.

**We don't know your region** - that's why guessed formats don't work!

## The Solution

### Why You Need the Exact URL from Supabase

1. **Region is project-specific** - Each Supabase project is in a specific AWS region
2. **Format may vary** - Supabase might use slightly different formats
3. **Project reference** - Must match exactly
4. **Password encoding** - Special characters might need encoding

### What Supabase Dashboard Provides

When you go to Supabase Dashboard > Settings > Database > Connection pooling:
- ✅ **Exact region** for your project
- ✅ **Correct hostname** format
- ✅ **Proper username** format with project reference
- ✅ **Pre-formatted** connection string (just add password)

## Summary: Why It's Not Working

| Issue | Current Status | Why It Fails |
|-------|---------------|--------------|
| **Connection Type** | Direct (5432) | IPv6 unreachable on your network |
| **Username Format** | `postgres` | Pooler needs `postgres.[PROJECT-REF]` |
| **Host Format** | `db.xxx.supabase.co` | Pooler uses `aws-0-[REGION].pooler.supabase.com` |
| **Port** | 5432 | Pooler uses 6543 |
| **Region** | Unknown | Must match your project's exact region |

## The Fix (Step-by-Step)

### Step 1: Get Exact URL
- Go to Supabase Dashboard
- Settings > Database > Connection pooling
- Copy "Session mode" URL

### Step 2: Replace Password
- Find `[YOUR-PASSWORD]` in the copied URL
- Replace with: `SulfiProject`

### Step 3: Update .env
- Paste the complete URL into `backend/.env`
- Save file

### Step 4: Test
```bash
cd backend
node test-db-connection.js
```

## Why Guessed Formats Don't Work

We tried:
- ❌ `postgresql://postgres.qonzohurhiasaudqubdn:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
- ❌ `postgresql://postgres.qonzohurhiasaudqubdn:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
- ❌ `postgresql://postgres.qonzohurhiasaudqubdn:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`

**All failed because:**
- We don't know your exact region
- The format might have slight variations
- Supabase might use a different region code

## Bottom Line

**The root cause:** You're using a direct connection URL (port 5432) that has network connectivity issues, and we don't have the exact pooler URL format for your specific Supabase project.

**The solution:** Get the exact connection string from Supabase Dashboard - it will have the correct region, format, and structure for your project.

**Why it's necessary:** Supabase projects are region-specific, and the connection string format must match exactly. There's no way to guess it correctly.

