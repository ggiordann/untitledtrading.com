import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/database-vercel';

// Type definitions for exported data
interface Subject {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

interface LastfmUser {
  id: string;
  user_id: string;
  lastfm_username: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  auth_provider: string;
  google_refresh_token?: string;
  status?: string;
  last_active?: string;
  created_at: string;
}

interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  notes?: string;
  completed: boolean;
}

interface Task {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
}

interface ProductivityStat {
  id: string;
  user_id: string;
  date: string;
  study_time: number;
  tasks_completed: number;
  focus_score: number;
}

interface LeaderboardStat {
  id: string;
  user_id: string;
  total_study_time: number;
  total_tasks_completed: number;
  average_focus_score: number;
  streak_days: number;
  rank_position: number;
  last_updated: string;
}

interface CalendarEvent {
  id: string;
  user_id: string;
  google_event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

// Your exported data - replace this with the actual content from database-export.json
const exportedData: {
  subjects: Subject[];
  lastfm_users: LastfmUser[];
  users: User[];
  study_sessions: StudySession[];
  tasks: Task[];
  productivity_stats: ProductivityStat[];
  leaderboard_stats: LeaderboardStat[];
  calendar_events: CalendarEvent[];
} = {
  "subjects": [],
  "lastfm_users": [
    {
      id: "1",
      user_id: "giordan",
      lastfm_username: "ggiordann",
      created_at: "2025-08-04 02:42:14"
    },
    {
      id: "2", 
      user_id: "kalan",
      lastfm_username: "tweox",
      created_at: "2025-08-04 02:42:14"
    },
    {
      id: "3",
      user_id: "ghazi", 
      lastfm_username: "guss40",
      created_at: "2025-08-04 11:15:00"
    }
  ],
  "users": [],
  "study_sessions": [],
  "tasks": [],
  "productivity_stats": [],
  "leaderboard_stats": [],
  "calendar_events": []
};

export async function POST() {
  try {
    let imported = {
      subjects: 0,
      lastfm_users: 0,
      users: 0,
      study_sessions: 0,
      tasks: 0,
      productivity_stats: 0,
      leaderboard_stats: 0,
      calendar_events: 0
    };

    // Import subjects
    if (exportedData.subjects && exportedData.subjects.length > 0) {
      for (const subject of exportedData.subjects) {
        await runQuery(
          'INSERT INTO subjects (id, name, color, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [subject.id, subject.name, subject.color, subject.user_id]
        );
      }
      imported.subjects = exportedData.subjects.length;
    }

    // Import lastfm_users
    if (exportedData.lastfm_users && exportedData.lastfm_users.length > 0) {
      for (const user of exportedData.lastfm_users) {
        await runQuery(
          'INSERT INTO lastfm_users (id, user_id, lastfm_username, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [user.id, user.user_id, user.lastfm_username, user.created_at]
        );
      }
      imported.lastfm_users = exportedData.lastfm_users.length;
    }

    // Import users
    if (exportedData.users && exportedData.users.length > 0) {
      for (const user of exportedData.users) {
        await runQuery(
          'INSERT INTO users (id, email, name, image, auth_provider, google_refresh_token, status, last_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
          [user.id, user.email, user.name, user.image, user.auth_provider, user.google_refresh_token, user.status, user.last_active, user.created_at]
        );
      }
      imported.users = exportedData.users.length;
    }

    // Import study_sessions
    if (exportedData.study_sessions && exportedData.study_sessions.length > 0) {
      for (const session of exportedData.study_sessions) {
        await runQuery(
          'INSERT INTO study_sessions (id, user_id, subject_id, start_time, end_time, duration, notes, completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [session.id, session.user_id, session.subject_id, session.start_time, session.end_time, session.duration, session.notes, session.completed]
        );
      }
      imported.study_sessions = exportedData.study_sessions.length;
    }

    // Import tasks
    if (exportedData.tasks && exportedData.tasks.length > 0) {
      for (const task of exportedData.tasks) {
        await runQuery(
          'INSERT INTO tasks (id, user_id, subject_id, title, description, priority, due_date, completed, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
          [task.id, task.user_id, task.subject_id, task.title, task.description, task.priority, task.due_date, task.completed, task.created_at]
        );
      }
      imported.tasks = exportedData.tasks.length;
    }

    // Import productivity_stats
    if (exportedData.productivity_stats && exportedData.productivity_stats.length > 0) {
      for (const stat of exportedData.productivity_stats) {
        await runQuery(
          'INSERT INTO productivity_stats (id, user_id, date, study_time, tasks_completed, focus_score) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
          [stat.id, stat.user_id, stat.date, stat.study_time, stat.tasks_completed, stat.focus_score]
        );
      }
      imported.productivity_stats = exportedData.productivity_stats.length;
    }

    // Import leaderboard_stats
    if (exportedData.leaderboard_stats && exportedData.leaderboard_stats.length > 0) {
      for (const stat of exportedData.leaderboard_stats) {
        await runQuery(
          'INSERT INTO leaderboard_stats (id, user_id, total_study_time, total_tasks_completed, average_focus_score, streak_days, rank_position, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [stat.id, stat.user_id, stat.total_study_time, stat.total_tasks_completed, stat.average_focus_score, stat.streak_days, stat.rank_position, stat.last_updated]
        );
      }
      imported.leaderboard_stats = exportedData.leaderboard_stats.length;
    }

    // Import calendar_events
    if (exportedData.calendar_events && exportedData.calendar_events.length > 0) {
      for (const event of exportedData.calendar_events) {
        await runQuery(
          'INSERT INTO calendar_events (id, user_id, google_event_id, title, description, start_time, end_time, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [event.id, event.user_id, event.google_event_id, event.title, event.description, event.start_time, event.end_time, event.created_at]
        );
      }
      imported.calendar_events = exportedData.calendar_events.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data imported successfully',
      imported: imported
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
