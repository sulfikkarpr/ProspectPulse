// Quick test script to verify OAuth setup
require('dotenv').config();
const { google } = require('googleapis');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

console.log('🔍 Checking OAuth Configuration...\n');

if (!GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is missing');
} else {
  console.log('✅ GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}

if (!GOOGLE_CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_SECRET is missing');
} else {
  console.log('✅ GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET.substring(0, 10) + '...');
}

if (!GOOGLE_REDIRECT_URI) {
  console.error('❌ GOOGLE_REDIRECT_URI is missing');
} else {
  console.log('✅ GOOGLE_REDIRECT_URI:', GOOGLE_REDIRECT_URI);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing');
} else {
  console.log('✅ DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing');
} else {
  console.log('✅ JWT_SECRET:', process.env.JWT_SECRET.substring(0, 10) + '...');
}

console.log('\n📋 Next steps:');
console.log('1. Make sure all environment variables are set correctly');
console.log('2. Verify your Google OAuth redirect URI matches:', GOOGLE_REDIRECT_URI);
console.log('3. Check that you added yourself as a test user in Google Cloud Console');
console.log('4. Restart the backend server and try again');

