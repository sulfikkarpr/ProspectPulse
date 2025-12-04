# 🚀 ProspectPulse Quick Start Guide

## ✅ Step 1: Dependencies Installed
All dependencies have been installed. You're ready to proceed!

## 📋 Step 2: Set Up Environment Variables

### Backend Environment (.env)

Create `backend/.env` file:

```bash
cd backend
touch .env
```

Add these variables (replace with your actual values):

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Database - Get from Supabase or use local PostgreSQL
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

# Google Sheets - Get from your Google Sheet URL
GOOGLE_SHEETS_ID=your-google-sheets-spreadsheet-id
```

### Frontend Environment (.env)

Create `frontend/.env` file:

```bash
cd frontend
touch .env
```

Add these variables:

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🗄️ Step 3: Set Up Database

### Option A: Supabase (Recommended - Free Tier Available)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account
   - Create a new project

2. **Get Database URL**
   - Go to Project Settings > Database
   - Copy the connection string
   - Update `DATABASE_URL` in `backend/.env`

3. **Run Migrations**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and click "Run"
   - ✅ Database tables created!

### Option B: Local PostgreSQL

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run migrations
psql -U postgres -d prospectpulse -f supabase/migrations/001_initial_schema.sql
```

## 🔐 Step 4: Set Up Google OAuth

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - ✅ Google Calendar API
     - ✅ Google Sheets API

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: ProspectPulse
   - Authorized redirect URIs:
     - `http://localhost:4000/api/auth/callback`
   - Click "Create"
   - Copy **Client ID** and **Client Secret**
   - Add to `backend/.env` and `frontend/.env`

## 📊 Step 5: Set Up Google Sheets

1. **Create Google Sheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "ProspectPulse Data"

2. **Create Three Sheets**
   - Rename default sheet to: `Prospects`
   - Add new sheet: `PreTalks`
   - Add new sheet: `ActivityLogs`

3. **Add Headers** (Row 1 in each sheet)

   **Prospects Sheet:**
   ```
   ID | Name | Phone | Email | Age | City | Profession | Source | Status | Assigned Mentor | Created By | Created At | Updated At
   ```

   **PreTalks Sheet:**
   ```
   ID | Prospect ID | Prospect Name | Mentor ID | Mentor Name | Scheduled At | Status | Meet Link | Notes | Created At | Updated At
   ```

   **ActivityLogs Sheet:**
   ```
   ID | User ID | User Name | Prospect ID | Prospect Name | Action | Meta | Created At
   ```

4. **Get Sheet ID**
   - Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the `{SHEET_ID}` part
   - Add to `GOOGLE_SHEETS_ID` in `backend/.env`

5. **Share Sheet**
   - Click "Share" button
   - Share with your Google account (the one you'll use for OAuth)
   - Give "Editor" permissions

## ▶️ Step 6: Start the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:4000
✅ Database connected
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎯 Step 7: Test the Application

1. **Open Browser**
   - Go to http://localhost:5173
   - You should see the login page

2. **Login with Google**
   - Click "Sign in with Google"
   - Authorize the application
   - You'll be redirected back and logged in

3. **Create Your First Prospect**
   - Go to "Prospects" page
   - Click "Add Prospect"
   - Fill in the form and submit

4. **Schedule a Pre-Talk**
   - Go to "Schedule Pre-Talk"
   - Select a prospect and mentor
   - Pick a date/time
   - Submit (this will create a Google Calendar event with Meet link!)

5. **View Dashboard**
   - Check the dashboard for activity stats
   - Click "Sync to Google Sheets" to sync data

## 🐛 Troubleshooting

### "Database connection error"
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify database is running (Supabase or Docker)
- ✅ Check network/firewall settings

### "OAuth callback error"
- ✅ Verify redirect URI matches exactly: `http://localhost:4000/api/auth/callback`
- ✅ Check Google Client ID and Secret are correct
- ✅ Ensure Calendar and Sheets APIs are enabled

### "Google Sheets sync fails"
- ✅ Verify sheet is shared with your Google account
- ✅ Check sheet ID is correct
- ✅ Ensure Sheets API is enabled in Google Cloud

### "Port already in use"
- ✅ Change `PORT` in `backend/.env` to another port (e.g., 4001)
- ✅ Update `VITE_API_URL` in `frontend/.env` accordingly

## 📚 Next Steps

- ✅ Test all features (prospects, pre-talks, dashboard)
- ✅ Create more test data
- ✅ Review the dashboard analytics
- ✅ Set up production deployment (see README.md)

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `SETUP.md` for step-by-step setup
- See `GOOGLE_SHEETS_TEMPLATE.md` for sheet structure

---

**You're all set! Start building your network marketing pipeline with ProspectPulse! 🎉**

