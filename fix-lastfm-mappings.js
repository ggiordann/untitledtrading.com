const Database = require('better-sqlite3');
const path = require('path');

// Path to your SQLite database
const dbPath = path.join(__dirname, 'lib', 'database.db');
const db = new Database(dbPath);

try {
  // Clear existing mappings
  db.prepare('DELETE FROM lastfm_users').run();
  console.log('✅ Cleared existing Last.fm mappings');
  
  // Add correct mappings
  const mappings = [
    ['giordan', 'ggiordann'],
    ['kalan', 'tweox'],
    ['ghazi', 'guss40']
  ];
  
  for (const [username, lastfm_username] of mappings) {
    const result = db.prepare(`
      INSERT INTO lastfm_users (username, lastfm_username, created_at) 
      VALUES (?, ?, datetime('now'))
    `).run(username, lastfm_username);
    
    console.log(`✅ Added ${username} → ${lastfm_username}`);
  }
  
  // Show final mappings
  const allUsers = db.prepare('SELECT * FROM lastfm_users ORDER BY id').all();
  console.log('\nFinal Last.fm user mappings:');
  allUsers.forEach(user => {
    console.log(`  ${user.username} → ${user.lastfm_username}`);
  });
  
} catch (error) {
  console.error('❌ Error fixing mappings:', error);
} finally {
  db.close();
}
