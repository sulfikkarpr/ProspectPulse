# ProspectPulse

A modern, integrated web application designed to simplify and streamline network marketing operations for individuals and teams.

## ✨ Features

- **Prospect Management**: Record and track prospects with notes, contact info, and status tracking
- **Pre-Talk Scheduling**: Schedule mentor sessions with automatic Google Calendar and Google Meet integration
- **Session Documentation**: Capture notes, concerns, objections, and next steps
- **Google Sheets Sync**: Manual and automatic synchronization of all data to Google Sheets
- **Dashboard & Analytics**: Daily, weekly, and monthly activity reports with visual charts
- **Role-Based Access**: Admin, Mentor, and Member roles with appropriate permissions

## Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Auth**: Google OAuth 2.0 + JWT
- **Integrations**: Google Calendar API, Google Meet, Google Sheets API

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Google Cloud Project with OAuth credentials
- Google Cloud APIs enabled: Calendar API, Sheets API

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ProspectPulse
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

Create environment files:

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
DATABASE_URL=postgresql://user:pass@host:6543/dbname
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback
GOOGLE_SHEETS_ID=your-google-sheets-id
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Database Setup

#### Using Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Get your **connection pooler URL** (port 6543) from Project Settings > Database
3. Update `DATABASE_URL` in `backend/.env`
4. Run migrations in Supabase SQL Editor:
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run in Supabase SQL Editor

#### Using Local PostgreSQL

```bash
docker-compose up -d
psql -U postgres -d prospectpulse -f supabase/migrations/001_initial_schema.sql
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs: **Calendar API**, **Sheets API**
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:4000/api/auth/callback` (for local dev)
5. Copy **Client ID** and **Client Secret** to `backend/.env`

### 5. Google Sheets Setup

1. Create a new Google Sheet
2. Create three sheets: **"Prospects"**, **"PreTalks"**, **"ActivityLogs"**
3. Add headers to each sheet (see [GOOGLE_SHEETS_TEMPLATE.md](./GOOGLE_SHEETS_TEMPLATE.md))
4. Share the sheet with your Google account (the one used for OAuth)
5. Copy the **Sheet ID** from the URL to `GOOGLE_SHEETS_ID` in `backend/.env`

### 6. Run Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- **Backend:** http://localhost:4000
- **Frontend:** http://localhost:5173

Visit http://localhost:5173 to access the application.

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | Yes |
| `GOOGLE_SHEETS_ID` | Google Sheets spreadsheet ID | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Backend server port | No (default: 4000) |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |

## 📊 Google Sheets Structure

For detailed Google Sheets setup instructions, see [GOOGLE_SHEETS_TEMPLATE.md](./GOOGLE_SHEETS_TEMPLATE.md)

**Required Sheets:**
- **Prospects:** `ID`, `Name`, `Phone`, `Email`, `Age`, `City`, `Profession`, `Source`, `Status`, `Assigned Mentor`, `Created By`, `Notes`, `Created At`, `Updated At`
- **PreTalks:** `ID`, `Prospect ID`, `Prospect Name`, `Mentor ID`, `Mentor Name`, `Scheduled At`, `Status`, `Meet Link`, `Notes`, `Created At`, `Updated At`
- **ActivityLogs:** `ID`, `User ID`, `User Name`, `Prospect ID`, `Prospect Name`, `Action`, `Meta`, `Created At`

## Project Structure

```
prospectpulse/
├── frontend/          # React + Vite frontend
├── backend/           # Express backend
├── supabase/          # Database migrations
├── docker-compose.yml # Local PostgreSQL setup
└── README.md
```

## API Documentation

### Authentication
- `GET /api/auth/url` - Get Google OAuth URL
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user

### Prospects
- `POST /api/prospects` - Create prospect
- `GET /api/prospects` - List prospects (with filters)
- `GET /api/prospects/:id` - Get prospect details
- `PUT /api/prospects/:id` - Update prospect

### Pre-Talks
- `POST /api/pretalks` - Schedule pre-talk
- `GET /api/pretalks` - List pre-talks
- `GET /api/pretalks/:id` - Get pre-talk details
- `PUT /api/pretalks/:id` - Update pre-talk
- `POST /api/pretalks/:id/complete` - Mark as completed

### Sync
- `POST /api/sync/sheets` - Manual Google Sheets sync

### Dashboard
- `GET /api/dashboard/daily` - Daily statistics
- `GET /api/dashboard/weekly` - Weekly statistics
- `GET /api/dashboard/monthly` - Monthly statistics

## 📦 Deployment

For detailed deployment instructions, see [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)

**Quick Summary:**
- **Frontend:** Deploy to Vercel (free tier available)
- **Backend:** Deploy to Render or Railway (free tier available)
- **Database:** Use Supabase (already set up)

**Key Steps:**
1. Push code to GitHub
2. Connect repository to Vercel (frontend) and Render (backend)
3. Set environment variables in both platforms
4. Update OAuth redirect URI in Google Cloud Console
5. Test deployment

## Troubleshooting

### OAuth Issues
- Ensure redirect URI matches exactly in Google Cloud Console
- Check that Calendar and Sheets APIs are enabled
- Verify scopes include: `calendar`, `spreadsheets`

### Database Connection
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Check Supabase connection pooling settings
- Ensure database is accessible from your IP (Supabase allows all by default)

### Google Sheets Sync
- Verify sheet is shared with the correct Google account
- Check sheet ID is correct (from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`)
- Ensure Sheets API is enabled in Google Cloud Console

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

