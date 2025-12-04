// Test database connection with different formats
require('dotenv').config();
const { Pool } = require('pg');

const password = 'SulfiProject';
const projectRef = 'qonzohurhiasaudqubdn';

// Try different connection string formats
const connectionStrings = [
  // Format 1: Direct connection (original - might have IPv6 issues)
  `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
  
  // Format 2: Pooler with project ref in username
  `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  
  // Format 3: Pooler with project ref in username (different region)
  `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  
  // Format 4: Pooler with project ref in username (eu-west-1)
  `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
];

console.log('🔍 Testing database connection formats...\n');

async function testConnection(connectionString, index) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ Format ${index + 1} WORKS!`);
    console.log(`   Connection: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`   Server time: ${result.rows[0].now}\n`);
    await pool.end();
    return connectionString;
  } catch (error) {
    console.log(`❌ Format ${index + 1} failed: ${error.message}\n`);
    await pool.end();
    return null;
  }
}

async function testAll() {
  for (let i = 0; i < connectionStrings.length; i++) {
    const working = await testConnection(connectionStrings[i], i);
    if (working) {
      console.log('🎉 Found working connection string!');
      console.log('\n📋 Update your backend/.env file:');
      console.log(`DATABASE_URL=${working}\n`);
      process.exit(0);
    }
  }
  
  console.log('❌ None of the tested formats worked.');
  console.log('\n💡 You need to get the exact connection string from Supabase:');
  console.log('   1. Go to: https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Settings > Database');
  console.log('   4. Connection string > Connection pooling tab');
  console.log('   5. Copy the "Session mode" URL');
  console.log('   6. Replace [YOUR-PASSWORD] with: SulfiProject\n');
  process.exit(1);
}

testAll();

