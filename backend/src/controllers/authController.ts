import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { getAuthUrl, getTokensFromCode, getUserInfo } from '../services/google-oauth';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getAuthUrlHandler = (req: Request, res: Response) => {
  try {
    const url = getAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

export const callbackHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return next(new AppError('Authorization code is required', 400));
    }

    console.log('Step 1: Exchanging code for tokens...');
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token) {
      console.error('No access token received');
      return next(new AppError('Failed to get access token', 500));
    }

    console.log('Step 2: Getting user info from Google...');
    // Get user info from Google
    const userInfo = await getUserInfo(tokens.access_token);
    console.log('User info received:', { email: userInfo.email, name: userInfo.name });

    if (!userInfo.googleId || !userInfo.email) {
      console.error('Invalid user info received:', userInfo);
      return next(new AppError('Failed to get user information from Google', 500));
    }

    console.log('Step 3: Checking database for existing user...');
    // Find or create user in database
    let user;
    const findUserQuery = 'SELECT * FROM users WHERE google_id = $1 OR email = $2';
    const findResult = await pool.query(findUserQuery, [userInfo.googleId, userInfo.email]);

    if (findResult.rows.length > 0) {
      console.log('Step 4: Updating existing user...');
      // Update existing user
      user = findResult.rows[0];
      const updateQuery = `
        UPDATE users 
        SET google_id = $1, name = $2, avatar_url = $3, refresh_token = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [
        userInfo.googleId,
        userInfo.name,
        userInfo.picture,
        tokens.refresh_token || user.refresh_token,
        user.id,
      ]);
      user = updateResult.rows[0];
    } else {
      console.log('Step 4: Creating new user...');
      // Create new user (default role: member)
      const insertQuery = `
        INSERT INTO users (google_id, name, email, avatar_url, refresh_token, role)
        VALUES ($1, $2, $3, $4, $5, 'member')
        RETURNING *
      `;
      const insertResult = await pool.query(insertQuery, [
        userInfo.googleId,
        userInfo.name,
        userInfo.email,
        userInfo.picture,
        tokens.refresh_token,
      ]);
      user = insertResult.rows[0];
    }

    console.log('Step 5: Generating JWT token...');
    // Generate JWT token
    const token = generateToken(user.id, user.role);

    console.log('Step 6: Redirecting to frontend...');
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error: any) {
    console.error('OAuth callback error details:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    next(new AppError(`Authentication failed: ${error.message || 'Unknown error'}`, 500));
  }
};

export const getMeHandler = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const query = 'SELECT id, name, email, avatar_url, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [req.userId]);

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(new AppError('Failed to get user info', 500));
  }
};

