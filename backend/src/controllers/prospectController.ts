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
  referred_by: z.string().uuid().optional().nullable(),
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
        assigned_mentor_id, referred_by, notes, created_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'new')
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
      validated.referred_by || null,
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

    const { status, assigned_mentor, created_by, referred_by, search, start_date, end_date } = req.query;

    let query = `
      SELECT 
        p.*,
        u_creator.name as created_by_name,
        u_mentor.name as assigned_mentor_name,
        u_referrer.name as referred_by_name
      FROM prospects p
      LEFT JOIN users u_creator ON p.created_by = u_creator.id
      LEFT JOIN users u_mentor ON p.assigned_mentor_id = u_mentor.id
      LEFT JOIN users u_referrer ON p.referred_by = u_referrer.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Organization-wide visibility: all users see all prospects

    // Search functionality (name, email, phone, city)
    if (search && typeof search === 'string' && search.trim()) {
      paramCount++;
      query += ` AND (
        p.name ILIKE $${paramCount} OR 
        p.email ILIKE $${paramCount} OR 
        p.phone ILIKE $${paramCount} OR 
        p.city ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
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

    if (created_by) {
      paramCount++;
      query += ` AND p.created_by = $${paramCount}`;
      params.push(created_by);
    }

    if (referred_by) {
      paramCount++;
      query += ` AND p.referred_by = $${paramCount}`;
      params.push(referred_by);
    }

    if (start_date) {
      paramCount++;
      query += ` AND p.created_at >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND p.created_at <= $${paramCount}`;
      params.push(end_date);
    }

    query += ' ORDER BY p.created_at DESC';

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

    const query = `
      SELECT 
        p.*,
        u_creator.name as created_by_name,
        u_referrer.name as referred_by_name
      FROM prospects p
      LEFT JOIN users u_creator ON p.created_by = u_creator.id
      LEFT JOIN users u_referrer ON p.referred_by = u_referrer.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return next(new AppError('Prospect not found', 404));
    }

    const prospect = result.rows[0];

    // Organization-wide visibility: all users can see all prospects

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

    // Organization-wide visibility: all users can update all prospects

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

export const deleteProspect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;

    // Check if prospect exists
    const checkQuery = 'SELECT * FROM prospects WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return next(new AppError('Prospect not found', 404));
    }

    const prospect = checkResult.rows[0];

    // Delete prospect (CASCADE will handle related pre_talks and activity_logs)
    const deleteQuery = 'DELETE FROM prospects WHERE id = $1 RETURNING id, name';
    const result = await pool.query(deleteQuery, [id]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, meta) VALUES ($1, $2, $3)',
      [
        req.userId,
        'prospect_deleted',
        JSON.stringify({ prospect_name: prospect.name, prospect_id: id }),
      ]
    );

    res.json({ 
      success: true, 
      message: 'Prospect deleted successfully',
      deletedProspect: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

