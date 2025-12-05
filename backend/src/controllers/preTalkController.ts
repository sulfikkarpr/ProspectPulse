import { Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createCalendarEventWithMeet, updateCalendarEvent, deleteCalendarEvent } from '../services/google-calendar';
import { z } from 'zod';

const createPreTalkSchema = z.object({
  prospect_id: z.string().uuid('Invalid prospect ID'),
  mentor_id: z.string().uuid('Invalid mentor ID'),
  scheduled_at: z.string().refine((val) => {
    // Accept both ISO datetime and datetime-local format (YYYY-MM-DDTHH:mm)
    const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    const localDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return isoDate.test(val) || localDate.test(val);
  }, {
    message: 'Invalid date format. Expected ISO datetime or datetime-local format (YYYY-MM-DDTHH:mm)',
  }),
});

const updatePreTalkSchema = z.object({
  scheduled_at: z.string().refine((val) => {
    if (!val) return true; // Optional field
    const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
    const localDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return isoDate.test(val) || localDate.test(val);
  }, {
    message: 'Invalid date format',
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'canceled']).optional(),
});

export const createPreTalk = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const validated = createPreTalkSchema.parse(req.body);

    // Verify prospect exists and user has access
    const prospectQuery = 'SELECT * FROM prospects WHERE id = $1';
    const prospectResult = await pool.query(prospectQuery, [validated.prospect_id]);

    if (prospectResult.rows.length === 0) {
      return next(new AppError('Prospect not found', 404));
    }

    const prospect = prospectResult.rows[0];

    // Organization-wide visibility: all users can schedule pre-talks for any prospect

    // Verify mentor exists
    const mentorQuery = 'SELECT * FROM users WHERE id = $1 AND role IN ($2, $3)';
    const mentorResult = await pool.query(mentorQuery, [validated.mentor_id, 'mentor', 'admin']);

    if (mentorResult.rows.length === 0) {
      return next(new AppError('Mentor not found', 404));
    }

    const mentor = mentorResult.rows[0];

    // Get current user email for calendar event
    const userQuery = 'SELECT email, name FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.userId]);
    const currentUser = userResult.rows[0];

    // Parse and convert datetime-local format to ISO if needed
    let scheduledAt: Date;
    if (validated.scheduled_at.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      // datetime-local format (YYYY-MM-DDTHH:mm) - add seconds and treat as local time
      scheduledAt = new Date(validated.scheduled_at + ':00');
    } else {
      // ISO format - parse directly
      scheduledAt = new Date(validated.scheduled_at);
    }

    // Validate the date is valid
    if (isNaN(scheduledAt.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    const endTime = new Date(scheduledAt.getTime() + 60 * 60 * 1000); // 1 hour duration

    const { eventId, meetLink } = await createCalendarEventWithMeet({
      summary: `Pre-Talk: ${prospect.name}`,
      description: `Pre-talk session with ${prospect.name}\n\nProspect Details:\nPhone: ${prospect.phone || 'N/A'}\nEmail: ${prospect.email || 'N/A'}\nCity: ${prospect.city || 'N/A'}`,
      startTime: scheduledAt,
      endTime,
      attendeeEmails: [mentor.email, currentUser.email].filter(Boolean),
      userId: req.userId,
    });

    // Create pre-talk record
    const insertQuery = `
      INSERT INTO pre_talks (
        prospect_id, mentor_id, scheduled_at, calendar_event_id, meet_link, status
      )
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      validated.prospect_id,
      validated.mentor_id,
      scheduledAt,
      eventId,
      meetLink,
    ]);

    const preTalk = result.rows[0];

    // Update prospect status
    await pool.query(
      'UPDATE prospects SET status = $1, updated_at = NOW() WHERE id = $2',
      ['pre_talk_scheduled', validated.prospect_id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, prospect_id, action, meta) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        validated.prospect_id,
        'pre_talk_scheduled',
        JSON.stringify({
          pre_talk_id: preTalk.id,
          mentor_id: validated.mentor_id,
          scheduled_at: validated.scheduled_at,
        }),
      ]
    );

    res.status(201).json(preTalk);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getPreTalks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { prospect_id, mentor_id, status } = req.query;

    let query = `
      SELECT pt.*, 
             p.name as prospect_name,
             u.name as mentor_name,
             u.email as mentor_email
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      LEFT JOIN users u ON pt.mentor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.userRole === 'member') {
      paramCount++;
      query += ` AND p.created_by = $${paramCount}`;
      params.push(req.userId);
    }

    if (prospect_id) {
      paramCount++;
      query += ` AND pt.prospect_id = $${paramCount}`;
      params.push(prospect_id);
    }

    if (mentor_id) {
      paramCount++;
      query += ` AND pt.mentor_id = $${paramCount}`;
      params.push(mentor_id);
    }

    if (status) {
      paramCount++;
      query += ` AND pt.status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY pt.scheduled_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getPreTalkById = async (
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
      SELECT pt.*, 
             p.name as prospect_name,
             p.phone as prospect_phone,
             p.email as prospect_email,
             u.name as mentor_name,
             u.email as mentor_email
      FROM pre_talks pt
      LEFT JOIN prospects p ON pt.prospect_id = p.id
      LEFT JOIN users u ON pt.mentor_id = u.id
      WHERE pt.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return next(new AppError('Pre-talk not found', 404));
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updatePreTalk = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;
    const validated = updatePreTalkSchema.parse(req.body);

    // Get existing pre-talk
    const getQuery = 'SELECT * FROM pre_talks WHERE id = $1';
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return next(new AppError('Pre-talk not found', 404));
    }

    const preTalk = getResult.rows[0];

    // Check permissions - get prospect to verify
    const prospectQuery = 'SELECT * FROM prospects WHERE id = $1';
    const prospectResult = await pool.query(prospectQuery, [preTalk.prospect_id]);
    const prospect = prospectResult.rows[0];

    // Organization-wide visibility: all users can access all pre-talks

    // Update calendar event if scheduled_at changed
    if (validated.scheduled_at && preTalk.calendar_event_id) {
      // Parse and convert datetime-local format to ISO if needed
      let newScheduledAt: Date;
      if (validated.scheduled_at.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        // datetime-local format - add seconds and treat as local time
        newScheduledAt = new Date(validated.scheduled_at + ':00');
      } else {
        // ISO format - parse directly
        newScheduledAt = new Date(validated.scheduled_at);
      }

      if (isNaN(newScheduledAt.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }

      const newEndTime = new Date(newScheduledAt.getTime() + 60 * 60 * 1000);

      await updateCalendarEvent(
        preTalk.calendar_event_id,
        req.userId,
        {
          startTime: newScheduledAt,
          endTime: newEndTime,
        }
      );
    }

    // Build update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (validated.scheduled_at) {
      // Parse and convert datetime-local format if needed
      let scheduledAt: Date;
      if (validated.scheduled_at.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        scheduledAt = new Date(validated.scheduled_at + ':00');
      } else {
        scheduledAt = new Date(validated.scheduled_at);
      }

      if (isNaN(scheduledAt.getTime())) {
        return next(new AppError('Invalid date format', 400));
      }

      paramCount++;
      updateFields.push(`scheduled_at = $${paramCount}`);
      values.push(scheduledAt);
    }

    if (validated.notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      values.push(validated.notes);
    }

    if (validated.status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      values.push(validated.status);
    }

    if (updateFields.length === 0) {
      return res.json(preTalk);
    }

    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `UPDATE pre_talks SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(updateQuery, values);

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, prospect_id, action, meta) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        preTalk.prospect_id,
        'pre_talk_updated',
        JSON.stringify({ pre_talk_id: id, changes: validated }),
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

export const completePreTalk = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;
    const { notes, interest_level, objections, next_steps } = req.body;

    // Get existing pre-talk
    const getQuery = 'SELECT * FROM pre_talks WHERE id = $1';
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return next(new AppError('Pre-talk not found', 404));
    }

    const preTalk = getResult.rows[0];

    // Check permissions
    const prospectQuery = 'SELECT * FROM prospects WHERE id = $1';
    const prospectResult = await pool.query(prospectQuery, [preTalk.prospect_id]);
    const prospect = prospectResult.rows[0];

    // Organization-wide visibility: all users can access all pre-talks

    // Update pre-talk
    const updateQuery = `
      UPDATE pre_talks 
      SET status = 'completed', 
          notes = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      JSON.stringify({
        notes: notes || '',
        interest_level: interest_level || null,
        objections: objections || null,
        next_steps: next_steps || null,
      }),
      id,
    ]);

    // Update prospect status
    await pool.query(
      'UPDATE prospects SET status = $1, updated_at = NOW() WHERE id = $2',
      ['follow_up', preTalk.prospect_id]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, prospect_id, action, meta) VALUES ($1, $2, $3, $4)',
      [
        req.userId,
        preTalk.prospect_id,
        'pre_talk_completed',
        JSON.stringify({
          pre_talk_id: id,
          interest_level,
          objections,
        }),
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

