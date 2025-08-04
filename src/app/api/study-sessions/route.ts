import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, getQuery, allQuery } from '../../../../lib/database-vercel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await allQuery(`
      SELECT ss.*, u.username 
      FROM study_sessions ss
      JOIN users u ON ss.user_id = u.id
      ORDER BY ss.created_at DESC
    `);
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, timerType } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // Check if user already has an active session
    const existingSession = await getQuery(
      'SELECT * FROM study_sessions WHERE user_id = $1 AND status = $2',
      [session.user.id, 'active']
    );

    if (existingSession) {
      return NextResponse.json({ error: 'You already have an active study session' }, { status: 400 });
    }

    // Create new session with current UTC timestamp
    const now = new Date().toISOString();
    const result = await runQuery(`
      INSERT INTO study_sessions (user_id, subject, duration_minutes, start_time, session_type) 
      VALUES ($1, $2, 0, $3, $4) RETURNING id
    `, [session.user.id, subject, now, timerType || 'study']);

    if (!result || result.length === 0) {
      throw new Error('Failed to create study session');
    }

    // Get the created session
    const newSession = await getQuery(`
      SELECT ss.*, u.username 
      FROM study_sessions ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.id = $1
    `, [result[0].id]);

    // Update user status to "Studying"
    await runQuery(
      'UPDATE users SET status = $1 WHERE id = $2',
      ['Studying', session.user.id]
    );

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
