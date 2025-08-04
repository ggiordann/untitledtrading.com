
import { NextResponse } from 'next/server';
import { runQuery, allQuery } from '@/lib/database-vercel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function fetchWithAuth(url: string, session: any) {
  const response = await fetch(url, {
    headers: {
      'Cookie': `next-auth.session-token=${session.accessToken}`
    }
  });
  return response.json();
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subjects = await allQuery('SELECT * FROM subjects');
    const activeSession = await allQuery('SELECT * FROM study_sessions WHERE user_id = ? AND status = ?', [session.user.id, 'active']);
    const activeSessions = await allQuery('SELECT * FROM study_sessions WHERE status = ?', ['active']);

    // Since we can't easily call the last.fm endpoint from here, 
    // we'll let the client fetch that one separately.

    return NextResponse.json({
      subjects,
      activeSession: activeSession[0] || null,
      activeSessions
    });
  } catch (error) {
    console.error('Error fetching initial study data:', error);
    return NextResponse.json({ error: 'Failed to fetch initial study data' }, { status: 500 });
  }
}
