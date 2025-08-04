import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { runQuery, allQuery, getQuery } from '../../../../lib/database-vercel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await allQuery(
      'SELECT * FROM productivity_stats WHERE user_id = $1 ORDER BY date DESC LIMIT 30',
      [session.user.id]
    );

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await getQuery(
      'SELECT * FROM productivity_stats WHERE user_id = $1 AND date = $2',
      [session.user.id, today]
    );

    return NextResponse.json({
      stats,
      today: todayStats || {
        tasks_completed: 0,
        study_hours: 0
      }
    });
  } catch (error) {
    console.error('Error fetching productivity stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tasks_completed, study_hours } = body;

    const today = new Date().toISOString().split('T')[0];

    // Check if today's stats already exist
    const existingStats = await getQuery(
      'SELECT * FROM productivity_stats WHERE user_id = $1 AND date = $2',
      [session.user.id, today]
    );

    let updateData: any = {};
    if (tasks_completed !== undefined) updateData.tasks_completed = tasks_completed;
    if (study_hours !== undefined) updateData.study_hours = study_hours;

    if (existingStats) {
      // Update existing record
      const setClause = Object.keys(updateData).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(updateData);
      
      await runQuery(
        `UPDATE productivity_stats SET ${setClause} WHERE user_id = $${values.length + 1} AND date = $${values.length + 2}`,
        [...values, session.user.id, today]
      );
    } else {
      // Create new record
      await runQuery(
        'INSERT INTO productivity_stats (user_id, date, tasks_completed, study_hours) VALUES ($1, $2, $3, $4)',
        [
          session.user.id,
          today,
          updateData.tasks_completed || 0,
          updateData.study_hours || 0
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating productivity stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
