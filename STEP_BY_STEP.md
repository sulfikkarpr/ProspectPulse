# 📝 ProspectPulse - Step-by-Step Setup Checklist

Follow these steps in order. Check off each step as you complete it.

---

## ✅ STEP 1: Create Backend Environment File

**Action:** Create the backend `.env` file

```bash
cd /home/sulfikkar/Desktop/ProspectPulse/backend
touch .env
```

**Then open `backend/.env` and add this template (we'll fill in values later):**

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-to-a-random-secret-key-at-least-32-characters-long

DATABASE_URL=will-fill-in-step-3

GOOGLE_CLIENT_ID=will-fill-in-step-4
GOOGLE_CLIENT_SECRET=will-fill-in-step-4
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

GOOGLE_SHEETS_ID=will-fill-in-step-5
```

**✅ Check this off when done**

---

## ✅ STEP 2: Create Frontend Environment File

**Action:** Create the frontend `.env` file

```bash
cd /home/sulfikkar/Desktop/ProspectPulse/frontend
touch .env
```

**Then open `frontend/.env` and add:**

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=will-fill-in-step-4
```

**✅ Check this off when done**

---

## ✅ STEP 3: Set Up Database (Choose ONE option)

### Option A: Supabase (Easiest - Recommended)

1. **Go to:** https://supabase.com
2. **Click:** "Start your project" or "Sign in"
3. **Create account** (if needed) - Free tier is fine
4. **Click:** "New Project"
5. **Fill in:**
   - Name: `prospectpulse` (or any name)
   - Database Password: **Write this down!** You'll need it
   - Region: Choose closest to you
   - Click "Create new project"
6. **Wait 2-3 minutes** for project to be created
7. **Go to:** Project Settings (gear icon) > Database
8. **Find:** "Connection string" section
9. **Copy** the connection string (looks like: `postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`)
10. **Paste** it into `backend/.env` as `DATABASE_URL`
11. **Go to:** SQL Editor (left sidebar)
12. **Click:** "New query"
13. **Open file:** `supabase/migrations/001_initial_schema.sql`
14. **Copy ALL the contents** of that file
15. **Paste** into SQL Editor
16. **Click:** "Run" (or press Ctrl+Enter)
17. **You should see:** "Success. No rows returned"

**✅ Check this off when done**

### Option B: Local PostgreSQL (If you prefer local)

```bash
cd /home/sulfikkar/Desktop/ProspectPulse
docker-compose up -d
```

Then update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prospectpulse
```

**✅ Check this off when done**

---

## ✅ STEP 4: Set Up Google OAuth

1. **Go to:** https://console.cloud.google.com
2. **Sign in** with your Google account
3. **Click:** Project dropdown (top left) > "New Project"
4. **Name:** `ProspectPulse` (or any name)
5. **Click:** "Create"
6. **Wait** for project to be created, then select it from dropdown

### Enable APIs:

7. **Go to:** "APIs & Services" > "Library" (left sidebar)
8. **Search:** "Google Calendar API"
9. **Click:** "Google Calendar API" > "Enable"
10. **Go back** to Library
11. **Search:** "Google Sheets API"
12. **Click:** "Google Sheets API" > "Enable"

### Create OAuth Credentials:

13. **Go to:** "APIs & Services" > "Credentials" (left sidebar)
14. **Click:** "Create Credentials" > "OAuth client ID"
15. **If prompted:** Configure OAuth consent screen first:
    - User Type: **External** (unless you have Google Workspace)
    - App name: `ProspectPulse`
    - User support email: Your email
    - Developer contact: Your email
    - Click "Save and Continue" through all steps
    - Click "Back to Dashboard"
16. **Now create OAuth client:**
    - Application type: **Web application**
    - Name: `ProspectPulse Web Client`
    - Authorized redirect URIs: Click "Add URI"
    - Add: `http://localhost:4000/api/auth/callback`
    - Click "Create"
17. **Copy the values:**
    - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
    - **Client Secret** (click "Show" to reveal)
18. **Update your `.env` files:**
    - Add Client ID to `backend/.env` as `GOOGLE_CLIENT_ID`
    - Add Client Secret to `backend/.env` as `GOOGLE_CLIENT_SECRET`
    - Add Client ID to `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

**✅ Check this off when done**

---

## ✅ STEP 5: Set Up Google Sheets

1. **Go to:** https://sheets.google.com
2. **Click:** "Blank" to create new spreadsheet
3. **Name it:** `ProspectPulse Data` (top left)
4. **Create 3 sheets:**
   - Sheet 1: Rename to `Prospects` (right-click tab > Rename)
   - Click "+" to add Sheet 2: Name it `PreTalks`
   - Click "+" to add Sheet 3: Name it `ActivityLogs`

### Add Headers to Prospects Sheet:

5. **Click on** `Prospects` sheet tab
6. **In Row 1, add these headers** (one per column):
   ```
   A1: ID
   B1: Name
   C1: Phone
   D1: Email
   E1: Age
   F1: City
   G1: Profession
   H1: Source
   I1: Status
   J1: Assigned Mentor
   K1: Created By
   L1: Created At
   M1: Updated At
   ```

### Add Headers to PreTalks Sheet:

7. **Click on** `PreTalks` sheet tab
8. **In Row 1, add these headers:**
   ```
   A1: ID
   B1: Prospect ID
   C1: Prospect Name
   D1: Mentor ID
   E1: Mentor Name
   F1: Scheduled At
   G1: Status
   H1: Meet Link
   I1: Notes
   J1: Created At
   K1: Updated At
   ```

### Add Headers to ActivityLogs Sheet:

9. **Click on** `ActivityLogs` sheet tab
10. **In Row 1, add these headers:**
    ```
    A1: ID
    B1: User ID
    C1: User Name
    D1: Prospect ID
    E1: Prospect Name
    F1: Action
    G1: Meta
    H1: Created At
    ```

### Get Sheet ID and Share:

11. **Look at the URL** in your browser:
    - It looks like: `https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit`
    - Copy the part between `/d/` and `/edit` (this is your Sheet ID)
12. **Add to `backend/.env`** as `GOOGLE_SHEETS_ID=1ABC123xyz...`
13. **Click "Share"** button (top right)
14. **Add your email** (the same Google account you used for OAuth)
15. **Give "Editor" permission**
16. **Click "Send"**

**✅ Check this off when done**

---

## ✅ STEP 6: Generate JWT Secret

**Action:** Generate a random secret for JWT

```bash
# Run this command to generate a random secret:
openssl rand -base64 32
```

**Copy the output** and paste it into `backend/.env` as `JWT_SECRET=`

**✅ Check this off when done**

---

## ✅ STEP 7: Verify All Environment Variables

**Check that your `backend/.env` has ALL these filled in:**

- ✅ `JWT_SECRET` - Random secret (from Step 6)
- ✅ `DATABASE_URL` - From Supabase or local (Step 3)
- ✅ `GOOGLE_CLIENT_ID` - From Google Cloud (Step 4)
- ✅ `GOOGLE_CLIENT_SECRET` - From Google Cloud (Step 4)
- ✅ `GOOGLE_SHEETS_ID` - From Google Sheets URL (Step 5)

**Check that your `frontend/.env` has:**

- ✅ `VITE_GOOGLE_CLIENT_ID` - From Google Cloud (Step 4)

**✅ Check this off when done**

---

## ✅ STEP 8: Start the Backend Server

**Open Terminal 1:**

```bash
cd /home/sulfikkar/Desktop/ProspectPulse/backend
npm run dev
```

**You should see:**
```
✅ Database connected
🚀 Server running on http://localhost:4000
```

**If you see errors:**
- Check your `DATABASE_URL` is correct
- Make sure database is running (Supabase project is active)
- Check all environment variables are set

**✅ Check this off when backend is running**

---

## ✅ STEP 9: Start the Frontend Server

**Open Terminal 2** (new terminal window):

```bash
cd /home/sulfikkar/Desktop/ProspectPulse/frontend
npm run dev
```

**You should see:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**✅ Check this off when frontend is running**

---

## ✅ STEP 10: Test the Application

1. **Open browser:** http://localhost:5173
2. **You should see:** Login page with "Sign in with Google" button
3. **Click:** "Sign in with Google"
4. **Authorize** the app (you may need to select your Google account)
5. **You should be redirected** back and logged in
6. **You should see:** Dashboard page

**✅ Check this off when you can log in**

---

## ✅ STEP 11: Create Your First Prospect

1. **Click:** "Prospects" in the navigation
2. **Click:** "Add Prospect" button
3. **Fill in the form:**
   - Name: `Test Prospect`
   - Phone: `1234567890`
   - Source: Select any option
   - (Other fields optional)
4. **Click:** "Create Prospect"
5. **You should see:** The prospect in the list

**✅ Check this off when prospect is created**

---

## ✅ STEP 12: Test Google Sheets Sync

1. **Go to:** Dashboard
2. **Click:** "Sync to Google Sheets" button
3. **Wait** a few seconds
4. **Go to:** Your Google Sheet
5. **Check:** `Prospects` sheet should have your test prospect data

**✅ Check this off when data appears in Google Sheets**

---

## 🎉 CONGRATULATIONS!

**You've successfully set up ProspectPulse!**

### What to do next:
- Create more prospects
- Schedule pre-talks (you'll need to create a mentor user first, or assign yourself as mentor)
- Explore the dashboard analytics
- Read the full documentation in `README.md`

### Need Help?
- Check `README.md` for full documentation
- Review `SETUP.md` for detailed setup
- See `GOOGLE_SHEETS_TEMPLATE.md` for sheet structure

---

**Happy prospecting! 🚀**

