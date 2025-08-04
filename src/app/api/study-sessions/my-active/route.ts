import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { getQuery } from '../../../../../lib/database-vercel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active session
    const activeSession = await getQuery(`
      SELECT ss.*, u.username 
      FROM study_sessions ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.user_id = (SELECT id FROM users WHERE username = ?) 
      AND ss.status = "active"
    `, [session.user.username]);

    return NextResponse.json({ session: activeSession || null });
  } catch (error) {
    console.error('Error fetching user active session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
