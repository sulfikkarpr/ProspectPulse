# 🎯 First User Auto-Admin Setup

## Problem

When the first user signs up, they see "Pending Approval" but there's no admin to approve them. This creates a chicken-and-egg problem.

## Solution

**The first user is automatically:**
- ✅ Set as **Admin** role
- ✅ Auto-approved (`is_approved = true`)
- ✅ Can immediately access the system
- ✅ Can approve other users

**Subsequent users:**
- Set as **Member** role
- Need admin approval
- See "Pending Approval" page

## How It Works

### Backend Logic

When a new user signs up:

1. **Check if any users exist**
   ```sql
   SELECT COUNT(*) FROM users
   ```

2. **If count = 0 (first user):**
   - Role: `admin`
   - Approved: `true`
   - Can access immediately

3. **If count > 0 (subsequent users):**
   - Role: `member`
   - Approved: `false`
   - Needs admin approval

### Code Location

**File:** `backend/src/controllers/authController.ts`

```typescript
// Check if this is the first user
const userCountQuery = 'SELECT COUNT(*) as count FROM users';
const userCountResult = await pool.query(userCountQuery);
const userCount = parseInt(userCountResult.rows[0].count, 10);
const isFirstUser = userCount === 0;

// First user gets admin role and auto-approved
const role = isFirstUser ? 'admin' : 'member';
const isApproved = isFirstUser ? true : false;
```

## Setup Instructions

### For New Installation

1. **First user signs up:**
   - Go to login page
   - Click "Sign in with Google"
   - Complete OAuth flow
   - ✅ Automatically becomes admin
   - ✅ Can access dashboard immediately

2. **First user can now:**
   - Access all features
   - Approve other users
   - Manage the system

### For Existing Installation

If you already have users but no admin:

**Option 1: Make existing user admin (Recommended)**

Run this SQL in Supabase SQL Editor:

```sql
-- Make the first user admin and approved
UPDATE users 
SET role = 'admin', is_approved = true 
WHERE id = (
  SELECT id FROM users ORDER BY created_at ASC LIMIT 1
);
```

**Option 2: Delete all users and start fresh**

⚠️ **Warning:** This deletes all data!

```sql
-- Delete all users (cascade will delete related data)
DELETE FROM users;
```

Then the next user to sign up will be the first user and become admin.

## Verification

### Check First User Status

```sql
-- Check user roles and approval status
SELECT id, name, email, role, is_approved, created_at 
FROM users 
ORDER BY created_at ASC;
```

### Expected Result

```
First user:  role = 'admin', is_approved = true
Other users: role = 'member', is_approved = false (until approved)
```

## Security Notes

1. **First User is Admin:**
   - This is intentional for initial setup
   - First user should be a trusted person
   - They can approve other admins later

2. **Subsequent Users:**
   - Always need approval
   - Cannot access until approved
   - Admin must approve them

3. **Admin Key:**
   - First admin still needs to enter admin key
   - Admin key: `team-leisve-admin`
   - This unlocks admin features

## Troubleshooting

### Issue: First user still shows "Pending Approval"

**Solution:**
1. Check database:
   ```sql
   SELECT id, name, role, is_approved FROM users ORDER BY created_at;
   ```
2. If first user is not admin/approved:
   ```sql
   UPDATE users 
   SET role = 'admin', is_approved = true 
   WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
   ```

### Issue: Multiple users, none are admin

**Solution:**
Make the first user admin:
```sql
UPDATE users 
SET role = 'admin', is_approved = true 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
```

### Issue: Want to change first user

**Solution:**
1. Delete the current first user (or change their role)
2. Delete all users to reset
3. Next signup will be first user

---

**First user is now automatically set as admin!** 🎉

