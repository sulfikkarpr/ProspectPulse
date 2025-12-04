# 🚨 Fix: "column p.notes does not exist" Error

## The Problem
The error means the `notes` column hasn't been added to your database yet. You need to run the migration.

## Quick Fix: Run the Migration

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. **Select your project**
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"**

### Step 2: Run the Migration SQL
1. **Copy this SQL:**
   ```sql
   ALTER TABLE prospects 
   ADD COLUMN IF NOT EXISTS notes TEXT;
   ```

2. **Paste it** into the SQL Editor

3. **Click "Run"** (or press Ctrl+Enter)

4. **You should see:** "Success. No rows returned" ✅

### Step 3: Verify It Worked
Run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prospects' AND column_name = 'notes';
```

You should see the `notes` column listed.

### Step 4: Try Syncing Again
1. Go back to ProspectPulse
2. Click **"Sync to Google Sheets"** again
3. It should work now! ✅

## That's It!

The migration adds the `notes` column to your prospects table. After running it, the sync will work and you can start adding notes to prospects.

