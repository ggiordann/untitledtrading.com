import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '../../../../lib/database-vercel';

export async function POST(request: NextRequest) {
  try {
    // Add current_playlist column to users table if it doesn't exist
    await runQuery(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS current_playlist TEXT
    `);

    console.log('Added current_playlist column to users table');
    
    return NextResponse.json({ message: 'Column migration completed successfully' });
  } catch (error) {
    console.error('Column migration error:', error);
    return NextResponse.json({ error: 'Column migration failed' }, { status: 500 });
  }
}
