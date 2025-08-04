import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'database.db');
const db = new Database(dbPath);

// Ensure WAL mode for better performance
db.pragma('journal_mode = WAL');

export const runQuery = (query: string, params: any[] = []): any => {
  try {
    const stmt = db.prepare(query);
    return stmt.run(...params);
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
};

export const getQuery = (query: string, params: any[] = []): any => {
  try {
    const stmt = db.prepare(query);
    return stmt.get(...params);
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
};

export const allQuery = (query: string, params: any[] = []): any[] => {
  try {
    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (error) {
    console.error('Database all error:', error);
    throw error;
  }
};

// Close database connection on process exit
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
