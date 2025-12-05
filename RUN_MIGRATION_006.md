# Run Migration 006: Add Referral Tracking

## Quick Copy-Paste SQL

Copy and paste this **entire block** into Supabase SQL Editor:

```sql
ALTER TABLE prospects 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_referred_by ON prospects(referred_by);
```

## Step-by-Step Instructions

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the SQL above (both statements)
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)

## What This Does

- Adds `referred_by` column to `prospects` table
- Links to `users` table (who referred the prospect)
- Creates an index for faster filtering
- Sets `ON DELETE SET NULL` so if a user is deleted, referral info is preserved but set to null

## Verify It Worked

After running, you can verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prospects' 
AND column_name = 'referred_by';
```

You should see `referred_by` with type `uuid`.

