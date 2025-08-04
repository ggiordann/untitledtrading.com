import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '../../../../lib/database-vercel';

export async function POST(request: NextRequest) {
  // Only allow in development or with a secret key
  const secret = request.headers.get('x-migration-secret');
  if (process.env.NODE_ENV === 'production' && secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
  }
}
