import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validate environment variables with detailed error messages
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  const missing = [];
  if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI');
  
  console.error('❌ Missing Google OAuth environment variables:', missing.join(', '));
  throw new Error(`Missing Google OAuth environment variables: ${missing.join(', ')}`);
}

// Log configuration status (without exposing secrets)
console.log('✅ Google OAuth Configuration:');
console.log('   Client ID:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'MISSING');
console.log('   Client Secret:', GOOGLE_CLIENT_SECRET ? `${GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : 'MISSING');
console.log('   Redirect URI:', GOOGLE_REDIRECT_URI || 'MISSING');

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export const getAuthUrl = (): string => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to get refresh token
  });
};

export const getTokensFromCode = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const getUserInfo = async (accessToken: string) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    
    const { data } = await oauth2.userinfo.get();
    
    if (!data.id || !data.email) {
      throw new Error('Invalid user data received from Google');
    }
    
    return {
      googleId: data.id,
      email: data.email,
      name: data.name || '',
      picture: data.picture || '',
    };
  } catch (error: any) {
    console.error('getUserInfo error:', error.message);
    console.error('Error details:', error.response?.data || error);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

