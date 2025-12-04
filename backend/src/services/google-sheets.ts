import { google } from 'googleapis';
import { pool } from '../db/connection';
import { oauth2Client } from './google-oauth';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;

if (!GOOGLE_SHEETS_ID) {
  throw new Error('GOOGLE_SHEETS_ID environment variable is not set');
}

const getSheetsClient = async (userId: string) => {
  // Get user's refresh token
  const userQuery = 'SELECT refresh_token FROM users WHERE id = $1';
  const userResult = await pool.query(userQuery, [userId]);

  if (userResult.rows.length === 0 || !userResult.rows[0].refresh_token) {
    throw new Error('User not found or no refresh token available');
  }

  const refreshToken = userResult.rows[0].refresh_token;
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.sheets({ version: 'v4', auth: oauth2Client });
};

export const syncProspectsToSheets = async (userId: string): Promise<void> => {
  try {
    const sheets = await getSheetsClient(userId);

    // Get all prospects
    const prospectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.phone,
        p.email,
        p.age,
        p.city,
        p.profession,
        p.source,
        p.status,
        p.notes,
        u_mentor.name as assigned_mentor,
        u_creator.name as created_by_name,
        p.created_at,
        p.updated_at
      FROM prospects p
      LEFT JOIN users u_mentor ON p.assigned_mentor_id = u_mentor.id
      LEFT JOIN users u_creator ON p.created_by = u_creator.id
      ORDER BY p.created_at DESC
    `;

    const prospectsResult = await pool.query(prospectsQuery);
    const prospects = prospectsResult.rows;

    // Prepare data for sheets
    const values = prospects.map((p) => [
      p.id,
      p.name || '',
      p.phone || '',
      p.email || '',
      p.age || '',
      p.city || '',
      p.profession || '',
      p.source || '',
      p.status || '',
      p.assigned_mentor || '',
      p.created_by_name || '',
      p.notes || '',
      new Date(p.created_at).toISOString(),
      new Date(p.updated_at).toISOString(),
    ]);

    // Clear existing data and add headers
    const range = 'Prospects!A1:N1';
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'Age',
      'City',
      'Profession',
      'Source',
      'Status',
      'Assigned Mentor',
      'Created By',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Clear sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Prospects!A:Z',
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Add data if any
    if (values.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'Prospects!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    }

    // Update sync status
    await pool.query(
      `UPDATE sheets_sync_status 
       SET last_synced_at = NOW(), last_sync_row_count = $1, updated_at = NOW()
       WHERE sheet_name = 'prospects'`,
      [prospects.length]
    );
  } catch (error) {
    console.error('Error syncing prospects to sheets:', error);
    throw error;
  }
};

export const syncPreTalksToSheets = async (userId: string): Promise<void> => {
  try {
    const sheets = await getSheetsClient(userId);

    // Get all pre-talks
    const preTalksQuery = `
      SELECT 
        pt.id,
        pt.prospect_id,
        p.name as prospect_name,
        pt.mentor_id,
        u_mentor.name as mentor_name,
        pt.scheduled_at,
        pt.status,
        pt.meet_link,
        pt.notes,
        pt.created_at,
        pt.updated_at
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      LEFT JOIN users u_mentor ON pt.mentor_id = u_mentor.id
      ORDER BY pt.scheduled_at DESC
    `;

    const preTalksResult = await pool.query(preTalksQuery);
    const preTalks = preTalksResult.rows;

    // Prepare data for sheets
    const values = preTalks.map((pt) => [
      pt.id,
      pt.prospect_id,
      pt.prospect_name || '',
      pt.mentor_id,
      pt.mentor_name || '',
      new Date(pt.scheduled_at).toISOString(),
      pt.status || '',
      pt.meet_link || '',
      pt.notes || '',
      new Date(pt.created_at).toISOString(),
      new Date(pt.updated_at).toISOString(),
    ]);

    // Clear existing data and add headers
    const range = 'PreTalks!A1:K1';
    const headers = [
      'ID',
      'Prospect ID',
      'Prospect Name',
      'Mentor ID',
      'Mentor Name',
      'Scheduled At',
      'Status',
      'Meet Link',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Clear sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'PreTalks!A:Z',
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Add data if any
    if (values.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'PreTalks!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    }

    // Update sync status
    await pool.query(
      `UPDATE sheets_sync_status 
       SET last_synced_at = NOW(), last_sync_row_count = $1, updated_at = NOW()
       WHERE sheet_name = 'pretalks'`,
      [preTalks.length]
    );
  } catch (error) {
    console.error('Error syncing pre-talks to sheets:', error);
    throw error;
  }
};

export const syncActivityLogsToSheets = async (userId: string): Promise<void> => {
  try {
    const sheets = await getSheetsClient(userId);

    // Get all activity logs
    const logsQuery = `
      SELECT 
        al.id,
        al.user_id,
        u.name as user_name,
        al.prospect_id,
        p.name as prospect_name,
        al.action,
        al.meta,
        al.created_at
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN prospects p ON al.prospect_id = p.id
      ORDER BY al.created_at DESC
      LIMIT 10000
    `;

    const logsResult = await pool.query(logsQuery);
    const logs = logsResult.rows;

    // Prepare data for sheets
    const values = logs.map((log) => [
      log.id,
      log.user_id,
      log.user_name || '',
      log.prospect_id || '',
      log.prospect_name || '',
      log.action || '',
      JSON.stringify(log.meta || {}),
      new Date(log.created_at).toISOString(),
    ]);

    // Clear existing data and add headers
    const range = 'ActivityLogs!A1:H1';
    const headers = [
      'ID',
      'User ID',
      'User Name',
      'Prospect ID',
      'Prospect Name',
      'Action',
      'Meta',
      'Created At',
    ];

    // Clear sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'ActivityLogs!A:Z',
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    // Add data if any
    if (values.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: 'ActivityLogs!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    }

    // Update sync status
    await pool.query(
      `UPDATE sheets_sync_status 
       SET last_synced_at = NOW(), last_sync_row_count = $1, updated_at = NOW()
       WHERE sheet_name = 'activity_logs'`,
      [logs.length]
    );
  } catch (error) {
    console.error('Error syncing activity logs to sheets:', error);
    throw error;
  }
};

export const syncAllToSheets = async (userId: string): Promise<void> => {
  await Promise.all([
    syncProspectsToSheets(userId),
    syncPreTalksToSheets(userId),
    syncActivityLogsToSheets(userId),
  ]);
};

