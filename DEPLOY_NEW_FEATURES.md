# 🚀 Deploy New Features - Step by Step

## ✅ What Needs to Be Deployed

1. **Database Migration** - Add `referred_by` column
2. **Backend (Render)** - New API endpoints (delete user, search, filters, referral)
3. **Frontend (Vercel)** - New UI features (mobile-responsive, search, filters, delete)

---

## Step 1: Run Database Migration ⚠️ CRITICAL

**Before deploying, you MUST run this migration in Supabase:**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_referred_by ON prospects(referred_by);
```

4. Click **Run**
5. ✅ Verify it worked - you should see "Success"

**If you skip this step, the referral tracking will NOT work!**

---

## Step 2: Push Code to GitHub

```bash
cd /home/sulfikkar/Desktop/ProspectPulse
git push origin main
```

---

## Step 3: Deploy Backend to Render

### Option A: Auto-Deploy (if enabled)
- Render will automatically detect the push and start building
- Go to Render Dashboard → Your Backend Service
- Wait for build to complete (usually 2-5 minutes)

### Option B: Manual Deploy
1. Go to **Render Dashboard**
2. Click on your **Backend Service**
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for build to complete

### ✅ Verify Backend Deployment
- Check Render logs for: `Server running on port...`
- Test API: `https://your-backend.onrender.com/api/health` (should return OK)

---

## Step 4: Deploy Frontend to Vercel

### Option A: Auto-Deploy (if enabled)
- Vercel will automatically detect the push and start building
- Go to Vercel Dashboard → Your Project
- Wait for build to complete (usually 1-3 minutes)

### Option B: Manual Deploy
1. Go to **Vercel Dashboard**
2. Click on your **Project**
3. Click **Deployments** tab
4. Click **Redeploy** on latest deployment
5. Wait for build to complete

### ✅ Verify Frontend Deployment
- Check Vercel logs for build success
- Visit your Vercel URL and test the app

---

## Step 5: Test New Features

### ✅ Test Checklist:

1. **Mobile Responsive**
   - Open app on smartphone
   - Check navigation menu (hamburger icon)
   - Verify all pages look good on mobile

2. **Search Functionality**
   - Go to Prospects page
   - Type in search bar (name, email, phone, city)
   - Verify results filter correctly

3. **Filters**
   - Test Status filter
   - Test "Created By" filter (select a user like "Alen")
   - Test "Referred By" filter
   - Click "Clear Filters"

4. **Referral Tracking**
   - Create a new prospect
   - Select "Referred By" dropdown (should show all users)
   - Save prospect
   - View prospect detail - should show "Referred By: [Name]"
   - Check Prospects list - should show referral info

5. **Delete User (Admin Only)**
   - Go to **User Approval** page (must be admin with key verified)
   - Click **"Show All Users"** button
   - Find a user (not yourself)
   - Click **Delete** button
   - Confirm deletion in modal
   - User should be removed

6. **Users List**
   - Go to **User Approval** page
   - Click **"Show All Users"** button (top right)
   - Should see all users (approved and pending)
   - Each user should have Delete button

---

## 🔍 Troubleshooting

### Issue: Delete button not showing
**Solution:**
- Make sure you're admin AND have verified admin key
- Click "Show All Users" button (not just pending)
- Check browser console for errors

### Issue: Referral tracking not working
**Solution:**
- Did you run the migration? (Step 1)
- Check Supabase: `SELECT column_name FROM information_schema.columns WHERE table_name = 'prospects' AND column_name = 'referred_by';`
- Should return `referred_by`

### Issue: Search not working
**Solution:**
- Check backend is deployed (Step 3)
- Check browser console for API errors
- Verify backend logs in Render

### Issue: Filters not working
**Solution:**
- Clear browser cache
- Check localStorage: `localStorage.getItem('prospectFilters')`
- Try clearing filters and re-applying

### Issue: Users list empty
**Solution:**
- Make sure you clicked "Show All Users" button
- Check you have admin key verified
- Check backend `/api/users` endpoint is working

---

## 📝 Quick Commands

```bash
# Push to GitHub
git push origin main

# Check backend logs (if you have Render CLI)
render logs

# Check if migration ran (in Supabase SQL Editor)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prospects' 
AND column_name = 'referred_by';
```

---

## ✅ Deployment Complete When:

- [ ] Migration ran successfully in Supabase
- [ ] Backend deployed to Render (build successful)
- [ ] Frontend deployed to Vercel (build successful)
- [ ] Can see "Show All Users" button in User Approval page
- [ ] Can see Delete button for users
- [ ] Can search prospects
- [ ] Can filter by user/referral
- [ ] Can see referral info in prospect details
- [ ] Mobile menu works on smartphone

---

## 🆘 Still Having Issues?

1. **Check Render logs** - Look for errors during build
2. **Check Vercel logs** - Look for build errors
3. **Check browser console** - Look for JavaScript errors
4. **Check Network tab** - Look for failed API calls
5. **Verify environment variables** - Make sure all are set correctly

---

**Need help? Check the logs first, then share the error message!**

