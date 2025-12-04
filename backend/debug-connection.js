// Debug database connection
require('dotenv').config();
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;

console.log('🔍 Debugging Database Connection\n');
console.log('Connection String Analysis:');
console.log('============================');

// Parse the URL
const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (match) {
  const [, username, password, host, port, database] = match;
  console.log('Username:', username);
  console.log('Password:', password.substring(0, 3) + '***');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('Database:', database);
} else {
  console.log('❌ Could not parse connection string');
  console.log('URL:', url.replace(/:[^:@]+@/, ':****@'));
}

console.log('\n📋 Connection String Format Check:');
console.log('============================');

// Check if it's pooler format
if (url.includes('pooler.supabase.com')) {
  console.log('✅ Using pooler (correct)');
} else if (url.includes('supabase.co')) {
  console.log('❌ Using direct connection (wrong - not IPv4 compatible)');
} else {
  console.log('⚠️  Unknown format');
}

// Check port
if (url.includes(':6543/')) {
  console.log('✅ Port 6543 (pooler port - correct)');
} else if (url.includes(':5432/')) {
  console.log('❌ Port 5432 (direct connection - wrong)');
} else {
  console.log('⚠️  Port not found');
}

// Check username format
if (url.includes('postgres.qonzohurhiasaudqubdn')) {
  console.log('✅ Username includes project ref (correct for pooler)');
} else if (url.includes('postgres:')) {
  console.log('⚠️  Username is just "postgres" (might need project ref)');
} else {
  console.log('⚠️  Unknown username format');
}

console.log('\n🧪 Testing Connection...');
console.log('============================\n');

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

pool.query('SELECT NOW()')
  .then((result) => {
    console.log('✅ SUCCESS! Database connected!');
    console.log('Server time:', result.rows[0].now);
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\nThis error means:');
      console.error('1. Wrong username format');
      console.error('2. Wrong region in hostname');
      console.error('3. Wrong password');
      console.error('4. Project might be paused/deleted');
      console.error('\n📋 What to check:');
      console.error('- Go to Supabase Dashboard > Settings > Database');
      console.error('- Click "Connection pooling" tab');
      console.error('- Make sure you copy the EXACT connection string');
      console.error('- Username should be: postgres.[PROJECT-REF]');
      console.error('- Host should be: aws-0-[REGION].pooler.supabase.com');
      console.error('- Port should be: 6543');
    } else if (error.message.includes('password')) {
      console.error('\nPassword authentication failed');
      console.error('Check that your password is correct');
    } else if (error.message.includes('ENETUNREACH') || error.message.includes('timeout')) {
      console.error('\nNetwork connection issue');
      console.error('Make sure you\'re using the pooler (port 6543), not direct (5432)');
    }
    
    pool.end();
    process.exit(1);
  });

