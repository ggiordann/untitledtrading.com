const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database file in lib directory
const dbPath = path.join(process.cwd(), 'lib', 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables
db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'Available',
    notes TEXT DEFAULT '',
    current_playlist TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  // Tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    due_date DATETIME,
    status TEXT DEFAULT 'not_started',
    subject TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Calendar events table
  db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Chat messages table
  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Productivity stats table
  db.run(`CREATE TABLE IF NOT EXISTS productivity_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    study_hours REAL DEFAULT 0,
    workout_minutes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert default users with hashed passwords
  const users = [
    { username: 'giordan', password: 'rgk1giordan1!' },
    { username: 'ghazi', password: 'rgk2ghazi2!' },
    { username: 'kalan', password: 'rgk3kalan3!' },
    { username: 'asad', password: 'rgk4asad4!' }
  ];

  const saltRounds = 12;
  let userCount = 0;
  
  users.forEach(user => {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }
      
      db.run(
        'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
        [user.username, hash],
        function(err) {
          if (err) {
            console.error('Error inserting user:', err);
          } else {
            console.log(`User ${user.username} inserted with ID: ${this.lastID}`);
          }
          
          userCount++;
          if (userCount === users.length) {
            // Close database connection after all users are inserted
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err);
              } else {
                console.log('Database operations completed successfully');
              }
            });
          }
        }
      );
    });
  });
});
