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
  )`);

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
    study_hours DECIMAL(4,2) DEFAULT 0.00,
    workout_minutes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Study sessions table (NEW)
  db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    playlist TEXT DEFAULT '',
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Subjects table (NEW)
  db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // User leaderboard stats (NEW)
  db.run(`CREATE TABLE IF NOT EXISTS leaderboard_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_study_hours DECIMAL(8,2) DEFAULT 0.00,
    total_tasks_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    points INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  console.log('Tables created successfully');

  // Insert default subjects
  const subjects = [
    'Specialist Math',
    'Math Methods', 
    'Physics',
    'Chemistry',
    'Headstart'
  ];

  subjects.forEach(subject => {
    db.run('INSERT OR IGNORE INTO subjects (name) VALUES (?)', [subject]);
  });

  // Insert users with hashed passwords
  const saltRounds = 12;
  const users = [
    { username: 'giordan', password: 'rgk1giordan1!' },
    { username: 'ghazi', password: 'rgk2ghazi2!' },
    { username: 'kalan', password: 'rgk3kalan3!' },
    { username: 'asad', password: 'rgk4asad4!' }
  ];

  users.forEach(user => {
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
      } else {
        // Check if user already exists
        db.get('SELECT id FROM users WHERE username = ?', [user.username], (err, row) => {
          if (err) {
            console.error('Error checking user:', err);
          } else if (!row) {
            // User doesn't exist, insert new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [user.username, hash], function(err) {
              if (err) {
                console.error('Error inserting user:', err);
              } else {
                console.log(`User ${user.username} inserted with ID: ${this.lastID}`);
                
                // Initialize leaderboard stats for new user
                db.run('INSERT INTO leaderboard_stats (user_id) VALUES (?)', [this.lastID]);
              }
            });
          }
        });
      }
    });
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialization complete');
  }
});
