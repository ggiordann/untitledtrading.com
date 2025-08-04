import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { allQuery } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';

    let query = `
      SELECT 
        u.id,
        u.username,
        u.status,
        u.notes,
        COALESCE(MAX(ls.total_study_hours), 0) as total_study_hours,
        COALESCE(MAX(ls.total_tasks_completed), 0) as total_tasks_completed,
        COALESCE(MAX(ls.current_streak), 0) as current_streak,
        COALESCE(MAX(ls.longest_streak), 0) as longest_streak,
        COALESCE(MAX(ls.level), 1) as level,
        COALESCE(MAX(ls.points), 0) as points
      FROM users u
      LEFT JOIN leaderboard_stats ls ON u.id = ls.user_id
      GROUP BY u.id, u.username, u.status, u.notes
    `;

    if (period === 'weekly') {
      query += `
        LEFT JOIN (
          SELECT 
            user_id,
            SUM(study_hours) as week_study_hours,
            SUM(tasks_completed) as week_tasks
          FROM productivity_stats 
          WHERE date >= date('now', '-7 days')
          GROUP BY user_id
        ) ws ON u.id = ws.user_id
        ORDER BY COALESCE(MAX(ws.week_study_hours), 0) DESC, COALESCE(MAX(ws.week_tasks), 0) DESC
      `;
    } else if (period === 'monthly') {
      query += `
        LEFT JOIN (
          SELECT 
            user_id,
            SUM(study_hours) as month_study_hours,
            SUM(tasks_completed) as month_tasks
          FROM productivity_stats 
          WHERE date >= date('now', '-30 days')
          GROUP BY user_id
        ) ms ON u.id = ms.user_id
        ORDER BY COALESCE(MAX(ms.month_study_hours), 0) DESC, COALESCE(MAX(ms.month_tasks), 0) DESC
      `;
    } else {
      query += ' ORDER BY MAX(ls.points) DESC, MAX(ls.total_study_hours) DESC';
    }

    const leaderboard = await allQuery(query);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
