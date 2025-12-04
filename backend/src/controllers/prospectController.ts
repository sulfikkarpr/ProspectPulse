import { Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const createProspectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  age: z.number().int().positive().optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  assigned_mentor_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

const updateProspectSchema = createProspectSchema.partial();

export const createProspect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const validated = createProspectSchema.parse(req.body);

    const query = `
      INSERT INTO prospects (
        name, phone, email, age, city, profession, source,
        assigned_mentor_id, notes, created_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'new')
      RETURNING *
    `;

    const result = await pool.query(query, [
      validated.name,
      validated.phone || null,
      validated.email || null,
      validated.age || null,
      validated.city || null,
      validated.profession || null,
      validated.source,
      validated.assigned_mentor_id || null,
      validated.notes || null,
      req.userId,
    ]);

    const prospect = result.rows[0];

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, prospect_id, action, meta) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        prospect.id,
        'prospect_created',
        JSON.stringify({ prospect_name: prospect.name }),
      ]
    );

    res.status(201).json(prospect);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getProspects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { status, assigned_mentor, created_by, start_date, end_date } = req.query;

    let query = 'SELECT * FROM prospects WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Role-based filtering: members only see their own prospects, mentors/admins see all
    if (req.userRole === 'member') {
      paramCount++;
      query += ` AND created_by = $${paramCount}`;
      params.push(req.userId);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (assigned_mentor) {
      paramCount++;
      query += ` AND assigned_mentor_id = $${paramCount}`;
      params.push(assigned_mentor);
    }

    if (created_by && req.userRole !== 'member') {
      paramCount++;
      query += ` AND created_by = $${paramCount}`;
      params.push(created_by);
    }

    if (start_date) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getProspectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;

    const query = 'SELECT * FROM prospects WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return next(new AppError('Prospect not found', 404));
    }

    const prospect = result.rows[0];

    // Check permissions: members can only see their own prospects
    if (req.userRole === 'member' && prospect.created_by !== req.userId) {
      return next(new AppError('Forbidden', 403));
    }

    // Get activity logs for this prospect
    const logsQuery = `
      SELECT al.*, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.prospect_id = $1
      ORDER BY al.created_at DESC
    `;
    const logsResult = await pool.query(logsQuery, [id]);

    // Get pre-talks for this prospect
    const preTalksQuery = `
      SELECT pt.*, u.name as mentor_name
      FROM pre_talks pt
      LEFT JOIN users u ON pt.mentor_id = u.id
      WHERE pt.prospect_id = $1
      ORDER BY pt.scheduled_at DESC
    `;
    const preTalksResult = await pool.query(preTalksQuery, [id]);

    res.json({
      ...prospect,
      activity_logs: logsResult.rows,
      pre_talks: preTalksResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProspect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;
    const validated = updateProspectSchema.parse(req.body);

    // Check if prospect exists and user has permission
    const checkQuery = 'SELECT * FROM prospects WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return next(new AppError('Prospect not found', 404));
    }

    const prospect = checkResult.rows[0];

    // Check permissions
    if (req.userRole === 'member' && prospect.created_by !== req.userId) {
      return next(new AppError('Forbidden', 403));
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return res.json(prospect);
    }

    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE prospects SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, prospect_id, action, meta) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        id,
        'prospect_updated',
        JSON.stringify({ changes: validated }),
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

