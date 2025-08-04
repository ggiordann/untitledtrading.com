const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'lib', 'database.db');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT * FROM lastfm_users').all();
  console.log('Current lastfm_users records:', users.length);
  users.forEach(user => {
    console.log(`  ID: ${user.id}, ${user.username} → ${user.lastfm_username}`);
  });
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
