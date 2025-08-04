import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { allQuery } from '../../../../lib/database-vercel';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';

    let query;

    if (period === 'weekly') {
      query = `
        SELECT 
          u.id,
          u.username,
          u.status,
          u.notes,
          COALESCE(SUM(ps.study_hours), 0) as total_study_hours,
          COALESCE(SUM(ps.tasks_completed), 0) as total_tasks_completed,
          COALESCE(ls.current_streak, 0) as current_streak,
          COALESCE(ls.longest_streak, 0) as longest_streak,
          COALESCE(ls.level, 1) as level,
          COALESCE(ls.points, 0) as points
        FROM users u
        LEFT JOIN leaderboard_stats ls ON u.id = ls.user_id
        LEFT JOIN productivity_stats ps ON u.id = ps.user_id 
          AND ps.date >= date('now', '-7 days')
        GROUP BY u.id, u.username, u.status, u.notes, ls.current_streak, ls.longest_streak, ls.level, ls.points
        ORDER BY COALESCE(SUM(ps.study_hours), 0) DESC, COALESCE(SUM(ps.tasks_completed), 0) DESC
      `;
    } else if (period === 'monthly') {
      query = `
        SELECT 
          u.id,
          u.username,
          u.status,
          u.notes,
          COALESCE(SUM(ps.study_hours), 0) as total_study_hours,
          COALESCE(SUM(ps.tasks_completed), 0) as total_tasks_completed,
          COALESCE(ls.current_streak, 0) as current_streak,
          COALESCE(ls.longest_streak, 0) as longest_streak,
          COALESCE(ls.level, 1) as level,
          COALESCE(ls.points, 0) as points
        FROM users u
        LEFT JOIN leaderboard_stats ls ON u.id = ls.user_id
        LEFT JOIN productivity_stats ps ON u.id = ps.user_id 
          AND ps.date >= date('now', '-30 days')
        GROUP BY u.id, u.username, u.status, u.notes, ls.current_streak, ls.longest_streak, ls.level, ls.points
        ORDER BY COALESCE(SUM(ps.study_hours), 0) DESC, COALESCE(SUM(ps.tasks_completed), 0) DESC
      `;
    } else {
      query = `
        SELECT 
          u.id,
          u.username,
          u.status,
          u.notes,
          COALESCE(ls.total_study_hours, 0) as total_study_hours,
          COALESCE(ls.total_tasks_completed, 0) as total_tasks_completed,
          COALESCE(ls.current_streak, 0) as current_streak,
          COALESCE(ls.longest_streak, 0) as longest_streak,
          COALESCE(ls.level, 1) as level,
          COALESCE(ls.points, 0) as points
        FROM users u
        LEFT JOIN leaderboard_stats ls ON u.id = ls.user_id
        ORDER BY COALESCE(ls.total_study_hours, 0) DESC, COALESCE(ls.points, 0) DESC
      `;
    }

    const leaderboard = await allQuery(query);
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
