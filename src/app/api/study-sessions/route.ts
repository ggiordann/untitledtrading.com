import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, getQuery, allQuery } from '../../../../lib/database';

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
      'SELECT * FROM study_sessions WHERE user_id = (SELECT id FROM users WHERE username = ?) AND status = "active"',
      [session.user.username]
    );

    if (existingSession) {
      return NextResponse.json({ error: 'You already have an active study session' }, { status: 400 });
    }

    // Create new session with explicit timestamp and type
    const now = new Date().toISOString();
    const result = await runQuery(`
      INSERT INTO study_sessions (user_id, subject, duration_minutes, start_time, session_type) 
      VALUES ((SELECT id FROM users WHERE username = ?), ?, 0, ?, ?)
    `, [session.user.username, subject, now, timerType || 'study']);

    // Get the created session
    const newSession = await getQuery(`
      SELECT ss.*, u.username 
      FROM study_sessions ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.id = ?
    `, [result.lastID]);

    // Update user status to "Studying"
    await runQuery(
      'UPDATE users SET status = "Studying" WHERE username = ?',
      [session.user.username]
    );

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
