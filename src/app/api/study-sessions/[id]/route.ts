import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { runQuery, getQuery } from '../../../../../lib/database';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const params = await context.params;
    const sessionId = parseInt(params.id);

    // Verify session belongs to user
    const studySession = await getQuery(
      'SELECT * FROM study_sessions WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)',
      [sessionId, session.user.username]
    );

    if (!studySession) {
      return NextResponse.json({ error: 'Study session not found' }, { status: 404 });
    }

    if (status === 'completed') {
      const now = new Date().toISOString();
      const startTime = new Date(studySession.start_time);
      const durationMinutes = Math.floor((new Date().getTime() - startTime.getTime()) / (1000 * 60));

      // Update session
      await runQuery(
        'UPDATE study_sessions SET status = ?, end_time = ?, duration_minutes = ? WHERE id = ?',
        ['completed', now, durationMinutes, sessionId]
      );

      // Update user status back to "Available"
      await runQuery(
        'UPDATE users SET status = "Available" WHERE username = ?',
        [session.user.username]
      );

      // Update productivity stats based on session type
      const sessionHours = durationMinutes / 60;
      const today = new Date().toISOString().split('T')[0];
      const isWorkout = studySession.session_type === 'workout';

      // Check if stats exist for today
      const existingStats = await getQuery(
        'SELECT * FROM productivity_stats WHERE user_id = (SELECT id FROM users WHERE username = ?) AND date = ?',
        [session.user.username, today]
      );

      if (existingStats) {
        if (isWorkout) {
          await runQuery(
            'UPDATE productivity_stats SET workout_hours = workout_hours + ? WHERE id = ?',
            [sessionHours, existingStats.id]
          );
        } else {
          await runQuery(
            'UPDATE productivity_stats SET study_hours = study_hours + ? WHERE id = ?',
            [sessionHours, existingStats.id]
          );
        }
      } else {
        if (isWorkout) {
          await runQuery(
            'INSERT INTO productivity_stats (user_id, date, workout_hours) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)',
            [session.user.username, today, sessionHours]
          );
        } else {
          await runQuery(
            'INSERT INTO productivity_stats (user_id, date, study_hours) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)',
            [session.user.username, today, sessionHours]
          );
        }
      }

      // Update leaderboard stats (only for study sessions, not workouts)
      if (!isWorkout) {
        const points = Math.floor(sessionHours * 20); // 20 points per hour
        await runQuery(`
          INSERT OR REPLACE INTO leaderboard_stats 
          (user_id, total_study_hours, points, last_updated)
          VALUES (
            (SELECT id FROM users WHERE username = ?),
            COALESCE((SELECT total_study_hours FROM leaderboard_stats WHERE user_id = (SELECT id FROM users WHERE username = ?)), 0) + ?,
            COALESCE((SELECT points FROM leaderboard_stats WHERE user_id = (SELECT id FROM users WHERE username = ?)), 0) + ?,
            CURRENT_TIMESTAMP
          )
        `, [session.user.username, session.user.username, sessionHours, session.user.username, points]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
