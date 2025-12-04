# 🔧 Fix: "The caller does not have permission" Error

## Problem
When syncing to Google Sheets, you get: **"The caller does not have permission"**

This means your Google account doesn't have access to the Google Sheet.

## Solution: Share the Sheet with Your Google Account

### Step 1: Open Your Google Sheet
1. Go to: **https://sheets.google.com**
2. **Open the sheet** you're using for ProspectPulse
   - Sheet ID should match `GOOGLE_SHEETS_ID` in your `backend/.env`

### Step 2: Share the Sheet
1. **Click the "Share" button** (top right corner, blue button)
2. **In the "Add people and groups" field**, enter your Google account email:
   - `sulfidrupal@gmail.com` (the account you used for OAuth)
3. **Set permission to "Editor"** (not just "Viewer")
4. **Uncheck "Notify people"** (optional, to avoid email)
5. **Click "Share"**

### Step 3: Verify Sharing
1. Make sure the sheet shows your email in the "People with access" list
2. Your permission should be **"Editor"** (not "Viewer")

### Step 4: Try Syncing Again
1. Go back to ProspectPulse dashboard
2. Click **"Sync to Google Sheets"** again
3. It should work now! ✅

## Alternative: Check Which Account is Being Used

The sync uses the Google account that logged in. Make sure:

1. **You logged in with the same Google account** that you want to use for sheets
2. **That account has access to the sheet**

## Quick Checklist

- [ ] Google Sheet is open in your browser
- [ ] Clicked "Share" button
- [ ] Added `sulfidrupal@gmail.com` (or your OAuth email)
- [ ] Set permission to **"Editor"**
- [ ] Clicked "Share"
- [ ] Verified your email appears in "People with access"
- [ ] Tried syncing again

## Still Not Working?

### Check 1: Verify Sheet ID
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Copy the `{SHEET_ID}` part
4. Check `backend/.env` - `GOOGLE_SHEETS_ID` should match exactly

### Check 2: Verify OAuth Scopes
Make sure when you logged in, you granted permission for:
- ✅ Google Sheets API
- ✅ Google Calendar API

If not, log out and log back in to grant permissions.

### Check 3: Check Sheet Name
Make sure your sheet has these exact sheet names (case-sensitive):
- `Prospects`
- `PreTalks`
- `ActivityLogs`

### Check 4: Try Re-authenticating
1. Log out of ProspectPulse
2. Log back in with Google
3. Make sure you grant all permissions
4. Try syncing again

## Common Issues

### Issue: "Sheet not found"
- **Cause:** Wrong Sheet ID in `.env`
- **Fix:** Update `GOOGLE_SHEETS_ID` with correct ID from sheet URL

### Issue: "Permission denied"
- **Cause:** Sheet not shared with your account
- **Fix:** Share sheet with your Google account (Editor permission)

### Issue: "API not enabled"
- **Cause:** Google Sheets API not enabled in Google Cloud Console
- **Fix:** Enable Google Sheets API in your Google Cloud project

## Step-by-Step: Share Sheet

```
Google Sheets
│
├── Open your ProspectPulse sheet
│
├── Click "Share" button (top right)
│
├── Add email: sulfidrupal@gmail.com
│
├── Set permission: Editor
│
├── Click "Share"
│
└── ✅ Done! Try syncing again
```

## That's It!

Once you share the sheet with your Google account, the sync should work immediately. The most common issue is forgetting to share the sheet after creating it.

