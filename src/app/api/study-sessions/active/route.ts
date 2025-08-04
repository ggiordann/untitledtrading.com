import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { allQuery } from '../../../../../lib/database-vercel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active study sessions with usernames
    const activeSessions = await allQuery(`
      SELECT ss.*, u.username 
      FROM study_sessions ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.status = 'active'
      ORDER BY ss.start_time DESC
    `);

    return NextResponse.json(activeSessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
