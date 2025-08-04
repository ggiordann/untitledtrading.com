import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, getQuery } from '../../../../../lib/database-vercel';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, actualDurationSeconds } = await request.json();
    const params = await context.params;
    const sessionId = parseInt(params.id);

    // Verify session belongs to user
    const studySession = await getQuery(
      'SELECT * FROM study_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, session.user.id]
    );

    if (!studySession) {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    if (status === 'completed') {
      const now = new Date().toISOString();
      
      // Use the actual duration from frontend (in seconds), convert to minutes
      const durationMinutes = actualDurationSeconds ? Math.floor(actualDurationSeconds / 60) : 0;
      
      console.log('PATCH - Actual duration from frontend:', actualDurationSeconds, 'seconds =', durationMinutes, 'minutes');

      // Update session
      await runQuery(
        'UPDATE study_sessions SET status = $1, end_time = $2, duration_minutes = $3 WHERE id = $4',
        ['completed', now, durationMinutes, sessionId]
      );

      // Update user status back to "Available"
      await runQuery(
        'UPDATE users SET status = $1 WHERE id = $2',
        ['Available', session.user.id]
      );

      // Update productivity stats based on session type
      const sessionHours = durationMinutes / 60;
      const today = new Date().toISOString().split('T')[0];

      // Check if stats exist for today and update study_hours only
      const existingStats = await getQuery(
        'SELECT * FROM productivity_stats WHERE user_id = $1 AND date = $2',
        [session.user.id, today]
      );

      if (existingStats) {
        await runQuery(
          'UPDATE productivity_stats SET study_hours = study_hours + $1 WHERE id = $2',
          [sessionHours, existingStats.id]
        );
      } else {
        await runQuery(
          'INSERT INTO productivity_stats (user_id, date, study_hours) VALUES ($1, $2, $3)',
          [session.user.id, today, sessionHours]
        );
      }

      // Update leaderboard stats
      const points = Math.floor(sessionHours * 20); // 20 points per hour
      // Check if leaderboard entry exists
      const existingLeaderboard = await getQuery(
        'SELECT * FROM leaderboard_stats WHERE user_id = $1',
        [session.user.id]
      );
      if (existingLeaderboard) {
        await runQuery(
          `UPDATE leaderboard_stats
           SET total_study_hours = total_study_hours + $1,
               points = points + $2,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $3`,
          [sessionHours, points, session.user.id]
        );
      } else {
        await runQuery(
          `INSERT INTO leaderboard_stats
           (user_id, total_study_hours, points, last_updated)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
          [session.user.id, sessionHours, points]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
