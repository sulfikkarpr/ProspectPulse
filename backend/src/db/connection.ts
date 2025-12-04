import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Parse DATABASE_URL and force IPv4 if needed
let connectionString = process.env.DATABASE_URL;

// For Supabase, use the connection pooler with IPv4
// Replace IPv6 addresses or use the pooler URL
if (connectionString.includes('supabase.co')) {
  // Use the pooler connection string (port 6543) instead of direct (port 5432)
  // This avoids IPv6 issues
  connectionString = connectionString.replace(':5432/', ':6543/');
  // Or if it's already using pooler, ensure it's using IPv4
  if (!connectionString.includes('pooler')) {
    // Try to convert to pooler URL
    connectionString = connectionString.replace('@db.', '@aws-0-');
    connectionString = connectionString.replace('.supabase.co:5432', '.pooler.supabase.com:6543');
  }
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Supabase requires SSL
  },
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  console.error('Connection string (masked):', connectionString.replace(/:[^:@]+@/, ':****@'));
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection test successful');
  })
  .catch((err) => {
    console.error('❌ Database connection test failed:', err.message);
    console.error('💡 Tip: Check your DATABASE_URL in backend/.env');
    console.error('💡 For Supabase, use the connection pooler URL (port 6543)');
  });

export default pool;

