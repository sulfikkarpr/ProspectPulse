import { pool } from '../db/connection';
import { syncAllToSheets } from './google-sheets';

// Simple in-memory scheduler for scheduled sync
// In production, use a proper job queue like Bull, Agenda, or a cron service
export const startScheduledSync = () => {
  // Run sync every 6 hours
  const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

  const runSync = async () => {
    try {
      console.log('Starting scheduled Google Sheets sync...');
      
      // Get all users with refresh tokens (they can sync)
      const usersQuery = 'SELECT id FROM users WHERE refresh_token IS NOT NULL';
      const usersResult = await pool.query(usersQuery);

      if (usersResult.rows.length === 0) {
        console.log('No users with refresh tokens found for sync');
        return;
      }

      // Sync using the first admin/mentor user's credentials
      // In production, you might want to use a service account instead
      const adminQuery = `
        SELECT id FROM users 
        WHERE role IN ('admin', 'mentor') AND refresh_token IS NOT NULL 
        LIMIT 1
      `;
      const adminResult = await pool.query(adminQuery);

      if (adminResult.rows.length > 0) {
        const syncUserId = adminResult.rows[0].id;
        await syncAllToSheets(syncUserId);
        console.log('Scheduled sync completed successfully');
      } else {
        console.log('No admin/mentor user found for sync');
      }
    } catch (error) {
      console.error('Scheduled sync error:', error);
    }
  };

  // Run immediately on startup (optional)
  // runSync();

  // Schedule recurring sync
  setInterval(runSync, SYNC_INTERVAL_MS);
  console.log(`Scheduled sync job started (runs every 6 hours)`);
};

