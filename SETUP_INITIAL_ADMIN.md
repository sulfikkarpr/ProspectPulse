# 🔑 Setup Initial Admin User

## Quick Setup

### Step 1: Run SQL Migration

Go to your **Supabase SQL Editor** and run:

```sql
-- Set slfkkrsulfi@gmail.com as admin and approved
UPDATE users 
SET role = 'admin', is_approved = true, updated_at = NOW()
WHERE email = 'slfkkrsulfi@gmail.com';
```

### Step 2: Verify

Check that the user was updated:

```sql
SELECT id, name, email, role, is_approved, created_at 
FROM users 
WHERE email = 'slfkkrsulfi@gmail.com';
```

**Expected Result:**
- `role` = `'admin'`
- `is_approved` = `true`

### Step 3: Sign In

1. Go to your login page
2. Sign in with `slfkkrsulfi@gmail.com`
3. ✅ You should have full admin access immediately

---

## For Approved Members (Admin Key Access)

### How It Works

**Approved members** (not just admins) can now access admin features by entering the admin key:

1. **Sign in** as an approved member
2. **Click** "🔓 Unlock Admin Features" button (in navigation)
3. **Enter admin key:** `team-leisve-admin`
4. ✅ **Admin features unlocked!**

### What Approved Members Can Do

After entering the admin key, approved members can:
- ✅ View pending users (`/admin/users`)
- ✅ Approve new users
- ✅ Access all admin features

### Requirements

- User must be **approved** (`is_approved = true`)
- User must enter correct admin key: `team-leisve-admin`
- Admin key verification is stored in JWT token

---

## SQL Migration File

The migration file is located at:
```
supabase/migrations/005_set_initial_admin.sql
```

You can run it directly in Supabase SQL Editor.

---

## Troubleshooting

### Issue: User not found

**If the user doesn't exist yet:**
1. The user will be created when they first sign up
2. If they're the first user, they'll automatically be admin
3. Otherwise, run the SQL after they sign up

### Issue: User exists but not admin

**Solution:**
```sql
UPDATE users 
SET role = 'admin', is_approved = true 
WHERE email = 'slfkkrsulfi@gmail.com';
```

### Issue: Approved member can't access admin panel

**Check:**
1. Is user approved? (`is_approved = true`)
2. Did they enter the correct admin key? (`team-leisve-admin`)
3. Is the admin key verified in their token?

**Verify:**
```sql
SELECT id, name, email, role, is_approved 
FROM users 
WHERE email = 'your-email@example.com';
```

---

## Security Notes

1. **Admin Key:** `team-leisve-admin`
   - Keep this secure
   - Only share with trusted approved members
   - Consider changing it in production

2. **Approved Members:**
   - Must be approved first (`is_approved = true`)
   - Then can use admin key to unlock features
   - Admin key verification is per-session (stored in JWT)

3. **Admin Role vs Admin Key:**
   - **Admin role:** Permanent admin access (no key needed)
   - **Admin key:** Temporary admin access for approved members

---

**Initial admin setup complete!** 🎉

