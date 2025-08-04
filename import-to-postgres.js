const { Pool } = require('pg');
const fs = require('fs');

// Use the same connection as the app
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function importData() {
  try {
    // Read the SQL export
    const sqlData = fs.readFileSync('./database-export.sql', 'utf8');
    
    // Split into individual INSERT statements
    const statements = sqlData.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.startsWith('INSERT')) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed statement ${i + 1}`);
        } catch (error) {
          if (error.code === '23505') {
            console.log(`⚠️  Skipped duplicate: statement ${i + 1}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Verify import
    const subjectsCount = await pool.query('SELECT COUNT(*) FROM subjects');
    const lastfmCount = await pool.query('SELECT COUNT(*) FROM lastfm_users');
    
    console.log('\n📊 Import Summary:');
    console.log(`Subjects: ${subjectsCount.rows[0].count}`);
    console.log(`Last.fm users: ${lastfmCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

importData();
