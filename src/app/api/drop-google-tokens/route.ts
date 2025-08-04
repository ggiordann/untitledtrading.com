import { NextResponse } from 'next/server';
import { runQuery } from '../../../../lib/database-vercel';

export async function GET() {
  try {
    await runQuery('DROP TABLE IF EXISTS google_tokens');
    return NextResponse.json({ message: 'google_tokens table dropped successfully' });
  } catch (error) {
    console.error('Error dropping google_tokens table:', error);
    return NextResponse.json({ error: 'Failed to drop google_tokens table' }, { status: 500 });
  }
}