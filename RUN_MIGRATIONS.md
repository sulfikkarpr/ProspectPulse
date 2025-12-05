# 📋 Run Migrations in Order

## ⚠️ Important: Run Migrations in Order!

You must run the migrations in the correct order. The error you got means you need to run migration `004` first.

---

## Step 1: Run Migration 004 (Add is_approved column)

**Go to Supabase SQL Editor** and run this:

```sql
-- Add user approval status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add admin key verification status (optional, for tracking)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_key_verified BOOLEAN DEFAULT false;

-- Update existing users to be approved (so current users don't get blocked)
UPDATE users SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

-- Create index for approval status
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
```

**Wait for this to complete** (usually takes 1-2 seconds)

---

## Step 2: Run Migration 005 (Set Initial Admin)

**After Step 1 completes**, run this:

```sql
-- Set slfkkrsulfi@gmail.com as admin and approved
UPDATE users 
SET role = 'admin', is_approved = true, updated_at = NOW()
WHERE email = 'slfkkrsulfi@gmail.com';

-- Verify the update
SELECT id, name, email, role, is_approved, created_at 
FROM users 
WHERE email = 'slfkkrsulfi@gmail.com';
```

---

## Quick Copy-Paste (All at Once)

If you want to run both migrations together:

```sql
-- ============================================
-- MIGRATION 004: Add is_approved column
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_key_verified BOOLEAN DEFAULT false;

UPDATE users SET is_approved = true WHERE is_approved IS NULL OR is_approved = false;

CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);

-- ============================================
-- MIGRATION 005: Set Initial Admin
-- ============================================
UPDATE users 
SET role = 'admin', is_approved = true, updated_at = NOW()
WHERE email = 'slfkkrsulfi@gmail.com';

-- Verify
SELECT id, name, email, role, is_approved, created_at 
FROM users 
WHERE email = 'slfkkrsulfi@gmail.com';
```

---

## Verification

After running both migrations, verify:

```sql
-- Check all users
SELECT id, name, email, role, is_approved, created_at 
FROM users 
ORDER BY created_at;
```

**Expected:**
- All existing users: `is_approved = true`
- `slfkkrsulfi@gmail.com`: `role = 'admin'`, `is_approved = true`

---

## Time Needed

- **Migration 004:** ~1-2 seconds
- **Migration 005:** ~1 second
- **Total:** ~2-3 seconds

You don't need to wait long - just make sure migration 004 completes before running 005.

---

## Troubleshooting

### Error: "column is_approved does not exist"
**Solution:** Run migration 004 first (see Step 1 above)

### Error: "relation users does not exist"
**Solution:** Run the initial schema migration first:
```sql
-- Run: supabase/migrations/001_initial_schema.sql
```

### Error: "duplicate key value"
**Solution:** The user might already exist. Check:
```sql
SELECT * FROM users WHERE email = 'slfkkrsulfi@gmail.com';
```

---

**Run migrations in order and you're good to go!** ✅

