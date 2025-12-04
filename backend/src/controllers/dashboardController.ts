import { Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getDailyStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let prospectsQuery = `
      SELECT COUNT(*) as count, status
      FROM prospects
      WHERE created_at >= $1 AND created_at < $2
    `;
    let params: any[] = [today, tomorrow];

    if (req.userRole === 'member') {
      prospectsQuery += ' AND created_by = $3';
      params.push(req.userId);
    }

    prospectsQuery += ' GROUP BY status';

    const prospectsResult = await pool.query(prospectsQuery, params);

    let preTalksQuery = `
      SELECT COUNT(*) as count, pt.status
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      WHERE pt.scheduled_at >= $1 AND pt.scheduled_at < $2
    `;

    if (req.userRole === 'member') {
      preTalksQuery += ' AND p.created_by = $3';
    }

    preTalksQuery += ' GROUP BY pt.status';

    const preTalksResult = await pool.query(preTalksQuery, params);

    res.json({
      date: today.toISOString().split('T')[0],
      prospects: prospectsResult.rows,
      pre_talks: preTalksResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    let prospectsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM prospects
      WHERE created_at >= $1 AND created_at < $2
    `;
    let params: any[] = [weekStart, weekEnd];

    if (req.userRole === 'member') {
      prospectsQuery += ' AND created_by = $3';
      params.push(req.userId);
    }

    prospectsQuery += ' GROUP BY DATE(created_at) ORDER BY date';

    const prospectsResult = await pool.query(prospectsQuery, params);

    let preTalksQuery = `
      SELECT 
        DATE(pt.scheduled_at) as date,
        COUNT(*) as count
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      WHERE pt.scheduled_at >= $1 AND pt.scheduled_at < $2
    `;

    if (req.userRole === 'member') {
      preTalksQuery += ' AND p.created_by = $3';
    }

    preTalksQuery += ' GROUP BY DATE(pt.scheduled_at) ORDER BY date';

    const preTalksResult = await pool.query(preTalksQuery, params);

    res.json({
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      prospects_by_day: prospectsResult.rows,
      pre_talks_by_day: preTalksResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    let totalProspectsQuery = `
      SELECT COUNT(*) as total
      FROM prospects
      WHERE created_at >= $1 AND created_at < $2
    `;
    let params: any[] = [monthStart, monthEnd];

    if (req.userRole === 'member') {
      totalProspectsQuery += ' AND created_by = $3';
      params.push(req.userId);
    }

    const totalProspectsResult = await pool.query(totalProspectsQuery, params);

    let statusBreakdownQuery = `
      SELECT status, COUNT(*) as count
      FROM prospects
      WHERE created_at >= $1 AND created_at < $2
    `;

    if (req.userRole === 'member') {
      statusBreakdownQuery += ' AND created_by = $3';
    }

    statusBreakdownQuery += ' GROUP BY status';

    const statusBreakdownResult = await pool.query(statusBreakdownQuery, params);

    let preTalksQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN pt.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN pt.status = 'scheduled' THEN 1 END) as scheduled
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      WHERE pt.scheduled_at >= $1 AND pt.scheduled_at < $2
    `;

    if (req.userRole === 'member') {
      preTalksQuery += ' AND p.created_by = $3';
    }

    const preTalksResult = await pool.query(preTalksQuery, params);

    res.json({
      month: today.toISOString().slice(0, 7), // YYYY-MM
      total_prospects: parseInt(totalProspectsResult.rows[0]?.total || '0'),
      status_breakdown: statusBreakdownResult.rows,
      pre_talks: preTalksResult.rows[0] || { total: 0, completed: 0, scheduled: 0 },
    });
  } catch (error) {
    next(error);
  }
};

