import { initDatabase } from '../lib/database-vercel';

async function runInit() {
  try {
    await initDatabase();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

runInit();