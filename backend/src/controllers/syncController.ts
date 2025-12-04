import { Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { syncAllToSheets } from '../services/google-sheets';

export const syncSheets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    console.log('Starting manual Google Sheets sync...');
    await syncAllToSheets(req.userId);
    console.log('Manual sync completed successfully');

    res.json({
      success: true,
      message: 'Successfully synced all data to Google Sheets',
      synced_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    const errorMessage = error.message || 'Failed to sync to Google Sheets';
    next(new AppError(`Sync failed: ${errorMessage}`, 500));
  }
};

export const getSyncStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const query = `
      SELECT sheet_name, last_synced_at, last_sync_row_count, updated_at
      FROM sheets_sync_status
      ORDER BY sheet_name
    `;

    const result = await pool.query(query);

    res.json({
      sheets: result.rows,
      last_sync: result.rows.length > 0 
        ? result.rows.reduce((latest, sheet) => {
            if (!latest || !sheet.last_synced_at) return latest || sheet;
            return new Date(sheet.last_synced_at) > new Date(latest.last_synced_at) 
              ? sheet 
              : latest;
          }, null)?.last_synced_at
        : null,
    });
  } catch (error) {
    next(error);
  }
};
