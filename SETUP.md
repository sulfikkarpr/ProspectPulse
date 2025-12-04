# ProspectPulse Setup Guide

This guide will help you set up ProspectPulse from scratch.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Google Cloud Project with OAuth credentials
- Google Cloud APIs enabled: Calendar API, Sheets API

## Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

## Step 2: Database Setup

### Option A: Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > Database
3. Copy the connection string (format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)
4. Update `DATABASE_URL` in `backend/.env`

### Option B: Using Local PostgreSQL

1. Start PostgreSQL using Docker:
   ```bash
   docker-compose up -d
   ```
2. Update `DATABASE_URL` in `backend/.env` to:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prospectpulse
   ```

### Run Migrations

1. **If using Supabase:**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run in SQL Editor
   - Optionally run `002_seed_admin.sql` if needed

2. **If using local PostgreSQL:**
   ```bash
   psql -U postgres -d prospectpulse -f supabase/migrations/001_initial_schema.sql
   ```

## Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Go to "APIs & Services" > "Library"
   - Enable "Google Calendar API"
   - Enable "Google Sheets API"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: `http://localhost:4000/api/auth/callback`
     - Production: `https://your-backend-domain.com/api/auth/callback`
5. Copy Client ID and Client Secret

## Step 4: Google Sheets Setup

1. Create a new Google Sheet
2. Create three sheets with these exact names:
   - `Prospects`
   - `PreTalks`
   - `ActivityLogs`
3. Add headers to each sheet (see README.md for structure)
4. Share the sheet with your Google account (the one used for OAuth)
5. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Copy the `{SHEET_ID}` part

## Step 5: Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

DATABASE_URL=postgresql://user:pass@host:5432/dbname

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

GOOGLE_SHEETS_ID=your-google-sheets-spreadsheet-id
```

### Frontend (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 6: Run Development Servers

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Or use the root script:
```bash
npm run dev
```

## Step 7: Access the Application

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- For Supabase: Ensure connection pooling is configured correctly

### OAuth Issues
- Verify redirect URI matches exactly in Google Cloud Console
- Check that Calendar and Sheets APIs are enabled
- Ensure scopes include: `calendar`, `spreadsheets`

### Google Sheets Sync Issues
- Verify sheet is shared with your Google account
- Check sheet ID is correct
- Ensure Sheets API is enabled

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update `VITE_API_URL` in `frontend/.env` accordingly

## Next Steps

1. Log in with Google OAuth
2. Create your first prospect
3. Schedule a pre-talk
4. Sync data to Google Sheets
5. View dashboard analytics

## Production Deployment

See README.md for deployment instructions to Vercel (frontend) and Render/Railway (backend).

