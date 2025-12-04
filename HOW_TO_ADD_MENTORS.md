# 👥 How to Add Mentors to ProspectPulse

There are **3 ways** to add mentors. Choose the method that works best for you.

---

## Method 1: Using Supabase Dashboard (Easiest - Recommended)

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"Table Editor"** in the left sidebar

### Step 2: Find the Users Table
1. Click on **"users"** table
2. You'll see all users who have logged in

### Step 3: Update User Role
1. **Find the user** you want to make a mentor (by email or name)
2. **Click on the row** to edit it
3. **Find the "role" column**
4. **Change it from "member" to "mentor"** (or "admin" if you want admin access)
5. **Click "Save"** or press Enter

### Step 4: Verify
- The user's role should now be "mentor"
- They can now be selected when scheduling pre-talks
- They'll appear in the mentors list

---

## Method 2: Using SQL Query (Quick)

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run SQL Query

**To make a specific user a mentor (by email):**
```sql
UPDATE users 
SET role = 'mentor', updated_at = NOW()
WHERE email = 'user@example.com';
```

**To make a specific user a mentor (by name):**
```sql
UPDATE users 
SET role = 'mentor', updated_at = NOW()
WHERE name = 'User Name';
```

**To make yourself an admin (replace with your email):**
```sql
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'sulfidrupal@gmail.com';
```

**To see all users and their roles:**
```sql
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY name;
```

### Step 3: Click "Run"
- The query will execute
- User role will be updated immediately

---

## Method 3: Using API (For Admins Only)

If you're already an admin, you can use the API to update user roles.

### Step 1: Get User ID
First, get the list of users:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:4000/api/users
```

### Step 2: Update User Role
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "mentor"}' \
  http://localhost:4000/api/users/USER_ID/role
```

Replace:
- `YOUR_ADMIN_TOKEN` - Your JWT token (get from browser localStorage)
- `USER_ID` - The UUID of the user you want to update

---

## Quick Start: Make Yourself Admin

**Easiest way to get started:**

1. **Go to Supabase Dashboard**
2. **SQL Editor > New query**
3. **Run this:**
   ```sql
   UPDATE users 
   SET role = 'admin', updated_at = NOW()
   WHERE email = 'sulfidrupal@gmail.com';
   ```
4. **Log out and log back in** to refresh your token
5. **You're now an admin!** 🎉

---

## Understanding Roles

### Member (Default)
- Can create and manage their own prospects
- Can schedule pre-talks with mentors
- Can view their own data

### Mentor
- All member permissions
- Can be assigned to prospects
- Can be selected for pre-talks
- Can view prospects assigned to them

### Admin
- All mentor permissions
- Can view all users
- Can update user roles
- Can view all prospects (not just their own)
- Full system access

---

## Verify It Worked

### Check in Supabase:
```sql
SELECT name, email, role FROM users WHERE role IN ('admin', 'mentor');
```

### Check in App:
1. Log out and log back in (to refresh your token)
2. Go to "Schedule Pre-Talk" page
3. You should see mentors in the dropdown

---

## Troubleshooting

### "User not found"
- Make sure the user has logged in at least once (so they exist in the database)
- Check the email/name is spelled correctly

### "Role not updating"
- Make sure you're updating the correct user
- Refresh the page or log out/in to see changes

### "Can't see mentors in dropdown"
- Make sure the user's role is "mentor" or "admin"
- Make sure you've logged out and back in after updating the role
- Check browser console for errors

---

## Next Steps

After adding mentors:
1. ✅ Mentors can be selected when scheduling pre-talks
2. ✅ They'll receive calendar invites for pre-talks
3. ✅ They can view prospects assigned to them
4. ✅ They appear in the mentors list API

**That's it! You now know how to add mentors to ProspectPulse!** 🎉

